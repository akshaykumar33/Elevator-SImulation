import type { PersonState, PersonSnapshot } from "@/types/types";


export default class Person {
  id: string;
  currentFloor: number;
  destinationFloor: number;
  direction: 'up' | 'down';
  state: PersonState = 'waiting';
  requestTime: number;
  elevatorId: number | null = null;

  constructor(id: string, currentFloor: number, destinationFloor: number) {
    this.id = id;
    this.currentFloor = currentFloor;
    this.destinationFloor = destinationFloor;
    this.direction = destinationFloor > currentFloor ? 'up' : 'down';
    this.requestTime = Date.now();
  }

  updateState(newState: PersonState): void {
    this.state = newState;
  }

  getWaitTime(): number {
    return Date.now() - this.requestTime;
  }

  getSnapshot(): PersonSnapshot {
    return {
      id: this.id,
      currentFloor: this.currentFloor,
      destinationFloor: this.destinationFloor,
      direction: this.direction,
      state: this.state,
      elevatorId: this.elevatorId,
    };
  }
}
