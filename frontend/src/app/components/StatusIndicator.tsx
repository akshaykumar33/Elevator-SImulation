"use client"

import { useSimulationStore } from "@/app/stores/useSimulationStore";

export default function StatusIndicator() {
  const { isRunning,timer } = useSimulationStore();

  const elapsed =
    isRunning && timer
      ? (Date.now() - timer) / 1000
      : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
// console.log("isRunning:", isRunning, "isRunning in Engine:", simulationEngine.isRunning);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <div className="status-indicators">
      
      {isRunning ? (
        <span className="status status--running" id="simulation-status">
          Running
        </span>
      ) : (
        <span className="status status--stopped" id="simulation-status">
          Stopped
        </span>
      )}

      <span className="simulation-time">
        Time: <span id="simulation-time">{formattedTime}</span>
      </span>
    </div>
  );
}
