'use client'
import { useCallback } from "react";
import { useSimulationSocket } from "@/app/contexts/SimulationSocketContext";
import { useSimulationStore } from "@/app/stores/useSimulationStore";


export default function ControlPanel() {
const { config, setConfig, isRunning} = useSimulationStore();
const {start,stop,reset,updateConfig} =useSimulationSocket();


  const onChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (field: keyof typeof config, value:any ) => {
      setConfig({ [field]: value });
      updateConfig(field, value )
    },
    [setConfig, updateConfig]
  );
// //console.log("ControlPanel config,isRunning:", config,isRunning);
  return (
    <div className="control-panel card">
      <div className="card__header">
        <h3>Control Panel</h3>
      </div>
      <div className="card__body">
        <div className="control-group">
          <label className="form-label" htmlFor="num-elevators">
            Number of Elevators (1-8)
          </label>
          <input
            id="num-elevators"
            type="range"
            className="slider"
            min={1}
            max={8}
            value={config.numElevators}
            onChange={(e) => onChange("numElevators", +e.target.value)}
          />
          <span id="num-elevators-value">{config.numElevators}</span>
        </div>

        <div className="control-group">
          <label className="form-label" htmlFor="num-floors">
            Number of Floors (5-50)
          </label>
          <input
            id="num-floors"
            type="range"
            className="slider"
            min={5}
            max={50}
            value={config.numFloors}
            onChange={(e) => onChange("numFloors", +e.target.value)}
          />
          <span id="num-floors-value">{config.numFloors}</span>
        </div>

        <div className="control-group">
          <label className="form-label" htmlFor="request-frequency">
            Request Frequency (ms)
          </label>
          <input
            id="request-frequency"
            type="range"
            className="slider"
            min={500}
            max={5000}
            step={100}
            value={config.requestFrequency}
            onChange={(e) => onChange("requestFrequency", +e.target.value)}
          />
          <span id="request-frequency-value">{config.requestFrequency}ms</span>
        </div>

        <div className="control-group">
          <label className="form-label">Simulation Speed</label>
          <div className="speed-controls">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                className={`btn btn--sm speed-btn${
                  config.simulationSpeed === s ? " active" : ""
                }`}
                 onClick={() => onChange("simulationSpeed", s)}
                data-speed={s.toString()}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="checkbox-container" htmlFor="peak-traffic">
            <input
              id="peak-traffic"
              type="checkbox"
              checked={config.peakTrafficMode}
              onChange={(e) => onChange("peakTrafficMode", e.target.checked)}
            />
            <span className="checkmark"></span>
            Peak Traffic Mode
          </label>
        </div>

        <div className="control-buttons">
          <button className="btn btn--primary" id="start-btn" disabled={isRunning} onClick={start}>
            Start
          </button>
          <button className="btn btn--secondary" id="stop-btn"  disabled={!isRunning} onClick={stop}>
            Stop
          </button>
          <button className="btn btn--outline" id="reset-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
