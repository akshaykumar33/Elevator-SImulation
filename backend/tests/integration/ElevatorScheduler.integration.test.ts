import SimulationEngine from '../../src/apis/services/SimulationEngine';
import { describe,beforeEach,test,expect } from '@jest/globals';

describe('ElevatorScheduler Integration Tests', () => {
  let simulationEngine: SimulationEngine;

  beforeEach(() => {
    simulationEngine = SimulationEngine.getInstance();
    simulationEngine.reset();
  });

  test('assignRequest assigns an unassigned request to an elevator', () => {
    const request = {
      originFloor: 1,
      destinationFloor: 5,
      direction: 'up',
      priority: 1,
      assigned: false,
      elevatorId: null,
    };
    const assignedElevator = simulationEngine.scheduler.assignRequest(request);
    expect(assignedElevator).not.toBeNull();
    expect(request.assigned).toBe(true);
    expect(request.elevatorId).toBeDefined();
  });

  test('findBestElevator returns elevator with best score', () => {
    const request = {
      originFloor: 1,
      destinationFloor: 8,
      direction: 'up',
      priority: 1,
      assigned: false,
      elevatorId: null,
    };

    const bestElevator = simulationEngine.scheduler['findBestElevator'](request);
    expect(bestElevator).toBeDefined();
    expect(simulationEngine.elevators).toContain(bestElevator!);
  });

  test('calculateElevatorScore calculates score based on distance and direction', () => {
    const elevator = simulationEngine.elevators[0];
    const request = {
      originFloor: elevator.currentFloor,
      destinationFloor: elevator.currentFloor + 3,
      direction: 'up',
      priority: 2,
    };

    // Access private method via casting to any to test internal logic
    const score = (simulationEngine.scheduler as any).calculateElevatorScore(elevator, request);
    expect(typeof score).toBe('number');
  });

  test('optimizeElevatorPositions assigns idle elevators to optimal floors', () => {
    // Set all elevators to idle with empty queues
    simulationEngine.elevators.forEach(elevator => {
      elevator.queue = [];
      elevator.direction = 'idle';
      elevator.currentFloor = 1;
    });

    simulationEngine.scheduler.optimizeElevatorPositions();

    const targetFloors = simulationEngine.scheduler['calculateOptimalPositions'](simulationEngine.elevators.length);

    simulationEngine.elevators.forEach((elevator, idx) => {
      // Elevator should have at least 1 queued floor per optimization
      expect(elevator.queue.length).toBeGreaterThan(0);
      expect(targetFloors).toContain(elevator.queue[0]);
    });
  });
});
