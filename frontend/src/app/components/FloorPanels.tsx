"use client";

import { Direction } from "@/app/types/types";
import React, { useCallback } from "react";

import { Person } from "@/app/types/types";

import { useSimulationSocket } from "@/app/contexts/SimulationSocketContext";
import { useSimulationStore } from "@/app/stores/useSimulationStore";

const FloorPanels: React.FC = () => {
  const { config, floorPanels, waitingAreas } = useSimulationStore();
  const { handleFloorRequest } = useSimulationSocket();

  const { numFloors } = config;

  // console.log("waitingAreas",waitingAreas)
  // floorPanels state structure is { floor, direction, active }
  // waitingAreas state structure is { floor, waitingPeople }

  // This helper checks if a floor button is active
  const isButtonActive = useCallback(
    (floor: number, direction: Direction) => {
      if (!floorPanels) return false;
      return (
        floorPanels.floor === floor &&
        floorPanels.direction === direction &&
        floorPanels.active
      );
    },
    [floorPanels]
  );

  // Gets the waiting people array for a floor
  const getWaitingPeople = useCallback(
    (floor: number) => {
      return waitingAreas?.floor === floor ? waitingAreas.waitingPeople : [];
    },
    [waitingAreas]
  );

  return (
    <div id="floor-panels" className="floor-panels">
      {/* Render floors from top to bottom */}
      {[...Array(numFloors)].map((_, i) => {
        const floorNum = numFloors - i; // descending order

        const upActive = isButtonActive(floorNum, "up");
        const downActive = isButtonActive(floorNum, "down");
        const waitingPeople = getWaitingPeople(floorNum) || [];

        return (
          <div className="floor-panel" key={floorNum}>
            <div className="floor-number">{floorNum}</div>
            <div className="floor-buttons">
              <button
                className={`floor-btn ${upActive ? "active" : ""}`}
                disabled={floorNum >= numFloors}
                title={`Call elevator up from floor ${floorNum}`}
                onClick={() => handleFloorRequest(floorNum, "up")}
              >
                ↑
              </button>
              <button
                className={`floor-btn ${downActive ? "active" : ""}`}
                disabled={floorNum <= 1}
                title={`Call elevator down from floor ${floorNum}`}
                onClick={() => handleFloorRequest(floorNum, "down")}
              >
                ↓
              </button>
            </div>
            <div className="floor-waiting-area">
              <div className="waiting-people">
                {waitingPeople.map((person: Person) => (
                  <span
                    key={person.id}
                    className="person waiting"
                    data-direction={person.direction}
                  >
                    👤
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloorPanels;
