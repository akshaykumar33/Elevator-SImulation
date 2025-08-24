import { CONFIG } from '../../utils/config';
import Person from './Person';
import { Direction, DoorState } from '../../types/types';
// import type { SimulationStore } from '../../store/useSimulationStore';
import SimulationEngine from './SimulationEngine';

class Elevator {
  id: number;
  currentFloor = 1;
  targetFloor = 1;
  direction: Direction = 'idle';
  doorState: DoorState = 'closed';
  people: Person[] = [];
  capacity = CONFIG.elevatorDefaults.capacity;
  queue: number[] = [];
  numFloors: number;
  isMoving = false;
  isBoarding = false;
  doorTimer: number | null = null;
  moveTimer: number | null = null;
  boardingTimer: number | null = null;

  simulationEngine: SimulationEngine;
  // store: SimulationStore;

  constructor(
    id: number,
    numFloors: number,
    simulationEngine: SimulationEngine,
    // store: SimulationStore
  ) {
    this.id = id;
    this.numFloors = numFloors;
    this.simulationEngine = simulationEngine;
    // this.simulationEngine = store;
  }

  addToQueue(floor: number) {
    if (!this.queue.includes(floor) && floor !== this.currentFloor) {
      this.queue.push(floor);
      this.queue.sort((a, b) => {
        if (this.direction === 'up') return a - b;
        if (this.direction === 'down') return b - a;
        return Math.abs(a - this.currentFloor) - Math.abs(b - this.currentFloor);
      });
      this.updateDirection();
    }
  }

  updateDirection() {
    if (this.queue.length === 0) {
      this.direction = 'idle';
      this.targetFloor = this.currentFloor;
      return;
    }
    const nextFloor = this.queue[0];
    this.direction = nextFloor > this.currentFloor ? 'up' : nextFloor < this.currentFloor ? 'down' : 'idle';
    this.targetFloor = nextFloor;
  }

  moveToNextFloor() {
    if (this.isMoving || this.queue.length === 0) return;

    const nextFloor = this.queue[0];
    if (nextFloor === this.currentFloor) {
      this.openDoors();
      return;
    }

    this.isMoving = true;
    this.currentFloor += nextFloor > this.currentFloor ? 1 : -1;
    const moveTime = CONFIG.elevatorDefaults.floorTravelTime / this.simulationEngine.speed;
    this.moveTimer = window.setTimeout(() => {
      this.isMoving = false;
      if (this.currentFloor === nextFloor) {
        this.queue.shift();
        this.openDoors();
      } else {
        this.moveToNextFloor();
      }
    }, moveTime);
  }

  openDoors() {
    if (this.doorState !== 'closed') return;
    this.doorState = 'opening';
    this.isBoarding = true;

    const openTime = CONFIG.elevatorDefaults.doorOpenTime / this.simulationEngine.speed;
    this.doorTimer = window.setTimeout(() => {
      this.doorState = 'open';
      this.handlePassengerMovement();

      const boardingTime = (CONFIG.personSettings.enterDuration + CONFIG.personSettings.exitDuration) / this.simulationEngine.speed;
      this.boardingTimer = window.setTimeout(() => this.closeDoors(), boardingTime);
    }, openTime / 2);
  }

  handlePassengerMovement() {
    const floor = this.currentFloor;

    // People exit first
    const exitingPeople = this.people.filter(p => p.destinationFloor === floor);
    exitingPeople.forEach(person => {
      person.updateState('exiting');
      window.setTimeout(() => {
        this.people = this.people.filter(p => p.id !== person.id);
        this.simulationEngine.ui.updateElevatorDisplay(this.id);
      }, CONFIG.personSettings.exitDuration / this.simulationEngine.speed);
    });

     
    // Then people enter
    const waitingPeople = this.simulationEngine.requestHandler
      ? this.simulationEngine.requestHandler.getWaitingPeopleAtFloor(floor)
      : [];
    const availableCapacity = this.capacity - (this.people.length - exitingPeople.length);
    const enteringPeople = waitingPeople.slice(0, availableCapacity);

    window.setTimeout(() => {
      enteringPeople.forEach((person: Person) => {
        if (person.direction === this.direction || this.direction === 'idle') {
          person.updateState('entering');
          person.elevatorId = this.id;
          window.setTimeout(() => {
            person.updateState('inside');
            this.people.push(person);
            if (this.simulationEngine.requestHandler) {
              this.simulationEngine.requestHandler.removeWaitingPerson(person);
            }
            this.simulationEngine.ui.updateElevatorDisplay(this.id);
            this.simulationEngine.ui.updateFloorWaitingArea(floor);
          }, CONFIG.personSettings.enterDuration / this.simulationEngine.speed);
        }
      });
    }, CONFIG.personSettings.exitDuration / this.simulationEngine.speed);
  }

  closeDoors() {
    if (this.doorState !== 'open') return;
    this.doorState = 'closing';
    this.isBoarding = false;

    const closeTime = CONFIG.elevatorDefaults.doorCloseTime / this.simulationEngine.speed;
    this.doorTimer = window.setTimeout(() => {
      this.doorState = 'closed';
      this.updateDirection();
      if (this.queue.length > 0) {
        window.setTimeout(() => this.moveToNextFloor(), 100);
      }
    }, closeTime);
  }

  getUtilization() {
    return this.people.length / this.capacity;
  }

  reset() {
    if (this.doorTimer) window.clearTimeout(this.doorTimer);
    if (this.moveTimer) window.clearTimeout(this.moveTimer);
    if (this.boardingTimer) window.clearTimeout(this.boardingTimer);

    this.currentFloor = 1;
    this.targetFloor = 1;
    this.direction = 'idle';
    this.doorState = 'closed';
    this.people = [];
    this.queue = [];
    this.isMoving = false;
    this.isBoarding = false;
  }
}

export default Elevator;
