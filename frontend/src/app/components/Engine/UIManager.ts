import { CONFIG } from '../../utils/config';
import { Direction } from '../../types/types';
import SimulationEngine from './SimulationEngine';
import Request
 from './Request';
import { SimulationStore } from '../../store/useSimulationStore';
class UIManager {
  floorPanelButtons: Record<string, HTMLButtonElement> = {};
  elevatorElements: Record<
    number,
    {
      car: HTMLElement;
      direction: HTMLElement;
      passengersDisplay: HTMLElement;
      passengerCount: HTMLElement;
      passengerIcons: HTMLElement;
    }
  > = {};
  floorWaitingAreas: Record<number, HTMLElement> = {};
  animationSpeed = 1;
  simulationEngine: SimulationEngine;
  // store: SimulationStore;
  constructor(simulationEngine: SimulationEngine) {
    this.simulationEngine = simulationEngine;
    // this.store= useSimulationStore.getState();
  }

  initialize() {
    this.createFloorPanels();
    this.createElevatorBank();
    // this.setupEventListeners();
    this.updateMetrics();
  }

  createFloorPanels() {
    const container = document.getElementById('floor-panels');
    if (!container) return;

    container.innerHTML = '';
    this.floorPanelButtons = {};
    this.floorWaitingAreas = {};

    const numFloors = this.simulationEngine.config.numFloors;

    for (let floor = 1; floor <= numFloors; floor++) {
      const panel = document.createElement('div');
      panel.className = 'floor-panel';

      const floorNumber = document.createElement('div');
      floorNumber.className = 'floor-number';
      floorNumber.textContent = floor.toString();

      const buttons = document.createElement('div');
      buttons.className = 'floor-buttons';

      // Up button
      const upBtn = document.createElement('button');
      upBtn.className = 'floor-btn';
      upBtn.innerHTML = '↑';
      upBtn.title = `Call elevator up from floor ${floor}`;
      if (floor >= numFloors) {
        upBtn.disabled = true;
        upBtn.style.opacity = '0.3';
      } else {
        upBtn.addEventListener('click', () => this.handleFloorRequest(floor, 'up'));
      }
      buttons.appendChild(upBtn);
      this.floorPanelButtons[`${floor}-up`] = upBtn;

      // Down button
      const downBtn = document.createElement('button');
      downBtn.className = 'floor-btn';
      downBtn.innerHTML = '↓';
      downBtn.title = `Call elevator down from floor ${floor}`;
      if (floor <= 1) {
        downBtn.disabled = true;
        downBtn.style.opacity = '0.3';
      } else {
        downBtn.addEventListener('click', () => this.handleFloorRequest(floor, 'down'));
      }
      buttons.appendChild(downBtn);
      this.floorPanelButtons[`${floor}-down`] = downBtn;

      // Floor waiting area for showing waiting people
      const waitingArea = document.createElement('div');
      waitingArea.className = 'floor-waiting-area';
      const waitingPeople = document.createElement('div');
      waitingPeople.className = 'waiting-people';
      waitingArea.appendChild(waitingPeople);
      this.floorWaitingAreas[floor] = waitingPeople;

      panel.appendChild(floorNumber);
      panel.appendChild(buttons);
      panel.appendChild(waitingArea);

      container.appendChild(panel);
    }
  }

