import Elevator from '../../src/apis/models/Elevator';
import SimulationEngine from '../../src/apis/services/SimulationEngine';
import { describe,beforeEach,test,expect } from '@jest/globals';

describe('Elevator Unit Tests', () => {
  let elevator: Elevator;
  let simulationEngine: SimulationEngine;

  beforeEach(() => {
    simulationEngine = SimulationEngine.getInstance();
    simulationEngine.reset();
    elevator = new Elevator(1, 10, simulationEngine);
  });

  test('should initialize with default values', () => {
    expect(elevator.currentFloor).toBe(1);
    expect(elevator.direction).toBe('idle');
    expect(elevator.doorState).toBe('closed');
    expect(elevator.capacity).toBe(8); // From config default
    expect(elevator.queue.length).toBe(0);
    expect(elevator.isMoving).toBe(false);
  });

  test('addToQueue should add new floor and sort queue', () => {
    elevator.addToQueue(5);
    elevator.addToQueue(3);
    expect(elevator.queue).toEqual([3, 5]);
  });

  test('updateDirection should correctly set the elevator direction', () => {
    elevator.addToQueue(3);
    elevator.updateDirection();
    expect(elevator.direction).toBe('up');

    elevator.currentFloor = 4;
    elevator.queue = [2];
    elevator.updateDirection();
    expect(elevator.direction).toBe('down');

    elevator.queue = [];
    elevator.updateDirection();
    expect(elevator.direction).toBe('idle');
  });

  test('getUtilization returns ratio of people to capacity', () => {
    // No people initially
    expect(elevator.getUtilization()).toBe(0);

    // Simulate people in elevator
    elevator.people.push({ id: 'p1', currentFloor: 1, destinationFloor: 5 } as any);
    elevator.people.push({ id: 'p2', currentFloor: 1, destinationFloor: 6 } as any);
    expect(elevator.getUtilization()).toBeCloseTo(2 / elevator.capacity);
  });

  test('reset restores elevator to initial state', () => {
    elevator.addToQueue(7);
    elevator.people.push({ id: 'p1', currentFloor: 1, destinationFloor: 5 } as any);
    elevator.currentFloor = 5;
    elevator.doorState = 'open';

    elevator.reset();

    expect(elevator.currentFloor).toBe(1);
    expect(elevator.queue.length).toBe(0);
    expect(elevator.people.length).toBe(0);
    expect(elevator.doorState).toBe('closed');
    expect(elevator.direction).toBe('idle');
  });
});
