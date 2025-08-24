"use client"
import { useCallback } from "react";
import { useSimulationStore } from "@/app/stores/useSimulationStore";
import { CONFIG } from "@/app/utils/config";
import { useSimulationSocket } from "@/app/contexts/SimulationSocketContext";
import { SimulationConfig } from "@/app/stores/useSimulationStore";

function TestSenarios() {
  const {  setConfig } = useSimulationStore();
  const {updateConfig} = useSimulationSocket();

  const senarios = CONFIG.scenario;
  type ScenarioKey = keyof typeof senarios;

  const onChange = useCallback(
    (field: keyof SimulationConfig, value: any) => {
      setConfig({ [field]: value });
      updateConfig(field, value )
    },
    [setConfig,updateConfig]
  );
const handleChange = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  const scenario = e.currentTarget.getAttribute("data-scenario") as ScenarioKey | null;
  if (scenario && scenario in senarios) {
    const newConfig = senarios[scenario];
    if (newConfig) {
      onChange("numElevators", newConfig.numElevators);
      onChange("numFloors", newConfig.numFloors);
      onChange("requestFrequency", newConfig.requestFrequency);
      onChange("peakTrafficMode", newConfig.peakTrafficMode);
    }
  }
};

  return (
    <section className="test-scenarios card">
      <div className="card__header">
        <h3>Test Scenarios</h3>
      </div>
      <div className="card__body">
        <div className="scenario-buttons">
          <button
            className="btn btn--sm btn--outline"
            data-scenario="normal"
            onClick={handleChange}
          >
            Normal Traffic
          </button>
          <button
            className="btn btn--sm btn--outline"
            data-scenario="rush"
            onClick={handleChange}
          >
            Morning Rush
          </button>
          <button
            className="btn btn--sm btn--outline"
            data-scenario="stress"
            onClick={handleChange}
          >
            Stress Test
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestSenarios;
