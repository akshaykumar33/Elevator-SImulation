import type { SimulationConfig, SimulationSnapshot, Direction } from '@/types/types';
import  { CONFIG } from '@/utils/config';
import { EventEmitter } from 'events';
import Elevator from '@/apis/models/Elevator';
import ElevatorScheduler from '@/apis/services/ElevatorScheduler';
import RequestHandler from '@/apis/services/RequestHandler';
import Request from '@/apis/models/Request';
import { logger } from '@/apis/middlewares/logger';



export default class SimulationEngine extends EventEmitter {
    private static instance: SimulationEngine;

    elevators: Elevator[] = [];
    scheduler!: ElevatorScheduler;
    requestHandler!: RequestHandler;
    config: SimulationConfig;
    isRunning = false;
    speed = 1;

    private updateTimer?: NodeJS.Timeout;
    private metricsTimer?: NodeJS.Timeout;

    startTime = 0;

    private constructor(config: SimulationConfig) {
        super();
        this.config = config;
        this.speed = config.simulationSpeed;
        this.initialize();
    }

    static getInstance(): SimulationEngine {
        if (!SimulationEngine.instance) {
            
            SimulationEngine.instance = new SimulationEngine(CONFIG.simulationDefaults);
        }
        return SimulationEngine.instance;
    }

    initialize() {
        this.createElevators();
        this.scheduler = new ElevatorScheduler(this);
        this.requestHandler = new RequestHandler(this);
    }

    createElevators() {
        this.elevators = [];
        for (let i = 0; i < this.config.numElevators; i++) {
            this.elevators.push(new Elevator(i, this.config.numFloors, this));
        }
    }


    setSpeed(value: number) {
        this.speed = value;
        this.emitUpdate();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();

        this.requestHandler.startAutoGeneration();

        // Ticking updates every 500ms for example; adjust as needed
        this.updateTimer = setInterval(() => this.tick(), CONFIG.uiSettings.updateInterval);

        // Metrics update timer if needed separately
        this.metricsTimer = setInterval(() => {

            this.emitUpdate(); // emit full snapshot after metrics update
        }, CONFIG.uiSettings.metricsUpdateInterval);

        setTimeout(() => {
            if (this.isRunning) {
                this.requestHandler?.generateRandomRequest();
                setTimeout(() => {
                    if (this.isRunning) this.requestHandler?.generateRandomRequest();
                }, 1000);
            }
        }, 500);

        this.emitUpdate();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;

        this.requestHandler.stopAutoGeneration();

        if (this.updateTimer) clearInterval(this.updateTimer);
        if (this.metricsTimer) clearInterval(this.metricsTimer);

        this.emitUpdate();
    }

    reset() {
        this.stop();
        this.elevators.forEach(e => e.reset());
        this.requestHandler.reset();
        this.startTime = 0;
        this.setSpeed(1);
        this.emitUpdate();
    }

    tick() {
        if (!this.isRunning) return;

        this.requestHandler.processRequests();

        this.elevators.forEach(elevator => {
            if (elevator.queue.length > 0 && !elevator.isMoving && elevator.doorState === 'closed') {
                elevator.moveToNextFloor();
            }
        });

        // Occasionally optimize elevator idle positions to improve efficiency
        if (Math.random() < 0.1) {
            this.scheduler.optimizeElevatorPositions();
        }
    }
    updateFloorPanel(floor: number, direction: Direction, active: boolean) {
        this.emit('simulation:floorPanelUpdate', { floor, direction, active });
    }
    updateFloorWaitingArea(floor: number) {
        this.emit('simulation:floorWaitingAreaUpdate', { floor, waitingPeople: this.requestHandler.getWaitingPeopleAtFloor(floor) });
    }
    updateElevatorDisplay(elevatorId: number) {
        const elevator = this.elevators.find(e => e.id === elevatorId);
        if (elevator) {
            this.emit('simulation:elevatorDisplayUpdate', { elevatorId });
        }
    }
    handleFloorRequest(floor: number, direction: Direction) {
        const maxFloor = this.config.numFloors;
        let destinationFloor: number | undefined;

        if (direction === 'up') {
            const possibleFloors = [];
            for (let f = floor + 1; f <= maxFloor; f++) {
                possibleFloors.push(f);
            }
            destinationFloor = possibleFloors[Math.floor(Math.random() * possibleFloors.length)];
        } else {
            const possibleFloors = [];
            for (let f = 1; f < floor; f++) {
                possibleFloors.push(f);
            }
            destinationFloor = possibleFloors[Math.floor(Math.random() * possibleFloors.length)];
        }

        if (destinationFloor !== undefined) {
            const request = new Request(floor, destinationFloor);
            this.requestHandler?.addRequest(request);
            logger.info(`Manual request: Floor ${floor} → ${destinationFloor} (${direction})`);
        }
        this.emit('simulation:floorRequest', { floor, destinationFloor, direction });
    }
    getSnapshot(): SimulationSnapshot { 
        // logger.info("requestsQueue:",this.requestHandler.getSnapshot())
        return {
            elevators: this.elevators.map(e => e.getSnapshot()),
            requestsQueue: this.requestHandler.getSnapshot(),
            metrics: this.requestHandler.getMetrics(),
            config: this.config,
            isRunning: this.isRunning,
            speed: this.speed,
            timer:this.startTime
        };
    }

    emitUpdate() {
        this.emit('update', this.getSnapshot());
    }

    updateConfig<K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) {
        if (this.config[key] === value) return;
        this.config[key] = value;
        //  logger.info("updateConfig",key,value)
        if (key === 'numElevators' || key === 'numFloors') {
            const wasRunning = this.isRunning;
            this.stop();

            if (key === 'numElevators') {
                this.createElevators();
                this.scheduler = new ElevatorScheduler(this);
            }
            // If floors changed, also recreate elevators or reset state as necessary

            if (wasRunning) {
                this.start();
            }
        }

        if (key === 'simulationSpeed') {
            this.setSpeed(value as number);
        }

        this.emitUpdate();
    }


}
