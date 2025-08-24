"use client"
import StatusIndicator from "@/app/components/StatusIndicator";
import ThemeToggle from "@/app/components/ThemeToggle";

function Header() {
  return (
    <header className="simulation-header">
      <h1>Elevator Simulation System</h1>
      <div className="header-controls">
        <ThemeToggle />
        <StatusIndicator />
      </div>
    </header>
  );
}

export default Header;
