// import io, { Socket } from 'socket.io-client';
// import { useSimulationStore } from '../../store/useSimulationStore';
import { CONFIG } from '../../utils/config';
import Elevator from './Elevator';
import ElevatorScheduler from './ElevatorScheduler';
import ThemeManager from './ThemeManager';
import UIManager from './UIManager';
import RequestHandler from './RequestHandler';
// import { Direction, DoorState } from '../../types/types';

interface SimulationConfig {
  numElevators: number;
  numFloors: number;
  requestFrequency: number;
  simulationSpeed: number;
  peakTrafficMode: boolean;
}

// interface ElevatorSnapshot {
//   id: number;
//   currentFloor: number;
//   targetFloor: number;
//   direction: Direction;
//   doorState: DoorState;
//   peopleCount: number;
//   capacity: number;
// }

// interface RequestSnapshot {
//   id: string;
//   originFloor: number;
//   destinationFloor: number;
//   priority: number;
//   assigned: boolean;
//   completed: boolean;
// }

// interface MetricsSnapshot {
//   avgWaitTime: number;
//   maxWaitTime: number;
//   avgTravelTime: number;
//   totalRequests: number;
//   completedRequests: number;
// }

// interface SimulationSnapshot {
//   elevators: ElevatorSnapshot[];
//   requests: RequestSnapshot[];
//   metrics: MetricsSnapshot;
//   config: SimulationConfig;
//   isRunning: boolean;
//   speed: number;
//   start: () => void;
//   stop: () => void;
//   reset: () => void;
// }

class SimulationEngine {
  static instance: SimulationEngine;

  elevators: Elevator[] = [];
  scheduler: ElevatorScheduler | null = null;
  requestHandler: RequestHandler | null = null;
  ui!: UIManager;
  themeManager: ThemeManager | null = null;
  isRunning = false;
  speed = 1;
  startTime = 0;
  updateTimer: number | null = null;
  metricsTimer: number | null = null;
  config!: SimulationConfig;
  // socket!: Socket;

  constructor() {
    if (SimulationEngine.instance) return SimulationEngine.instance;
    SimulationEngine.instance = this;

    this.config = { ...CONFIG.simulationDefaults } as SimulationConfig;
    this.speed = this.config.simulationSpeed || 1;

    this.ui = new UIManager(this);
    // this.socket = io() as Socket;

    // const store = useSimulationStore.getState();
    // store.setConfig(this.config);
    // store.setSpeed(this.speed);
    // store.setIsRunning(false);

    // this.setupSocketListeners();

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.reset = this.reset.bind(this);
  }

  // setupSocketListeners() {
  //   this.socket.on('connect', () => {
  //     console.log('Connected to socket.');
  //   });

  //   this.socket.on('simulation:update', (data: Partial<SimulationSnapshot>) => {
  //     this.updateStoreFromSocket(data);
  //   });
  // }

  // updateStoreFromSocket(data: Partial<SimulationSnapshot>) {
  //   const store = useSimulationStore.getState();
  //   if (data.elevators) store.setElevators(data.elevators);
  //   if (data.requests) store.setRequests(data.requests);
  //   if (data.metrics) store.setMetrics(data.metrics);
  //   if (data.config) store.setConfig(data.config);
  //   if (typeof data.isRunning === 'boolean') store.setIsRunning(data.isRunning);
  //   if (typeof data.speed === 'number') store.setSpeed(data.speed);
  // }

  initialize() {
    // this.themeManager = new ThemeManager();
    this.createElevators();
    this.scheduler = new ElevatorScheduler(this);
    this.requestHandler = new RequestHandler(this);
    this.ui.initialize();
    // this.updateStatus();
  }

  createElevators() {
    this.elevators = [];
    for (let i = 0; i < this.config.numElevators; i++) {
      this.elevators.push(new Elevator(i, this.config.numFloors, this));
    }
    // useSimulationStore.getState().setElevators(this.elevators.map(e => ({
    //   id: e.id,
    //   currentFloor: e.currentFloor,
    //   targetFloor: e.targetFloor,
    //   direction: e.direction,
    //   doorState: e.doorState,
    //   peopleCount: e.people.length,
    //   capacity: e.capacity,
    // })));
  }

