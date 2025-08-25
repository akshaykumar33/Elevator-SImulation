
***

# Elevator Simulation Backend

A scalable elevator simulation backend built with Node.js, TypeScript, Express, and Socket.IO providing real-time elevator system simulation with dynamic scheduling algorithms. This backend offers RESTful APIs, WebSocket events, and OpenAPI (Swagger) documentation.

***

## Table of Contents

- [Project Overview](#project-overview)  
- [Folder Structure](#folder-structure)  
- [Installation](#installation)  
- [Running the Project Locally](#running-the-project-locally)  
- [Running with Docker](#running-with-docker)  
- [API Documentation](#api-documentation)  
- [Architecture & Components](#architecture--components)  
  - [Simulation Engine](#simulation-engine)  
  - [Elevator Scheduler](#elevator-scheduler)  
  - [Request Handler](#request-handler)  
  - [Elevator Model](#elevator-model)  
  - [Person Model](#person-model)  
  - [Request Model](#request-model)  
- [WebSocket Events](#websocket-events)  
- [Configuration](#configuration)  
- [Logging & Error Handling](#logging--error-handling)  
- [Further Improvements](#further-improvements)

***

## Project Overview

This backend simulates multiple elevators serving requests dynamically based on configurable algorithms. It supports real-time client updates via WebSockets and RESTful endpoints to control the simulation (start, stop, reset, config updates).

Elevator scheduling uses multi-level fallback algorithms:
- Hybrid heuristic scoring
- Load balancing
- Disk-scheduling inspired (LOOK + FCFS)
- Round-robin fallback

***

## Folder Structure

```
/src
 ├── apis
 │    ├── middlewares
 │    │    ├── error.ts           # Error handling middleware
 │    │    ├── logger.ts          # Logger and request logging middleware
 │    ├── models
 │    │    ├── Elevator.ts        # Elevator class & logic
 │    │    ├── Person.ts          # Person class representing user inside/request
 │    │    ├── Request.ts         # Request class with priority and state
 │    ├── routes
 │    │    ├── health.ts          # Health check endpoint
 │    │    ├── simulation.ts      # Simulation control API routes
 │    ├── services
 │    │    ├── ElevatorScheduler.ts  # Elevator assignment algorithms
 │    │    ├── RequestHandler.ts      # Request generation and processing
 │    │    ├── SimulationEngine.ts    # Core simulation orchestrator
 ├── docs
 │    ├── swagger.ts               # Swagger config for API docs
 ├── utils
 │    ├── config.ts                # Config constants for simulation behavior
 │    ├── socket.ts                # WebSocket setup & event handling
 ├── app.ts                       # Express app setup
 ├── index.ts                     # Server and Socket.io startup
/dockerignore                    # Docker ignore patterns
/Dockerfile                     # Docker build configuration
/package.json                   # Node dependencies and scripts
/.gitignore                     # Git ignore file
```

***

## Installation

1. **Clone the repository**

```bash
git clone <https://github.com/akshaykumar33/Elevator-SImulation>
cd <backend>
```

2. **Install dependencies**

```bash
npm install
```

***

## Running the Project Locally

1. **Build the TypeScript project**

```bash
npm run build
```

2. **Start the server**

```bash
npm start
```

3. The backend will run on port `8000` (default). You can access:

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`
- The WebSocket server available on the same port for real-time updates

***

## Running with Docker

1. **Build the Docker image**

```bash
docker build -t elevator-simulation-backend .
```

2. **Run the container**

```bash
docker run -p 8000:8000 elevator-simulation-backend
```

- The server will expose port `8000` (mapped from container's port 8000).

3. Access API and WebSocket on `http://localhost:8000`

***

## API Documentation

API documentation is served with Swagger UI at `/docs` route, including:

- GET `/api/simulation/snapshot` – Get current simulation state
- POST `/api/simulation/start` – Start the simulation
- POST `/api/simulation/stop` – Stop the simulation
- POST `/api/simulation/reset` – Reset the simulation
- POST `/api/simulation/config` – Update simulation configuration dynamically

***

## Architecture & Components

### Simulation Engine

Central orchestrator managing:

- Elevators creation and state
- Request handling and assignment via scheduler
- Simulation lifecycle: start, stop, reset
- Periodic ticks to move elevators and process requests
- Emits updates and events over WebSocket

### Elevator Scheduler

Multi-level fallback request assignment with algorithms:

- Hybrid heuristic (distance, direction, utilization, priority scoring)
- Load balancing by utilization and queue size
- LOOK and FCFS inspired scheduling
- Round-robin fallback for edge cases
- Idle elevator repositioning optimization

### Request Handler

Manages passenger requests:

- Generates random requests respecting peak traffic modes
- Tracks pending, completed requests and waiting passengers on floors
- Handles request timeouts and priority escalation
- Emits updates for floor panels and waiting area

### Elevator Model

Elevator state machine with:

- Current floor, target floors queue, direction, door state
- Movement and door timers aligned with simulation speed
- Boarding handling for entering and exiting passengers
- Capacity and utilization tracking

### Person Model

Represents a person requesting service:

- Current floor, destination floor, movement direction
- States: waiting, entering, inside, exiting

### Request Model

Represents a passenger's request:

- Origin floor, destination floor, direction
- Priority escalates with wait time
- Assignment to elevator and completion status

***

## WebSocket Events

Real-time events emitted by `SimulationEngine` to connected clients:

- `simulation:update` – Full snapshot update of elevators, requests, metrics
- `simulation:floorPanelUpdate` – Floor button panel state changes
- `simulation:floorWaitingAreaUpdate` – Waiting people updates on floors
- `simulation:elevatorDisplayUpdate` – Elevator display updates on passenger changes
- Controls accepted via WebSocket commands: start, stop, reset, updateConfig, floorRequest

***

## Configuration

Located in `/src/utils/config.ts`, main parameters include:

- Elevator capacities and timings (door open, close, floor travel)
- Scenario presets (normal, rush, stress with varying elevators/floors/request frequency)
- Algorithm tuning like priority escalation, lobby priority multiplier
- UI refresh and animation intervals
- Person behavior timings for entering and exiting elevators

***

## Logging & Error Handling

- Winston logger tracks request info and errors
- Express middleware captures and returns a 500 response on errors
- Logs client connections and disconnections on WebSocket
- Informative logs on request generation, assignment, and completions

***

## Further Improvements

- Frontend integration for real-time simulation visualization
- Persistent storage for long-term metrics and historical simulation data
- More advanced elevator scheduling algorithms or machine learning
- Configurable multi-building simulation support
- Extend API to support user authentication and role-based controls

***

## Testing

This project includes a robust automated test suite covering all critical parts of the elevator simulation backend, ensuring code quality, reliability, and correctness.

### Test Types

- **Unit Tests**: Focused on individual modules such as Elevator, Person, and Request models.
- **Integration Tests**: Validate interactions between major services like ElevatorScheduler and RequestHandler with the SimulationEngine.
- **End-to-End (E2E) Tests**: Verify the REST API endpoints for simulation control and snapshot retrieval.

### Test Framework

- The tests use [Jest](https://jestjs.io/) as the testing framework.
- Supertest is used for HTTP request testing of Express routes in E2E tests.

### Test Files

- `Elevator.unit.test.ts` — Unit tests for elevator behaviors and state changes.
- `Person.unit.test.ts` — Unit tests checking person state progression and timing.
- `Request.unit.test.ts` — Unit tests for request lifecycle and priority calculations.
- `ElevatorScheduler.integration.test.ts` — Integration tests covering elevator assignment algorithms and scheduler optimizations.
- `RequestHandler.integration.test.ts` — Integration tests for request generation and processing logic.
- `simulation.e2e.test.ts` — End-to-end API tests for simulation management routes.
- `setup.ts` and `teardown.ts` — Jest global setup and cleanup scripts.

### Running Tests

1. **Install dev dependencies (if not done):**
```bash
npm install
```

2. **Run all tests with coverage:**
```bash
npm test
```

3. **Run jest interactively (watch mode):**
```bash
npm run test:watch
```

### Coverage

- The test coverage includes key functional areas:
  - Elevator movement and door operations
  - Elevator scheduling and request assignment strategies
  - Request lifecycle and priority escalation
  - Simulation API endpoints behavior and responses
- Test results and coverage reports help maintain code integrity during development.

### Notes

- Tests use Jest’s fake timers to simulate passage of time for wait time and state transitions.
- Mocking is used where appropriate to isolate units (e.g., mocking Math.random in tests).

***

This Testing section ensures developers and reviewers can reliably validate changes and confidently maintain high code quality while evolving the elevator simulation backend.