  createElevatorBank() {
    const container = document.getElementById('elevator-bank');
    if (!container) return;

    container.innerHTML = '';
    this.elevatorElements = {};

    const numElevators = this.simulationEngine.config.numElevators;
    const defaultCapacity = CONFIG.elevatorDefaults.capacity;

    for (let i = 0; i < numElevators; i++) {
      const shaft = document.createElement('div');
      shaft.className = 'elevator-shaft';

      const car = document.createElement('div');
      car.className = 'elevator-car';
      car.style.bottom = '5px';

      const doors = document.createElement('div');
      doors.className = 'elevator-doors';

      const leftDoor = document.createElement('div');
      leftDoor.className = 'door left';

      const rightDoor = document.createElement('div');
      rightDoor.className = 'door right';

      doors.appendChild(leftDoor);
      doors.appendChild(rightDoor);

      const info = document.createElement('div');
      info.className = 'elevator-info';

      const direction = document.createElement('div');
      direction.className = 'elevator-direction';
      direction.textContent = '⚪'; // Idle symbol

      const passengersDisplay = document.createElement('div');
      passengersDisplay.className = 'elevator-passengers-display';
      passengersDisplay.textContent = `0/${defaultCapacity}`;

      info.appendChild(direction);
      info.appendChild(passengersDisplay);

      const passengers = document.createElement('div');
      passengers.className = 'elevator-passengers';

      const passengerCount = document.createElement('div');
      passengerCount.className = 'passenger-count';
      // passengerCount.textContent = '👥 0/8'; // Optional detailed count

      const passengerIcons = document.createElement('div');
      passengerIcons.className = 'passenger-icons';

      passengers.appendChild(passengerCount);
      passengers.appendChild(passengerIcons);

      car.appendChild(doors);
      car.appendChild(info);
      car.appendChild(passengers);

      shaft.appendChild(car);
      container.appendChild(shaft);

      this.elevatorElements[i] = {
        car,
        direction,
        passengersDisplay,
        passengerCount,
        passengerIcons,
      };
    }
  }

  updateElevators() {
    this.simulationEngine.elevators.forEach((elevator, index) => {
      const element = this.elevatorElements[index];
      if (!element) return;

      const floorHeight = 50; // Assuming each floor's visual height in px
      const bottomPosition = (elevator.currentFloor - 1) * floorHeight + 5;
      element.car.style.bottom = `${bottomPosition}px`;

      const directionSymbol: Record<string, string> = {
        up: '↑',
        down: '↓',
        idle: '⚪',
      };
      element.direction.textContent = directionSymbol[elevator.direction] ?? '⚪';
      element.direction.style.color =
        elevator.direction === 'idle' ? 'var(--color-app-text-muted)' : 'var(--color-primary)';
      element.passengersDisplay.textContent = `${elevator.people.length}/${elevator.capacity}`;

      element.car.className = 'elevator-car';
      if (elevator.doorState === 'opening' || elevator.doorState === 'open') {
        element.car.classList.add('doors-opening');
      }
      if (elevator.doorState === 'open') {
        element.car.classList.add('doors-open');
      }
      if (elevator.isMoving) {
        element.car.classList.add('moving');
      }

      this.updateElevatorDisplay(index);
    });
  }

  updateElevatorDisplay(elevatorId: number) {
    const elevator = this.simulationEngine.elevators[elevatorId];
    const element = this.elevatorElements[elevatorId];
    if (!elevator || !element) return;

    element.passengerIcons.innerHTML = '';
    elevator.people.forEach(person => {
      const personIcon = document.createElement('span');
      personIcon.className = 'person';
      personIcon.textContent = CONFIG.personSettings.personIcon;
      personIcon.setAttribute('data-destination', person.destinationFloor.toString());
      if (person.state === 'entering') {
        personIcon.classList.add('person-entering');
      } else if (person.state === 'exiting') {
        personIcon.classList.add('person-exiting');
      }
      element.passengerIcons.appendChild(personIcon);
    });
  }

  updateFloorWaitingArea(floor: number) {
    const waitingArea = this.floorWaitingAreas[floor];
    if (!waitingArea) return;

    const waitingPeople = this.simulationEngine.requestHandler?.getWaitingPeopleAtFloor(floor) || [];

    waitingArea.innerHTML = '';
    waitingPeople.forEach(person => {
      const personIcon = document.createElement('span');
      personIcon.className = 'person waiting';
      personIcon.textContent = CONFIG.personSettings.personIcon;
      personIcon.setAttribute('data-direction', person.direction);
      waitingArea.appendChild(personIcon);
    });
  }

  updateFloorPanel(floor: number, direction: Direction, active: boolean) {
    const key = `${floor}-${direction}`;
    const button = this.floorPanelButtons[key];
    if (!button) return;

    if (active) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }

  // updateRequestQueue() {
  //   const container = document.getElementById('queue-list');
  //   if (!container) return;