  updateConfig<K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) {
    if (this.config[key] === value) return;
    this.config[key] = value;

    // useSimulationStore.getState().setConfig({ [key]: value });

    if (key === 'numElevators' || key === 'numFloors') {
      const wasRunning = this.isRunning;
      this.stop();

      if (key === 'numElevators') {
        this.createElevators();
        this.scheduler = new ElevatorScheduler(this);
      }

      this.ui.initialize();

      if (wasRunning) this.start();
    }

    if (key === 'simulationSpeed') {
      this.setSpeed(value as number);
    }
  }

  setSpeed(value: number) {
    this.speed = value;
    

    const adjustedDuration = CONFIG.uiSettings.animationDuration / value;
    document.documentElement.style.setProperty('--animation-duration', `${adjustedDuration}ms`);

      //  useSimulationStore.getState().setSpeed(value);
      // console.log(`Simulation speed set to ${useSimulationStore.getState().speed}x`);
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    // useSimulationStore.getState().setIsRunning(true);
    this.startTime = Date.now();

    this.requestHandler?.startAutoGeneration();

    this.updateTimer = window.setInterval(() => this.tick(), CONFIG.uiSettings.updateInterval);
    this.metricsTimer = window.setInterval(() => {
      this.ui.updateMetrics();
      // this.ui.updateSimulationTime();
    }, CONFIG.uiSettings.metricsUpdateInterval);

    // this.updateStatus();
    // document.body.classList.add('simulation-running');

    setTimeout(() => {
      if (this.isRunning) {
        this.requestHandler?.generateRandomRequest();
        setTimeout(() => {
          if (this.isRunning) this.requestHandler?.generateRandomRequest();
        }, 1000);
      }
    }, 500);

    // this.emitUpdate();
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    // useSimulationStore.getState().setIsRunning(false);

    this.requestHandler?.stopAutoGeneration();

    if (this.updateTimer) window.clearInterval(this.updateTimer);
    this.updateTimer = null;

    if (this.metricsTimer) window.clearInterval(this.metricsTimer);
    this.metricsTimer = null;

    // this.updateStatus();
    // document.body.classList.remove('simulation-running');

    // this.emitUpdate();
  }

  reset() {
    this.stop();

    this.elevators.forEach(e => e.reset());
    this.requestHandler?.reset();

    this.startTime = 0;

    Object.values(this.ui.floorPanelButtons).forEach(btn => btn.classList.remove('active'));
    Object.values(this.ui.floorWaitingAreas).forEach(area => (area.innerHTML = ''));

    this.setSpeed(1);
    // useSimulationStore.getState().setSpeed(1);

    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.speed-btn[data-speed="1"]')?.classList.add('active');

    this.ui.updateElevators();
    this.ui.updateRequestQueue();
    this.ui.updateMetrics();
    // this.ui.updateSimulationTime();

    // this.updateStatus();

    // this.emitUpdate();
  }

  tick() {
    if (!this.isRunning) return;

    this.requestHandler?.processRequests();
    // console.log('Tick: Processing requests and updating elevators');
    this.elevators.forEach(elevator => {
      if (elevator.queue.length > 0 && !elevator.isMoving && elevator.doorState === 'closed') {
        elevator.moveToNextFloor();
      }
    });

    if (Math.random() < 0.1) {
      this.scheduler?.optimizeElevatorPositions();
    }

    this.ui.updateElevators();
    this.ui.updateRequestQueue();

    // this.emitUpdate();
  }

  // updateStatus() {
  //   // const status = document.getElementById('simulation-status');
  //   const startBtn = document.getElementById('start-btn') as HTMLButtonElement | null;
  //   const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement | null;

  //   if (this.isRunning) {
  //     // if (status) {
  //     //   status.textContent = 'Running';
  //     //   status.className = 'status status--running';
  //     // }
  //     if (startBtn) {
  //       startBtn.disabled = true;
  //       startBtn.style.opacity = '0.5';
  //     }
  //     if (stopBtn) {
  //       stopBtn.disabled = false;
  //       stopBtn.style.opacity = '1';
  //     }
  //   } else {
  //     // if (status) {
  //     //   status.textContent = 'Stopped';
  //     //   status.className = 'status status--stopped';
  //     // }
  //     if (startBtn) {
  //       startBtn.disabled = false;
  //       startBtn.style.opacity = '1';
  //     }
  //     if (stopBtn) {
  //       stopBtn.disabled = false;
  //       stopBtn.style.opacity = '1';
  //     }
  //   }
  // }

  // getSnapshot(): SimulationSnapshot {
  //   return {
  //     elevators: this.elevators.map(e => ({
  //       id: e.id,
  //       currentFloor: e.currentFloor,
  //       targetFloor: e.targetFloor,
  //       direction: e.direction,
  //       doorState: e.doorState,
  //       peopleCount: e.people.length,
  //       capacity: e.capacity,

  //     })),
  //     requests:
  //       this.requestHandler?.pendingRequests.map(r => ({
  //         id: r.id,
  //         originFloor: r.originFloor,
  //         destinationFloor: r.destinationFloor,
  //         priority: r.priority,
  //         assigned: r.assigned,
  //         completed: r.completed,
  //       })) || [],
  //     metrics: this.requestHandler?.getMetrics() || {
  //       avgWaitTime: 0,
  //       maxWaitTime: 0,
  //       avgTravelTime: 0,
  //       totalRequests: 0,
  //       completedRequests: 0,
  //     },
  //     config: this.config,
  //     isRunning: this.isRunning,
  //     speed: this.speed,
  //     start: this.start,
  //     stop: this.stop,
  //     reset: this.reset,
  //   };
  // }

  // emitUpdate() {
  //   const data = this.getSnapshot();
    
  //   // console.log('Emitting simulation update:', data);
  //   const store = useSimulationStore.getState();
  //   store.setElevators(data.elevators);
  //   store.setRequests(data.requests);
  //   store.setMetrics(data.metrics);
  //   store.setConfig(data.config);
  //   store.setIsRunning(data.isRunning);
  //   store.setSpeed(data.speed);

  //   if (this.socket && this.socket.connected) {
  //     this.socket.emit('simulation:update', data);
  //   }
  // }
}

export default SimulationEngine;
