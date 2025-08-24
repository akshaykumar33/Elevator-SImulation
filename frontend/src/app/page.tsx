import BuildingDisplay from "@/app/components/BuildingDisplay";
import ControlPanel from "@/app/components/ControlPanel";
import Header from "@/app/components/Header";
import SidePanel from "@/app/components/SidePanel";
import TestSenarios from "@/app/components/TestSenarios";
import { SimulationSocketProvider } from "@/app/contexts/SimulationSocketContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
export default function Home() {
  return (
    <ThemeProvider>
      <SimulationSocketProvider>
          <main className="container">
            <Header />
            <section className="simulation-layout">
              <ControlPanel />
              <BuildingDisplay />
              <SidePanel />
            </section>
            <TestSenarios />
          </main>
      </SimulationSocketProvider>
    </ThemeProvider>
  );
}