  //   const requests = this.simulationEngine.requestHandler?.pendingRequests || [];

  //   if (requests.length === 0) {
  //     container.innerHTML = '<div class="no-requests">No pending requests</div>';
  //     return;
  //   }

  //   container.innerHTML = requests.slice(0, 10).map(request => {
  //     const waitTime = request.getWaitTimeSeconds();
  //     const priorityClass = waitTime > 30 ? 'urgent' : waitTime > 15 ? 'priority' : '';
  //     const assignedText = request.assigned ? ` (E${request.elevatorId})` : '';

  //     return `
  //       <div class="queue-item ${priorityClass}">
  //         <div class="request-info">
  //           <span class="request-floors">${request.originFloor} → ${request.destinationFloor}${assignedText}</span>
  //           <span class="request-time">${waitTime.toFixed(1)}s</span>
  //         </div>
  //         <span class="request-direction">${request.direction === 'up' ? '↑' : '↓'}</span>
  //       </div>
  //     `;
  //   }).join('');
  // }

  // updateMetrics() {
  //   if (!this.simulationEngine.requestHandler) return;

  //   const metrics = this.simulationEngine.requestHandler.getMetrics();
  //   const elevators = this.simulationEngine.elevators;
    //  console.log("MetricsPanel UIManager", metrics);
    // console.log("Elevators in MetricsPanel UIManager", elevators);
    // this.store.setMetrics(metrics);
    // this.store.setElevators(elevators);
    // const utilization =
    //   elevators.length > 0
    //     ? (elevators.reduce((sum, e) => sum + e.getUtilization(), 0) / elevators.length) * 100
    //     : 0;

    // const setText = (id: string, text: string | number) => {
    //   const el = document.getElementById(id);
    //   if (el) el.textContent = typeof text === 'number' ? text.toFixed(1) : text.toString();
    // };

    // setText('avg-wait-time', metrics.avgWaitTime.toFixed(1) + 's');
    // setText('max-wait-time', metrics.maxWaitTime.toFixed(1) + 's');
    // setText('avg-travel-time', metrics.avgTravelTime.toFixed(1) + 's');
    // setText('utilization-rate', utilization.toFixed(1) + '%');
    // setText('total-requests', metrics.totalRequests);
    // setText('completed-requests', metrics.completedRequests);
  // }

  // updateSimulationTime() {
  //   const elapsed =
  //     this.simulationEngine.isRunning && this.simulationEngine.startTime
  //       ? (Date.now() - this.simulationEngine.startTime) / 1000
  //       : 0;
  //   const minutes = Math.floor(elapsed / 60);
  //   const seconds = Math.floor(elapsed % 60);
  //   const el = document.getElementById('simulation-time');
  //   if (el)
  //     el.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  // }

