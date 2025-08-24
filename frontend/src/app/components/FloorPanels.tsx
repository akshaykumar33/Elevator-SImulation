"use client"

import { Direction } from '@/app/types/types';

interface FloorPanelProps {
  numFloors: number;
  onFloorRequest: (floor: number, direction: Direction) => void;
  activeFloorPanels: { [key: string]: boolean }; // For button active state if needed
  waitingPeopleCount: { [floor: number]: number }; // Optional: to display waiting people count
}

 const FloorPanels: React.FC<FloorPanelProps> = ({
  numFloors,
  onFloorRequest,
  activeFloorPanels = {},
  waitingPeopleCount = {},
}) => {
  return (
    <div id="floor-panels">
      {[...Array(numFloors).keys()]
        .map(i => numFloors - i) // Floors descending from numFloors to 1
        .map(floor => (
          <div key={floor} className="floor-panel">
            <div className="floor-number">{floor}</div>
            <div className="floor-buttons">
              <button
                className="floor-btn"
                title={`Call elevator up from floor ${floor}`}
                disabled={floor >= numFloors}
                style={{ opacity: floor >= numFloors ? 0.3 : 1 }}
                onClick={() => onFloorRequest(floor, 'up')}
                aria-pressed={activeFloorPanels[`${floor}-up`] ?? false}
              >
                ↑
              </button>
              <button
                className="floor-btn"
                title={`Call elevator down from floor ${floor}`}
                disabled={floor <= 1}
                style={{ opacity: floor <= 1 ? 0.3 : 1 }}
                onClick={() => onFloorRequest(floor, 'down')}
                aria-pressed={activeFloorPanels[`${floor}-down`] ?? false}
              >
                ↓
              </button>
            </div>
            <div className="floor-waiting-area">
              <div className="waiting-people" aria-label={`Waiting people count on floor ${floor}`}>
                {waitingPeopleCount[floor] ? (
                  <span>{waitingPeopleCount[floor]} waiting</span>
                ) : (
                  <span>No one waiting</span>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default FloorPanels;