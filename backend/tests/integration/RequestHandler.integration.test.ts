import SimulationEngine from '../../src/apis/services/SimulationEngine';
import RequestHandler from '../../src/apis/services/RequestHandler';
import Request from '../../src/apis/models/Request';
import { jest,describe,beforeEach,test,expect } from '@jest/globals';

describe('RequestHandler Integration Tests', () => {
  let simulationEngine: SimulationEngine;
  let requestHandler: RequestHandler;

  beforeEach(() => {
    simulationEngine = SimulationEngine.getInstance();
    simulationEngine.reset();
    requestHandler = simulationEngine.requestHandler;
  });

  test('generateRandomRequest generates valid requests when running', () => {
    simulationEngine.start();
    const request = requestHandler.generateRandomRequest();
    expect(request).toBeInstanceOf(Request);
    expect(requestHandler.pendingRequests.length).toBeGreaterThan(0);
    simulationEngine.stop();
  });

  test('addRequest adds request and updates waiting people', () => {
    const request = new Request(1, 5);
    requestHandler.addRequest(request);
    expect(requestHandler.pendingRequests).toContain(request);
    expect(requestHandler.waitingPeople[request.originFloor]).toContain(request.person);
  });

  test('processRequests assigns unassigned requests', () => {
    simulationEngine.start();
    const request = new Request(1, 3);
    requestHandler.addRequest(request);

    // Unassigned before process
    expect(request.assigned).toBe(false);

    requestHandler.processRequests();

    // Assigned after process
    expect(request.assigned).toBe(true);
    expect(request.elevatorId).not.toBeNull();

    simulationEngine.stop();
  });

  test('checkCompletedRequests moves completed requests to completed list', () => {
    simulationEngine.start();
    const request = new Request(1, 2);
    requestHandler.addRequest(request);
    request.assigned = true;
    request.elevatorId = 0;

    // Simulate elevator at destination with open door
    const elevator = simulationEngine.elevators[0];
    elevator.currentFloor = 2;
    elevator.doorState = 'open';

    // Override Math.random to ensure passenger exits
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    requestHandler['checkCompletedRequests']();

    expect(requestHandler.completedRequests).toContain(request);
    expect(requestHandler.pendingRequests).not.toContain(request);

    // Restore Math.random
    jest.spyOn(global.Math, 'random').mockRestore();

    simulationEngine.stop();
  });

  test('getMetrics returns correct metrics structure', () => {
    const metrics = requestHandler.getMetrics();
    expect(metrics).toHaveProperty('avgWaitTime');
    expect(metrics).toHaveProperty('maxWaitTime');
    expect(metrics).toHaveProperty('avgTravelTime');
    expect(metrics).toHaveProperty('totalRequests');
    expect(metrics).toHaveProperty('completedRequests');
  });
});
