import type Person from "@/apis/models/Person";

export type Direction = 'up' | 'down' | 'idle'
export type DoorState = 'closed' | 'opening' | 'open' | 'closing'
export type PersonState = 'waiting' | 'entering' | 'inside' | 'exiting';

export interface SimulationConfig {
  numElevators: number;
  numFloors: number;
  requestFrequency: number;
  simulationSpeed: number;
  peakTrafficMode: boolean;
}

export interface ElevatorSnapshot {
  id: number;
  currentFloor: number;
  targetFloor: number;
  direction: string;
  doorState: string;
  people: Person[];
  capacity: number;
}

export interface RequestSnapshot {
  id: string;
  originFloor: number;
  destinationFloor: number;
  priority: number;
  assigned: boolean;
  completed: boolean;
}

export interface MetricsSnapshot {
  avgWaitTime: number;
  maxWaitTime: number;
  avgTravelTime: number;
  totalRequests: number;
  completedRequests: number;
}

export interface SimulationSnapshot {
  elevators: ElevatorSnapshot[];
  requestsQueue: RequestSnapshot[];
  metrics: MetricsSnapshot;
  config: SimulationConfig;
  isRunning: boolean;
  speed: number;
  timer:number;
}

export interface PersonSnapshot {
  id: string;
  currentFloor: number;
  destinationFloor: number;
  direction: Direction;
  state: PersonState;
  elevatorId: number | null;
}