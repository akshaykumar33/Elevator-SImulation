/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client"

import { create } from "zustand";
import { Direction, DoorState } from "@/app/types/types";
import type Request from '@/app/components/Engine/Request'
import type Person from "@/app/components/Engine/Person";

export interface ElevatorSnapshot {
  id: number;
  currentFloor: number;
  targetFloor: number;
  direction: Direction;
  doorState: DoorState;
  peopleCount: number;
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
  timer : number;
  // // NEW UI states
  floorPanels:{}; 
  waitingAreas: {};
  elevatorId: {};
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
  setTimer:(timer: number) => void;
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
   timer:0,
  floorPanels: {},
  waitingAreas: {},
  elevatorId: {},

  setIsRunning: (running) => set({ isRunning: running }),
  setSpeed: (speed) => set({ speed }),
  setConfig: (partialConfig) => {
    const currentConfig = get().config;
    set({ config: { ...currentConfig, ...partialConfig } });
  },
  setElevators: (elevators) => set({ elevators }),
  setRequests: (requests) => set({ requests }),
  setMetrics: (metrics) => set({ metrics }),

  setFloorPanels: ({ floor, direction, active }) =>
    set({floorPanels:{floor, direction, active}}),

  setWaitingArea: ({ floor, waitingPeople }) =>
    set({waitingAreas:{ floor, waitingPeople }}),

  setElevatorId: (elevatorId) =>
    set({ elevatorId }),

  setTimer:(timer)=>set({timer})
}));
