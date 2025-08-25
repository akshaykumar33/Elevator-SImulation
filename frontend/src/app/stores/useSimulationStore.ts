'use client'

import { create } from "zustand";
import { Request,Person,Direction, DoorState } from "../types/types";

export interface ElevatorSnapshot {
  id: number;
  currentFloor: number;
  targetFloor: number;
  direction: Direction;
  doorState: DoorState;
  people: Person[];
  capacity: number;
}


interface SimulationMetrics {
  avgWaitTime: number;
  maxWaitTime: number;
  avgTravelTime: number;
  totalRequests: number;
  completedRequests: number;
}

export interface SimulationConfig {
  numElevators: number;
  numFloors: number;
  requestFrequency: number;
  simulationSpeed: number;
  peakTrafficMode: boolean;
}

export interface SimulationStore {
  isRunning: boolean;
  speed: number;
  config: SimulationConfig;
  elevators: ElevatorSnapshot[];
  requests: Request[];
  metrics: SimulationMetrics;
  timer: number;
  // // NEW UI states
  floorPanels: { floor: number, direction: Direction, active: boolean };
  waitingAreas: { floor: number, waitingPeople: Person[] };
  elevatorId: number;
  // existing setters
  setIsRunning: (running: boolean) => void;
  setSpeed: (speed: number) => void;
  setConfig: (config: Partial<SimulationConfig>) => void;
  setElevators: (elevators: ElevatorSnapshot[]) => void;
  setRequests: (requests: Request[]) => void;
  setMetrics: (metrics: SimulationMetrics) => void;

  // // NEW setters
  setFloorPanels: (updates: { floor: number; direction: Direction; active: boolean }) => void;
  setWaitingArea: (updates: { floor: number; waitingPeople: Person[] }) => void;
  setElevatorId: (elevatorId: number) => void;
  setTimer: (timer: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  isRunning: false,
  speed: 1,
  config: {
    numElevators: 3,
    numFloors: 10,
    requestFrequency: 2000,
    simulationSpeed: 1,
    peakTrafficMode: false,
  },
  elevators: [],
  requests: [],
  metrics: {
    avgWaitTime: 0,
    maxWaitTime: 0,
    avgTravelTime: 0,
    totalRequests: 0,
    completedRequests: 0,
  },
  timer: 0,
  floorPanels: { floor: 1, direction: 'up', active: false },
  waitingAreas: { floor: 1, waitingPeople: [] },
  elevatorId: 1,

  setIsRunning: (running) => set({ isRunning: running }),
  setSpeed: (speed) => set({ speed }),
  setConfig: (partialConfig) => {
    const currentConfig = get().config;
    set({ config: { ...currentConfig, ...partialConfig } });
  },
  setElevators: (elevators) => set({ elevators }),
  setRequests: (requests) => set({ requests }),
  setMetrics: (metrics) => set({ metrics }),

  setFloorPanels: (floorPanels) =>
    set({ floorPanels }),

  setWaitingArea: (waitingAreas) => set({ waitingAreas }),

  setElevatorId: (elevatorId) => set({ elevatorId }),

  setTimer: (timer) => set({ timer })
}));
