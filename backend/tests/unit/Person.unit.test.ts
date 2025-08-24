import Person from '../../src/apis/models/Person';
import { jest,describe,beforeEach,test,expect } from '@jest/globals';

describe('Person Unit Tests', () => {
  let person: Person;

  beforeEach(() => {
    person = new Person('p1', 2, 5);
  });

  test('should initialize with correct properties', () => {
    expect(person.id).toBe('p1');
    expect(person.currentFloor).toBe(2);
    expect(person.destinationFloor).toBe(5);
    expect(person.direction).toBe('up');
    expect(person.state).toBe('waiting');
    expect(person.elevatorId).toBeNull();
  });

  test('updateState changes person state', () => {
    person.updateState('entering');
    expect(person.state).toBe('entering');
    person.updateState('inside');
    expect(person.state).toBe('inside');
  });

  test('getWaitTime returns elapsed time since requestTime', () => {
    jest.useFakeTimers();
    const startTime = Date.now();
    jest.setSystemTime(startTime);

    const personTest = new Person('p2', 1, 4);
    jest.advanceTimersByTime(3000);

    expect(personTest.getWaitTime()).toBeGreaterThanOrEqual(3000);

    jest.useRealTimers();
  });

  test('getSnapshot returns correct snapshot data', () => {
    person.updateState('inside');
    person.elevatorId = 3;
    const snapshot = person.getSnapshot();

    expect(snapshot.id).toBe(person.id);
    expect(snapshot.currentFloor).toBe(person.currentFloor);
    expect(snapshot.destinationFloor).toBe(person.destinationFloor);
    expect(snapshot.direction).toBe(person.direction);
    expect(snapshot.state).toBe('inside');
    expect(snapshot.elevatorId).toBe(3);
  });
});
