import { CONFIG } from '@/utils/config';
import Request from '@/apis/models/Request';
import type SimulationEngine from "@/apis/services/SimulationEngine";
import type { MetricsSnapshot } from '@/types/types';
import { logger } from '@/apis/middlewares/logger';

export default class RequestHandler {
  pendingRequests: Request[] = [];
  completedRequests: Request[] = [];
  waitingPeople: Record<number, Request['person'][]> = {}; // floor number to people array
  requestTimer: NodeJS.Timeout | null = null;
  requestCounter = 0;

  simulationEngine: SimulationEngine;

  constructor(simulationEngine: SimulationEngine) {
    this.simulationEngine = simulationEngine;
  }

  generateRandomRequest(): Request | null {
    if (!this.simulationEngine.isRunning) return null;

    const numFloors = this.simulationEngine.config.numFloors;
    let originFloor: number;
    let destinationFloor: number;

    if (this.simulationEngine.config.peakTrafficMode && Math.random() < 0.7) {
      originFloor = 1;
      destinationFloor = Math.floor(Math.random() * (numFloors - 1)) + 2;
    } else {
      originFloor = Math.floor(Math.random() * numFloors) + 1;
      do {
        destinationFloor = Math.floor(Math.random() * numFloors) + 1;
      } while (destinationFloor === originFloor);
    }

    const request = new Request(originFloor, destinationFloor);
    this.addRequest(request);
    logger.info(`Generated request: Floor ${originFloor} → ${destinationFloor}`);
    return request;
  }

  addRequest(request: Request) {
    this.pendingRequests.push(request);
    this.requestCounter++;

    if (!this.waitingPeople[request.originFloor]) {
      this.waitingPeople[request.originFloor] = [];
    }

    if (this.waitingPeople[request.originFloor].length < CONFIG.personSettings.maxPeoplePerFloor) {
      this.waitingPeople[request.originFloor].push(request.person);
    }
    this.simulationEngine.updateFloorPanel(request.originFloor, request.direction, true);
    this.simulationEngine.updateFloorWaitingArea(request.originFloor);
  }

  getWaitingPeopleAtFloor(floor: number): Request['person'][] {
    return this.waitingPeople[floor] || [];
  }

  removeWaitingPerson(person: Request['person']) {
    if (!this.waitingPeople[person.currentFloor]) return;
    this.waitingPeople[person.currentFloor] = this.waitingPeople[person.currentFloor].filter(
      p => p.id !== person.id,
    );
  }

  processRequests() {
    if (!this.simulationEngine.isRunning) return;

    this.pendingRequests.forEach(req => req.updateWaitTime());

    // Sort by descending priority, then waitTime
    this.pendingRequests.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.waitTime - a.waitTime;
    });

    // Assign unassigned requests to elevators
    const unassigned = this.pendingRequests.filter(r => !r.assigned);
    unassigned.forEach(request => {
      let elevator = null;
      if (this.simulationEngine.scheduler) {
        elevator = this.simulationEngine.scheduler.assignRequest(request);
        if (elevator) {
          logger.info(`Assigned request ${request.id} to elevator ${elevator.id}`);
        }
      }
    });

    this.checkCompletedRequests();
  }

  checkCompletedRequests() {
    const now = Date.now();

    this.pendingRequests = this.pendingRequests.filter(request => {
      if (request.assigned && request.elevatorId !== null) {
        const elevator = this.simulationEngine.elevators[request.elevatorId];
        if (
          elevator &&
          elevator.currentFloor === request.destinationFloor &&
          elevator.doorState === 'open' &&
          Math.random() < 0.6 // 60% probability passenger exits
        ) {
          request.completed = true;
          request.completionTime = now;
          this.completedRequests.push(request);
          this.simulationEngine.updateFloorPanel(request.originFloor, request.direction, false);
          logger.info(`Completed request: ${request.originFloor} → ${request.destinationFloor}`);
          return false; // remove from pending
        }
      }
      if (request.waitTime > CONFIG.algorithmSettings.maxWaitTime) {
        // Consider timed-out request completed
        request.completed = true;
        request.completionTime = now;
        this.completedRequests.push(request);
        this.removeWaitingPerson(request.person);
        this.simulationEngine.updateFloorPanel(request.originFloor, request.direction, false);
        this.simulationEngine.updateFloorWaitingArea(request.originFloor);
        logger.info(`Timed out request: ${request.originFloor} → ${request.destinationFloor}`);
        return false; // remove from pending
      }
      return true; // keep in pendingRequests
    });
  }

  startAutoGeneration() {
    if (this.requestTimer) return;
    const generate = () => {
      if (this.simulationEngine.isRunning) {
        this.generateRandomRequest();
        const freq = this.simulationEngine.config.requestFrequency / this.simulationEngine.speed;
        const variance = freq * 0.5;
        const delay = freq + (Math.random() - 0.5) * variance;
        this.requestTimer = setTimeout(generate, Math.max(500, delay));
      }
    };
    setTimeout(generate, 500); // initial quick call
  }

  stopAutoGeneration() {
    if (this.requestTimer) {
      clearTimeout(this.requestTimer);
      this.requestTimer = null;
    }
  }

  reset() {
    this.stopAutoGeneration();
    this.pendingRequests = [];
    this.completedRequests = [];
    this.waitingPeople = {};
    this.requestCounter = 0;
  }

  getSnapshot(): Request[] {
    return this.pendingRequests;
  }

  getMetrics(): MetricsSnapshot {
    const completed = this.completedRequests.filter(r => r.completionTime);
    const totalWait = completed.reduce((acc, r) => acc + r.waitTime, 0);
    const totalTravel = completed.reduce((acc, r) => acc + (r.completionTime! - r.timestamp), 0);
    return {
      avgWaitTime: completed.length ? totalWait / completed.length / 1000 : 0,
      maxWaitTime: this.pendingRequests.length ? Math.max(...this.pendingRequests.map(r => r.waitTime)) / 1000 : 0,
      avgTravelTime: completed.length ? totalTravel / completed.length / 1000 : 0,
      totalRequests: this.requestCounter,
      completedRequests: completed.length,
    };
  }
}
