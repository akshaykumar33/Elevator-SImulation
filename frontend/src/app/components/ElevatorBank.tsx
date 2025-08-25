"use client"

import React from "react";
import { useSimulationStore } from "@/app/stores/useSimulationStore";
import { CONFIG } from "@/app/utils/config";
import { Person } from "@/app/types/types";


const ElevatorBank: React.FC = () => {
  const elevators = useSimulationStore((state) => state.elevators);

  // Floor height in pixels for positioning
  const floorHeight = 50;

  // Map elevator directions to symbols and colors
  const directionSymbolMap: Record<string, string> = {
    up: "↑",
    down: "↓",
    idle: "⚪",
  };

  return (
    <div id="elevator-bank" className="elevator-bank">
      {elevators.map((elevator) => {
        const bottomPosition = (elevator.currentFloor - 1) * floorHeight + 5;
        const doorsOpening = elevator.doorState === "opening" || elevator.doorState === "open";
        const doorsOpen = elevator.doorState === "open";
        const isMoving = elevator.direction !== "idle" && elevator.doorState === "closed";

        return (
          <div className="elevator-shaft" key={elevator.id} >
            <div
              className={`elevator-car ${doorsOpening ? "doors-opening" : ""} ${doorsOpen ? "doors-open" : ""} ${
                isMoving ? "moving" : ""
              }`}
              style={{ bottom: `${bottomPosition}px`, position: "absolute", left: 0, right: 0 }}
            >
              <div className="elevator-doors">
                <div className="door left" />
                <div className="door right" />
              </div>
              <div className="elevator-info">
                <div
                  className="elevator-direction"
                  style={{ color: elevator.direction === "idle" ? "var(--color-app-text-muted)" : "var(--color-primary)" }}
                >
                  {directionSymbolMap[elevator.direction] || "⚪"}
                </div>
                <div className="elevator-passengers-display">
                  {`${elevator.people.length}/${elevator.capacity}`}
                </div>
              </div>
              <div className="elevator-passengers">
                {/* Optional detailed passenger count */}
                {/* <div className="passenger-count">👥 {elevator.peopleCount}/{elevator.capacity}</div> */}
                <div className="passenger-icons">
                  {/* Render passenger icons */}
                  {elevator.people?.map((person: Person) => (
                    <span
                      key={person.id}
                      className={`person ${
                        person.state === "entering"
                          ? "person-entering"
                          : person.state === "exiting"
                          ? "person-exiting"
                          : ""
                      }`}
                      data-destination={person.destinationFloor}
                    >
                      {CONFIG.personSettings.personIcon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ElevatorBank;

