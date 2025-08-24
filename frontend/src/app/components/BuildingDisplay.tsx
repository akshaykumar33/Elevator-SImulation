import FloorPanels from '@/app/components/FloorPanels'
import ElevatorBank from '@/app/components/ElevatorBank'

function BuildingDisplay() {
  return (
    <div className="building-container">
        <FloorPanels />
        <ElevatorBank />
    </div>
  )
}

export default BuildingDisplay