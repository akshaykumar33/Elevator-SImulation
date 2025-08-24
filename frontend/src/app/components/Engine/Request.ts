
import { CONFIG } from '../../utils/config'
import { Direction } from '../../types/types'
import Person from './Person'

export default class Request {
  id: string;
  timestamp: number;
  originFloor: number;
  destinationFloor: number;
  direction: Direction;
  priority: number = 1;
  waitTime: number = 0;
  assigned: boolean = false;
  completed: boolean = false;
  elevatorId: number | null = null;
  person: Person;
  completionTime?: number;   

  constructor(originFloor: number, destinationFloor: number) {
    this.id = `req_${Date.now()}_${Math.random()}`;
    this.timestamp = Date.now();
    this.originFloor = originFloor;
    this.destinationFloor = destinationFloor;
    this.direction = destinationFloor > originFloor ? 'up' : 'down';
    this.person = new Person(`person_${this.id}`, originFloor, destinationFloor);
    this.completionTime = undefined;
  }

  updateWaitTime() {
    this.waitTime = Date.now() - this.timestamp;
    if (this.waitTime > CONFIG.algorithmSettings.priorityEscalationTime) {
      this.priority = Math.min(5, Math.floor(this.waitTime / CONFIG.algorithmSettings.priorityEscalationTime));
    }
  }

  getWaitTimeSeconds() {
    return this.waitTime / 1000;
  }
}
