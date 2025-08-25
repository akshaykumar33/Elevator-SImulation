import { CONFIG } from '@/utils/config';
import type Elevator from '@/apis/models/Elevator';
import type SimulationEngine from '@/apis/services/SimulationEngine';
import type Request from '@/apis/models/Request';

export default class ElevatorScheduler {
  simulationEngine: SimulationEngine;
  elevators: Elevator[];
  private roundRobinIndex: number = 0;

  constructor(simulationEngine: SimulationEngine) {
    this.simulationEngine = simulationEngine;
    this.elevators = simulationEngine.elevators;
  }

  // Main assignment method with multi-level fallback
  assignRequest(request: Request): Elevator | null {
    // 1 - Try Hybrid Heuristic Approach
    const hybrid = this.assignByHybridHeuristic(request);
    if (hybrid) return hybrid;

    // 2 - Load Balancing Fallback
    const loadBalancing = this.assignByLoadBalancing(request);
    if (loadBalancing) return loadBalancing;

    // 3 - Disk scheduling inspired fallback (LOOK then FCFS)
    const diskScheduled = this.assignByDiskScheduling(request);
    if (diskScheduled) return diskScheduled;

    // 4 - Round Robin fallback
    return this.assignByRoundRobin(request);
  }

  // 1 - Hybrid heuristic assignment based on score function
  assignByHybridHeuristic(request: Request): Elevator | null {
    let bestElevator: Elevator | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const e of this.elevators) {
      if (e.getUtilization() >= 1) continue; // skip full elevators
      const score = this.calculateHeuristicScore(e, request);
      if (score < bestScore) {
        bestScore = score;
        bestElevator = e;
      }
    }
    if (bestElevator) {
      bestElevator.addToQueue(request.originFloor);
      bestElevator.addToQueue(request.destinationFloor);
      request.assigned = true;
      request.elevatorId = bestElevator.id;
      return bestElevator;
    }
    return null;
  }

  // 2 - Load balancing: pick elevator with minimum utilization + queue size
  assignByLoadBalancing(request: Request): Elevator | null {
    const candidates = this.elevators.filter(e => e.getUtilization() < 1);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const utilDiff = a.getUtilization() - b.getUtilization();
      if (utilDiff !== 0) return utilDiff;
      return a.queue.length - b.queue.length;
    });
    const chosen = candidates[0];
    chosen.addToQueue(request.originFloor);
    chosen.addToQueue(request.destinationFloor);
    request.assigned = true;
    request.elevatorId = chosen.id;
    return chosen;
  }

  // 3 - Disk scheduling inspired fallback: LOOK then FCFS
  assignByDiskScheduling(request: Request): Elevator | null {
    // -- LOOK algorithm assignment --
    const lookAssigned = this.assignByLOOK(request);
    if (lookAssigned) return lookAssigned;

    // -- FCFS fallback --
    const fcfsAssigned = this.assignByFCFS(request);
    if (fcfsAssigned) return fcfsAssigned;

    return null;
  }

  // LOOK algorithm adaptation: prefer elevators going toward the request floor and direction
  assignByLOOK(request: Request): Elevator | null {
    const candidates = this.elevators.filter(e =>
      e.getUtilization() < 1 &&
      e.direction === request.direction &&
      ((request.direction === 'up' && e.currentFloor <= request.originFloor) ||
        (request.direction === 'down' && e.currentFloor >= request.originFloor))
    );
    if (candidates.length === 0) return null;

    // Pick closest elevator by floor distance
    candidates.sort((a, b) =>
      Math.abs(a.currentFloor - request.originFloor) - Math.abs(b.currentFloor - request.originFloor)
    );
    const chosen = candidates[0];
    chosen.addToQueue(request.originFloor);
    chosen.addToQueue(request.destinationFloor);
    request.assigned = true;
    request.elevatorId = chosen.id;
    return chosen;
  }

  // FCFS fallback: pick elevator with shortest queue and available capacity
  assignByFCFS(request: Request): Elevator | null {
    const candidates = this.elevators.filter(e => e.getUtilization() < 1);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.queue.length - b.queue.length);
    const chosen = candidates[0];
    chosen.addToQueue(request.originFloor);
    chosen.addToQueue(request.destinationFloor);
    request.assigned = true;
    request.elevatorId = chosen.id;
    return chosen;
  }

  // 4 - Round robin fallback
  assignByRoundRobin(request: Request): Elevator | null {
    const candidates = this.elevators.filter(e => e.getUtilization() < 1);
    if (candidates.length === 0) return null;
    const chosen = candidates[this.roundRobinIndex % candidates.length];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % candidates.length;
    chosen.addToQueue(request.originFloor);
    chosen.addToQueue(request.destinationFloor);
    request.assigned = true;
    request.elevatorId = chosen.id;
    return chosen;
  }

  // The existing score calculation combining distance, direction, utilization, queue length, priority
  calculateHeuristicScore(elevator: Elevator, request: Request): number {
    let score = 0;
    const distance = Math.abs(elevator.currentFloor - request.originFloor);
    score += distance * 10;
    if (elevator.direction === request.direction || elevator.direction === 'idle') score -= 20;
    score += elevator.getUtilization() * 30;
    score += elevator.queue.length * 15;
    score -= request.priority * 25;
    if (this.simulationEngine.config.peakTrafficMode && request.originFloor === 1) {
      score -= CONFIG.algorithmSettings.lobbyPriorityMultiplier * 10;
    }
    return score;
  }

  // Optional: may keep your optimizer method for idle elevator repositioning
  optimizeElevatorPositions() {
    const idleElevators = this.elevators.filter(e => e.direction === 'idle' && e.queue.length === 0);
    if (idleElevators.length === 0) return;
    const positions = this.calculateOptimalPositions(idleElevators.length);
    idleElevators.forEach((elevator, idx) => {
      if (idx < positions.length && elevator.currentFloor !== positions[idx]) {
        elevator.addToQueue(positions[idx]);
      }
    });
  }

  calculateOptimalPositions(count: number): number[] {
    const floors = this.simulationEngine.config.numFloors;
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      const targetFloor = Math.round((floors / (count + 1)) * (i + 1));
      positions.push(Math.max(1, Math.min(floors, targetFloor)));
    }
    return positions;
  }
}

