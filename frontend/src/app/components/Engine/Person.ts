import { PersonState } from "../../types/types";

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

  updateState(newState: PersonState) {
    this.state = newState;
  }

  getWaitTime() {
    return Date.now() - this.requestTime;
  }
}
