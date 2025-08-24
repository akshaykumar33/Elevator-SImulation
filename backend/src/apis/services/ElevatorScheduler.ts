import { CONFIG } from '@/utils/config';
import type Elevator from '@/apis/models/Elevator';
import type SimulationEngine from '@/apis/services/SimulationEngine';

export default class ElevatorScheduler {
  simulationEngine: SimulationEngine;
  elevators: Elevator[];

  constructor(simulationEngine: SimulationEngine) {
    this.simulationEngine = simulationEngine;
    this.elevators = simulationEngine.elevators;
  }

  assignRequest(request: any): Elevator | null {
    const bestElevator = this.findBestElevator(request);

    if (bestElevator) {
      bestElevator.addToQueue(request.originFloor);
      bestElevator.addToQueue(request.destinationFloor);
      request.assigned = true;
      request.elevatorId = bestElevator.id;
      return bestElevator;
    }

    return null;
  }

  findBestElevator(request: any): Elevator | null {
    let bestElevator: Elevator | null = null;
    let bestScore = Infinity;

    for (const elevator of this.elevators) {
      const score = this.calculateElevatorScore(elevator, request);
      if (score < bestScore) {
        bestScore = score;
        bestElevator = elevator;
      }
    }

    return bestElevator;
  }

  calculateElevatorScore(elevator: Elevator, request: any): number {
    let score = 0;

    const distance = Math.abs(elevator.currentFloor - request.originFloor);
    score += distance * 10;

    if (elevator.direction === request.direction || elevator.direction === 'idle') {
      score -= 20; // Favor elevators going in the same direction or idle
    }

    score += elevator.getUtilization() * 30;
    score += elevator.queue.length * 15;
    score -= request.priority * 25;

    if (this.simulationEngine.config.peakTrafficMode && request.originFloor === 1) {
      score -= CONFIG.algorithmSettings.lobbyPriorityMultiplier * 10;
    }

    return score;
  }

  optimizeElevatorPositions() {
    const idleElevators = this.elevators.filter(
      e => e.direction === 'idle' && e.queue.length === 0,
    );
    if (idleElevators.length > 0) {
      const targetFloors = this.calculateOptimalPositions(idleElevators.length);
      idleElevators.forEach((elevator, idx) => {
        if (idx < targetFloors.length && elevator.currentFloor !== targetFloors[idx]) {
          elevator.addToQueue(targetFloors[idx]);
        }
      });
    }
  }

  calculateOptimalPositions(numElevators: number): number[] {
    const floors = this.simulationEngine.config.numFloors;
    const positions: number[] = [];

    for (let i = 0; i < numElevators; i++) {
      const floor = Math.round((floors / (numElevators + 1)) * (i + 1));
      positions.push(Math.max(1, Math.min(floors, floor)));
    }

    return positions;
  }
}
