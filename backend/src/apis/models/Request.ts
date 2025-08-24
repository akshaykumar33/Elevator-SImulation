import type { Direction } from "@/types/types";
import { CONFIG } from "@/utils/config";
import Person from "@/apis/models/Person";


export interface RequestSnapshot {
  id: string;
  originFloor: number;
  destinationFloor: number;
  direction: Direction;
  priority: number;
  assigned: boolean;
  completed: boolean;
}

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

  updateWaitTime(): void {
    this.waitTime = Date.now() - this.timestamp;
    if (this.waitTime > CONFIG.algorithmSettings.priorityEscalationTime) {
      this.priority = Math.min(5, Math.floor(this.waitTime / CONFIG.algorithmSettings.priorityEscalationTime));
    }
  }

  getWaitTimeSeconds(): number {
    return this.waitTime / 1000;
  }

  getSnapshot(): RequestSnapshot {
    return {
      id: this.id,
      originFloor: this.originFloor,
      destinationFloor: this.destinationFloor,
      direction: this.direction,
      priority: this.priority,
      assigned: this.assigned,
      completed: this.completed,
    };
  }
}
