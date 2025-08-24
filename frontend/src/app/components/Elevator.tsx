"use client"

import { ElevatorSnapshot } from "@/app/stores/useSimulationStore";

interface Props {
  elevator: ElevatorSnapshot
}

const Elevator: React.FC<Props> = ({ elevator }) => {
  const floorHeight = 50
  const bottom = (elevator.currentFloor - 1) * floorHeight + 5

  return (
    <div
      className={`elevator-car ${elevator.doorState === 'open' ? 'doors-open' : ''} ${elevator.doorState === 'opening' ? 'doors-opening' : ''} ${elevator.doorState === 'closing' ? 'doors-closing' : ''}`}
      style={{ bottom }}
    >
      <div className="elevator-direction">
        {elevator.direction === 'up' ? '↑' : elevator.direction === 'down' ? '↓' : '⚪'}
      </div>
      <div className="elevator-passengers-display">
        {elevator.peopleCount}/{elevator.capacity}
      </div>
    </div>
  )
}

export default Elevator
