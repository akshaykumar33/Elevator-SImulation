import SimulationEngine from '../../src/apis/services/SimulationEngine';
import Elevator from '../../src/apis/models/Elevator';
import Request from '../../src/apis/models/Request';

// Helper to create a fresh simulation engine instance with default config
export function createSimulation() {
  const engine = SimulationEngine.getInstance();
  engine.reset();
  return engine;
}

// Helper to create an elevator in the simulation context
export function createElevator(id: number, floors = 10, engine?: SimulationEngine) {
  engine = engine || createSimulation();
  return new Elevator(id, floors, engine);
}

// Helper to create a request in the simulation context
export function createRequest(origin: number, destination: number) {
  return new Request(origin, destination);
}
