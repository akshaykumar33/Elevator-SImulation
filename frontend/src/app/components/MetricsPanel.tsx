"use client"
import { useSimulationStore } from "@/app/stores/useSimulationStore";

function MetricsPanel() {
  const { metrics,elevators } = useSimulationStore();
  const {
    avgWaitTime,
    maxWaitTime,
    avgTravelTime,
    totalRequests,
    completedRequests,
  } = metrics;

  const utilizationRate =
    elevators.length > 0
      ? (elevators.reduce((sum, e) => sum + (e.people.length/e.capacity), 0) /
          elevators.length) *
        100
      : 0;
  // console.log("Utilization Rate", utilizationRate);
  return (
    <div className="metrics-panel card">
      <div className="card__header">
        <h3>Performance Metrics</h3>
      </div>
      <div className="card__body">
        <div className="metric">
          <label>Average Wait Time:</label>
          <span id="avg-wait-time">{avgWaitTime.toFixed(1)}s</span>
        </div>
        <div className="metric">
          <label>Max Wait Time:</label>
          <span id="max-wait-time">{maxWaitTime.toFixed(1)}s</span>
        </div>
        <div className="metric">
          <label>Average Travel Time:</label>
          <span id="avg-travel-time">{avgTravelTime.toFixed(1)}s</span>
        </div>
        <div className="metric">
          <label>Utilization Rate:</label>
          <span id="utilization-rate">{utilizationRate.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <label>Total Requests:</label>
          <span id="total-requests">{totalRequests}</span>
        </div>
        <div className="metric">
          <label>Completed Requests:</label>
          <span id="completed-requests">{completedRequests}</span>
        </div>
      </div>
    </div>
  );
}

export default MetricsPanel;