  handleFloorRequest(floor: number, direction: Direction) {
    const maxFloor = this.simulationEngine.config.numFloors;
    let destinationFloor: number | undefined;

    if (direction === 'up') {
      const possibleFloors = [];
      for (let f = floor + 1; f <= maxFloor; f++) {
        possibleFloors.push(f);
      }
      destinationFloor = possibleFloors[Math.floor(Math.random() * possibleFloors.length)];
    } else {
      const possibleFloors = [];
      for (let f = 1; f < floor; f++) {
        possibleFloors.push(f);
      }
      destinationFloor = possibleFloors[Math.floor(Math.random() * possibleFloors.length)];
    }

    if (destinationFloor !== undefined) {
      const request = new Request(floor, destinationFloor);
      this.simulationEngine.requestHandler?.addRequest(request);
      console.log(`Manual request: Floor ${floor} → ${destinationFloor} (${direction})`);
    }
  }

//   setupEventListeners() {
//     const numElevatorsSlider = document.getElementById('num-elevators') as HTMLInputElement | null;
//     const numFloorsSlider = document.getElementById('num-floors') as HTMLInputElement | null;
//     const requestFrequencySlider = document.getElementById('request-frequency') as HTMLInputElement | null;

//     if (numElevatorsSlider) {
//       numElevatorsSlider.addEventListener('input', e => {
//         const target = e.target as HTMLInputElement;
//         document.getElementById('num-elevators-value')!.textContent = target.value;
//         this.simulationEngine.updateConfig('numElevators', parseInt(target.value));
//       });
//     }

//     if (numFloorsSlider) {
//       numFloorsSlider.addEventListener('input', e => {
//         const target = e.target as HTMLInputElement;
//         document.getElementById('num-floors-value')!.textContent = target.value;
//         this.simulationEngine.updateConfig('numFloors', parseInt(target.value));
//       });
//     }

//     if (requestFrequencySlider) {
//       requestFrequencySlider.addEventListener('input', e => {
//         const target = e.target as HTMLInputElement;
//         document.getElementById('request-frequency-value')!.textContent = `${target.value}ms`;
//         this.simulationEngine.updateConfig('requestFrequency', parseInt(target.value));
//       });
//     }

//     const peakTrafficCheckbox = document.getElementById('peak-traffic') as HTMLInputElement | null;
//     if (peakTrafficCheckbox) {
//       peakTrafficCheckbox.addEventListener('change', e => {
//         const target = e.target as HTMLInputElement;
//         this.simulationEngine.updateConfig('peakTrafficMode', target.checked);
//       });
//     }

//     // Speed buttons
//    document.querySelectorAll('.speed-btn').forEach(btn => {
//   btn.addEventListener('click', () => {
//     document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
//     btn.classList.add('active');

//     const newSpeed = parseFloat((btn as HTMLElement).dataset.speed || '1');
//       this.store.setSpeed(newSpeed);
//     this.simulationEngine.setSpeed(newSpeed);
    
//   });
// });


//     // const startBtn = document.getElementById('start-btn');
//     // const stopBtn = document.getElementById('stop-btn');
//     // const resetBtn = document.getElementById('reset-btn');

//     // if (startBtn) startBtn.addEventListener('click', () => this.simulationEngine.start());
//     // if (stopBtn) stopBtn.addEventListener('click', () => this.simulationEngine.stop());
//     // if (resetBtn) resetBtn.addEventListener('click', () => this.simulationEngine.reset());

//     // Scenario buttons
//     document.querySelectorAll<HTMLElement>('[data-scenario]').forEach(btn => {
//       btn.addEventListener('click', () => {
//         if (!btn.dataset.scenario) return;
//         this.loadScenario(btn.dataset.scenario);
//       });
//     });
//   }

  // loadScenario(scenario: string) {
  //   const scenarios: Record<
  //     string,
  //     { elevators: number; floors: number; frequency: number; peakMode: boolean }
  //   > = {
  //     normal: { elevators: 3, floors: 10, frequency: 3000, peakMode: false },
  //     rush: { elevators: 4, floors: 15, frequency: 1000, peakMode: true },
  //     stress: { elevators: 6, floors: 20, frequency: 500, peakMode: false },
  //   };

  //   const config = scenarios[scenario];
  //   if (!config) return;

  //   const setValue = (id: string, value: string | number | boolean) => {
  //     const el = document.getElementById(id);
  //     if (!el) return;
  //     if (el instanceof HTMLInputElement && typeof value !== 'string') {
  //       if (typeof value === 'boolean') el.checked = value;
  //       else el.value = value.toString();
  //     } else if ('textContent' in el) {
  //       el.textContent = value.toString();
  //     }
  //   };

  //   setValue('num-elevators', config.elevators);
  //   setValue('num-floors', config.floors);
  //   setValue('request-frequency', config.frequency);
  //   setValue('peak-traffic', config.peakMode);
  //   setValue('num-elevators-value', config.elevators);
  //   setValue('num-floors-value', config.floors);
  //   setValue('request-frequency-value', `${config.frequency}ms`);

  //   this.simulationEngine.updateConfig('numElevators', config.elevators);
  //   this.simulationEngine.updateConfig('numFloors', config.floors);
  //   this.simulationEngine.updateConfig('requestFrequency', config.frequency);
  //   this.simulationEngine.updateConfig('peakTrafficMode', config.peakMode);
  // }
}

export default UIManager;
