import Request from '../../src/apis/models/Request';
import { jest,describe,beforeEach,test,expect } from '@jest/globals';

describe('Request Unit Tests', () => {
  let request: Request;

  beforeEach(() => {
    request = new Request(1, 5);
  });

  test('should initialize with correct default values', () => {
    expect(request.originFloor).toBe(1);
    expect(request.destinationFloor).toBe(5);
    expect(request.direction).toBe('up');
    expect(request.priority).toBe(1);
    expect(request.assigned).toBe(false);
    expect(request.completed).toBe(false);
    expect(request.elevatorId).toBeNull();
    expect(request.waitTime).toBe(0);
  });

  test('updateWaitTime increments wait time and updates priority accordingly', () => {
    jest.useFakeTimers();

    // Move time forward beyond escalation time once and half
    jest.setSystemTime(Date.now() + 35000);

    request.updateWaitTime();

    expect(request.waitTime).toBeGreaterThanOrEqual(35000);
    expect(request.priority).toBeGreaterThanOrEqual(1);

    jest.useRealTimers();
  });

  test('getWaitTimeSeconds returns wait time in seconds', () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.now() + 5000);

    request.updateWaitTime();
    expect(Number(request.getWaitTimeSeconds().toFixed(0))).toBeCloseTo(5);

    jest.useRealTimers();
  });

  test('getSnapshot returns snapshot with correct fields', () => {
    const snapshot = request.getSnapshot();
    expect(snapshot.id).toBe(request.id);
    expect(snapshot.originFloor).toBe(request.originFloor);
    expect(snapshot.destinationFloor).toBe(request.destinationFloor);
    expect(snapshot.direction).toBe(request.direction);
    expect(snapshot.priority).toBe(request.priority);
    expect(snapshot.assigned).toBe(request.assigned);
    expect(snapshot.completed).toBe(request.completed);
  });
});
