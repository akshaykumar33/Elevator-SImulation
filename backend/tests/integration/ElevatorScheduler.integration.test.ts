import type SimulationEngine from '../../src/apis/services/SimulationEngine';
import type ElevatorScheduler from '../../src/apis/services/ElevatorScheduler';
import Request from '../../src/apis/models/Request';
import type Elevator from '../../src/apis/models/Elevator';
import { createSimulation ,createElevatorScheduler  } from '../fixtures/elevatorFixtures'
import { describe, beforeEach, test, expect } from '@jest/globals';

describe('ElevatorScheduler Integration Tests', () => {
  let simulationEngine: SimulationEngine;
  let scheduler: ElevatorScheduler;
  let elevators: Elevator[];

  beforeEach(() => {
    simulationEngine = createSimulation();
    simulationEngine.reset();
    elevators = simulationEngine.elevators;
    scheduler = createElevatorScheduler(simulationEngine);
  });

  test('assignRequest assigns using hybrid heuristic when elevator available', () => {
    const req = new Request(1, 5);
    const assignedElevator = scheduler.assignRequest(req);

    expect(assignedElevator).not.toBeNull();
    expect(req.assigned).toBe(true);
    expect(req.elevatorId).toBe(assignedElevator?.id);
    expect(assignedElevator?.queue).toContain(req.destinationFloor);
  });

  test('assignByLoadBalancing assigns to least utilized elevator', () => {
    const req = new Request(2, 6);

    // artificially load first elevator
    elevators[0].queue.push(1, 2, 3);

    const assignedElevator = scheduler.assignByLoadBalancing(req);

    expect(assignedElevator).not.toBeNull();
    expect(req.assigned).toBe(true);
    expect(req.elevatorId).toBe(assignedElevator?.id);
    expect(assignedElevator?.queue).toContain(req.originFloor);
    expect(assignedElevator?.queue).toContain(req.destinationFloor);
    expect(assignedElevator?.id).not.toBe(elevators[0].id); // should avoid heavily loaded
  });

  test('assignByLOOK assigns elevator moving toward request', () => {
    const req = new Request(3, 7);
    req.direction = 'up';

    elevators[0].currentFloor = 2;
    elevators[0].direction = 'up';
    elevators[1].currentFloor = 8;
    elevators[1].direction = 'down';

    const assignedElevator = scheduler.assignByLOOK(req);

    expect(assignedElevator).toBe(elevators[0]);
    expect(req.assigned).toBe(true);
    expect(req.elevatorId).toBe(elevators[0].id);
  });

  test('assignByFCFS falls back to shortest queue', () => {
    const req = new Request(4, 1);

    // Load elevator[0] heavily, keep elevator[1] empty
    elevators[0].queue.push(1, 2, 3, 4);

    const assignedElevator = scheduler.assignByFCFS(req);

    expect(assignedElevator).toBe(elevators[1]);
    expect(req.assigned).toBe(true);
  });

  test('assignByRoundRobin cycles across elevators', () => {
    const req1 = new Request(1, 2);
    const req2 = new Request(2, 3);

    const e1 = scheduler.assignByRoundRobin(req1);
    const e2 = scheduler.assignByRoundRobin(req2);

    expect(e1).not.toBeNull();
    expect(e2).not.toBeNull();
    expect(e1?.id).not.toBe(e2?.id); // must cycle
  });

  test('calculateHeuristicScore returns lower score for closer, idle, low-utilization elevator', () => {
    const req = new Request(1, 10);

    elevators[0].currentFloor = 1;
    elevators[0].direction = 'idle';
    elevators[0].queue = [];

    elevators[1].currentFloor = 8;
    elevators[1].direction = 'up';
    elevators[1].queue = [5, 6];

    const score0 = scheduler.calculateHeuristicScore(elevators[0], req);
    const score1 = scheduler.calculateHeuristicScore(elevators[1], req);

    expect(score0).toBeLessThan(score1);
  });

  test('optimizeElevatorPositions repositions idle elevators evenly across floors', () => {
    // Set all elevators idle and empty
    elevators.forEach(e => {
      e.direction = 'idle';
      e.queue = [];
      e.currentFloor = 1;
    });

    scheduler.optimizeElevatorPositions();

    elevators.forEach(e => {
      expect(e.queue.length).toBe(1); // got reposition target
      expect(e.queue[0]).toBeGreaterThanOrEqual(1);
      expect(e.queue[0]).toBeLessThanOrEqual(simulationEngine.config.numFloors);
    });
  });
});


