import Request from './Request';
import { CONFIG } from '../../utils/config';
import { SimulationStore } from '../../store/useSimulationStore';
import SimulationEngine from './SimulationEngine';

class RequestHandler {
  pendingRequests: Request[] = [];
  completedRequests: Request[] = [];
  waitingPeople: Record<number, any[]> = {}; // floor number to people array
  requestTimer: number | null = null;
  requestCounter = 0;
  simulationEngine: SimulationEngine;
  // store: SimulationStore;
  constructor(simulationEngine: SimulationEngine) {
    this.simulationEngine = simulationEngine;
    // this.store = store;
  }
  generateRandomRequest() {
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
    console.log(`Generated request: Floor ${originFloor} → ${destinationFloor}`);
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

    this.simulationEngine.ui.updateFloorPanel(request.originFloor, request.direction, true);
    this.simulationEngine.ui.updateFloorWaitingArea(request.originFloor);
  }

  getWaitingPeopleAtFloor(floor: number) {
    return this.waitingPeople[floor] || [];
  }

  removeWaitingPerson(person: any) {
    if (!this.waitingPeople[person.currentFloor]) return;
    this.waitingPeople[person.currentFloor] = this.waitingPeople[person.currentFloor].filter(p => p.id !== person.id);
  }

  processRequests() {
    if (!this.simulationEngine.isRunning) return;

    console.log("Processing requests, pending count:", this.pendingRequests.length);
    this.pendingRequests.forEach(req => req.updateWaitTime());

    // Priority-based sort (descending by priority, then waitTime)
    this.pendingRequests.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.waitTime - a.waitTime;
    });

    // Assign unassigned requests to elevators
    const unassigned = this.pendingRequests.filter(r => !r.assigned);
    unassigned.forEach((request:Request) => {
      let elevator = null;
      if (this.simulationEngine.scheduler) {
        elevator = this.simulationEngine.scheduler.assignRequest(request);
        if (elevator) {
          console.log(`Assigned request ${request.id} to elevator ${elevator.id}`);
        }
      }
    });

    this.checkCompletedRequests();
  }

  checkCompletedRequests() {
    const now = Date.now();
    this.pendingRequests = this.pendingRequests.filter((request:Request) => {
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
          this.simulationEngine.ui.updateFloorPanel(request.originFloor, request.direction, false);
          console.log(`Completed request: ${request.originFloor} → ${request.destinationFloor}`);
          return false; // Remove from pending
        }
      }

      if (request.waitTime > CONFIG.algorithmSettings.maxWaitTime) {
        // Consider timed-out request completed
        request.completed = true;
        request.completionTime = now;
        this.completedRequests.push(request);
        this.removeWaitingPerson(request.person);
        this.simulationEngine.ui.updateFloorPanel(request.originFloor, request.direction, false);
        this.simulationEngine.ui.updateFloorWaitingArea(request.originFloor);
        console.log(`Timed out request: ${request.originFloor} → ${request.destinationFloor}`);
        return false; // Remove from pending
      }

      return true; // Keep in pendingRequests
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
        this.requestTimer = window.setTimeout(generate, Math.max(500, delay));
      }
    };

    window.setTimeout(generate, 500); // Initial quick call
  }

  stopAutoGeneration() {
    if (this.requestTimer) {
      window.clearTimeout(this.requestTimer);
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

  getMetrics() {
    const completed = this.completedRequests.filter((r:Request) => r.completionTime);
    const totalWait = completed.reduce((acc, r) => acc + r.waitTime, 0);
    const totalTravel = completed.reduce((acc, r) => acc + (r.completionTime! - r.timestamp), 0);
     
    // console.log("Calculating metrics", completed, totalWait, totalTravel);
    return {
      avgWaitTime: completed.length ? totalWait / completed.length / 1000 : 0,
      maxWaitTime: this.pendingRequests.length ? Math.max(...this.pendingRequests.map(r => r.waitTime)) / 1000 : 0,
      avgTravelTime: completed.length ? totalTravel / completed.length / 1000 : 0,
      totalRequests: this.requestCounter,
      completedRequests: completed.length,
    };
  }
}

export default RequestHandler;
