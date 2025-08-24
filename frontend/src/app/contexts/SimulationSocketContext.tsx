/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { Direction } from "@/app/types/types";
import { useSimulationStore } from "@/app/stores/useSimulationStore";


// Define the API for your actions
type SimulationSocketContextType = {
  start: () => void;
  stop: () => void;
  reset: () => void;
  updateConfig: (key: string, value: any) => void;
  handleFloorRequest: (floor: number, direction: Direction) => void;

};

const SimulationSocketContext = createContext<SimulationSocketContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("API",API_URL)
// Provider
export function SimulationSocketProvider({ children }: { children: ReactNode }) {
  const setIsRunning = useSimulationStore((state) => state.setIsRunning);
  const setSpeed = useSimulationStore((state) => state.setSpeed);
  const setConfig = useSimulationStore((state) => state.setConfig);
  const setElevators = useSimulationStore((state) => state.setElevators);
  const setRequests = useSimulationStore((state) => state.setRequests);
  const setMetrics = useSimulationStore((state) => state.setMetrics);
  const setTimer = useSimulationStore((state) => state.setTimer);

  // Use a ref to avoid recreating the socket on every render
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API_URL); // Adjust URL as needed
    socketRef.current = socket;

    // Listen for updates from the server
    socket.on("simulation:update", (data) => {
      if (data.elevators) setElevators(data.elevators);
      if (data.requestsQueue) setRequests(data.requestsQueue);
      if (data.metrics) setMetrics(data.metrics);
      if (data.config) setConfig(data.config);
      if (typeof data.timer ==="number") setTimer(data.timer);
      if (typeof data.isRunning === "boolean") setIsRunning(data.isRunning);
      if (typeof data.speed === "number") setSpeed(data.speed);
    });
    
    socket.on("simulation:floorPanelUpdate", ({ floor, direction, active }) => {
    // You can update Zustand state here, or trigger a callback, etc.
    // Example: store setFloorPanelActive(floor, direction, active)
    // Or: store.setFloorPanels({ floor, direction, active })
    useSimulationStore().setFloorPanels({ floor, direction, active })
  });

  // --> Listen for "simulation:floorWaitingAreaUpdate"
  socket.on("simulation:floorWaitingAreaUpdate", ({ floor, waitingPeople }) => {
    // You can update Zustand: store.setWaitingArea({ floor, waitingPeople })
    useSimulationStore().setWaitingArea({ floor, waitingPeople })
  });

  // --> Listen for "simulation:elevatorDisplayUpdate"
  socket.on("simulation:elevatorDisplayUpdate", ({ elevatorId }) => {
    // Optionally fetch elevator data, or update the UI in any way needed
    // Example: store.setElevatorDisplay(elevatorId)
    useSimulationStore().setElevatorId(elevatorId)
  });
    // Cleanup when unmounting
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setConfig, setElevators, setIsRunning, setMetrics, setRequests, setSpeed, setTimer]);

  // Memoize actions so identity is stable
  const actions = useMemo<SimulationSocketContextType>(() => ({
    start: () => socketRef.current?.emit("simulation:start"),
    stop: () => socketRef.current?.emit("simulation:stop"),
    reset: () => socketRef.current?.emit("simulation:reset"),
    updateConfig: (key: string, value: any) =>
      socketRef.current?.emit("simulation:updateConfig", { key, value }),
    handleFloorRequest: (floor: number, direction: Direction) =>
      socketRef.current?.emit("simulation:floorRequest", { floor, direction }),

  }), []);

  return (
    <SimulationSocketContext.Provider value={actions}>
      {children}
    </SimulationSocketContext.Provider>
  );
}

// Hook for components to access actions
export function useSimulationSocket() {
  const context = useContext(SimulationSocketContext);
  if (!context) {
    throw new Error("useSimulationSocket must be used within a SimulationSocketProvider");
  }
  return context;
}
