import Elevator from './Elevator';
import { CONFIG } from '../../utils/config';
import SimulationEngine from './SimulationEngine';


export default class ElevatorScheduler {
  simulationEngine: SimulationEngine;
  elevators: Elevator[];
  constructor(simulationEngine: SimulationEngine) {
    this.elevators = simulationEngine.elevators;
    this.simulationEngine = simulationEngine;
  }

  assignRequest(request: any) {
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

  findBestElevator(request: any) {
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

  calculateElevatorScore(elevator: Elevator, request: any) {
    let score = 0;
    const distance = Math.abs(elevator.currentFloor - request.originFloor);
    score += distance * 10;

    if (elevator.direction === request.direction || elevator.direction === 'idle') {
      score -= 20;
    }

    score += elevator.getUtilization() * 30;
    score += elevator.queue.length * 15;
    score -= request.priority * 25;
   
    // console.log("this.store.config.peakTrafficMode:", this.simulationEngine.config.peakTrafficMode, "request.originFloor:", request.originFloor);
    if (this.simulationEngine.config.peakTrafficMode && request.originFloor === 1) {
      score -= CONFIG.algorithmSettings.lobbyPriorityMultiplier * 10;
    }

    return score;
  }

  optimizeElevatorPositions() {
    const idleElevators = this.elevators.filter(e => e.direction === 'idle' && e.queue.length === 0);

    if (idleElevators.length > 0) {
      const targetFloors = this.calculateOptimalPositions(idleElevators.length);
      idleElevators.forEach((elevator, idx) => {
        if (idx < targetFloors.length && elevator.currentFloor !== targetFloors[idx]) {
          elevator.addToQueue(targetFloors[idx]);
        }
      });
    }
  }

  calculateOptimalPositions(numElevators: number) {
    const floors = this.simulationEngine.config.numFloors;
    const positions: number[] = [];

    //  console.log("Calculating optimal positions for elevators:", numElevators, "on", floors, "floors");
    for (let i = 0; i < numElevators; i++) {
      const floor = Math.round((floors / (numElevators + 1)) * (i + 1));
      positions.push(Math.max(1, Math.min(floors, floor)));
    }

    return positions;
  }
}


