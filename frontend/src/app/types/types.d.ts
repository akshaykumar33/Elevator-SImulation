import { Dir } from "fs";

export type Direction = 'up' | 'down' | 'idle'
export type DoorState = 'closed' | 'opening' | 'open' | 'closing'
export type PersonState = 'waiting' | 'entering' | 'inside' | 'exiting';

export interface ElevatorSnapshot {
    id: number;
    currentFloor;
    targetFloor;
    direction: Direction;
    doorState: DoorState;
    people: Person[];
    capacity: number;
    queue: number[];
    numFloors: number;
    isMoving: boolean;
    isBoarding: boolean;
    doorTimer: number | null;
    moveTimer: number | null;
    boardingTimer: number | null;
}

export interface PersonSnapshot {
    id: string;
    currentFloor: number;
    destinationFloor: number;
    direction: Direction;
    state: PersonState;
    requestTime: number;
    elevatorId: number | null;
}
export interface RequestSnapshot {
    id: string;
    timestamp: number;
    originFloor: number;
    destinationFloor: number;
    direction: Direction;
    priority: number1;
    waitTime: number;
    assigned: boolean;
    completed: boolean;
    elevatorId: number | null;
    person: Person;
    completionTime?: number;
}

export interface Person {
    id: string;
    currentFloor: number;
    destinationFloor: number;
    direction: Direction;
    state: PersonState;
    requestTime: number;
    elevatorId: number | null;

    updateState(newState: PersonState): void;
    getWaitTime(): number;
    getSnapshot(): PersonSnapshot;
};

export interface Elevator {
    id: number;
    currentFloor: number;
    targetFloor: number;
    direction: Direction;
    doorState: DoorState;
    people: Person[];
    capacity: number;
    queue: number[];
    numFloors: number;
    isMoving: boolean;
    isBoarding: boolean;

    doorTimer: NodeJS.Timeout | null;
    moveTimer: NodeJS.Timeout | null;
    boardingTimer: NodeJS.Timeout | null;

    simulationEngine: SimulationEngine;

    addToQueue(floor: number): void;
    updateDirection(): void;
    moveToNextFloor(): void;
    openDoors(): void;
    handlePassengerMovement(): void;
    closeDoors(): void;
    getUtilization(): number;
    reset(): void;
    getSnapshot(): ElevatorSnapshot;
};

export interface Request {
    id: string;
    timestamp: number;
    originFloor: number;
    destinationFloor: number;
    direction: Direction;
    priority: number;
    waitTime: number;
    assigned: boolean;
    completed: boolean;
    elevatorId: number | null;
    person: Person;
    completionTime?: number;

    updateWaitTime(): void;
    getWaitTimeSeconds(): number;
    getSnapshot(): RequestSnapshot;
};