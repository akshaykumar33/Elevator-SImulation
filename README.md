# Elevator Simulation System

## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Local Setup and Run](#local-setup-and-run)
  - [Backend Setup and Run](#backend-setup-and-run)
  - [Frontend Setup and Run](#frontend-setup-and-run)
- [Running with Docker](#running-with-docker)
- [Configuration](#configuration)
- [Features](#features)
- [Core Components](#core-components)
- [Context and State Management](#context-and-state-management)
- [WebSocket Communication](#websocket-communication)
- [Styling and Theming](#styling-and-theming)
- [Testing and Extending](#testing-and-extending)
- [License](#license)

---

## Project Overview

This project simulates a realistic elevator system featuring multiple configurable elevators serving multiple floors. It models elevator scheduling, passenger movement, and real-time system updates via a backend simulation engine over WebSocket communication.

- The **backend** handles elevator logic, scheduling algorithms, passenger simulation, and WebSocket server communication.
- The **frontend** is a modern Next.js 13 and React 18 TypeScript application that visualizes elevator states, floor panels, ride requests, and metrics, synchronizing live with the backend.

This design enables real-time, configurable simulation scenarios including normal and rush hours with interactive control and monitoring.

---

## Folder Structure

```
/ (root)
├── backend/                 # Backend source and configuration
│   ├── src/                 # Backend TypeScript source files
├   ├── tests/               # Backend Test Suite(Unit,E2E,Integeration,fixtures,teardown,setup)
│   ├── .env.example         # Backend environment config (e.g. ports)
│   └── Dockerfile           # Backend Dockerfile
├── frontend/                # Frontend Next.js app source
│   ├── app/                 # Next.js app directory (pages and components)
│   │   ├── components/      # React UI components (ElevatorBank, FloorPanels, etc.)
│   │   ├── contexts/        # React Context providers for theming and WebSocket
│   │   ├── stores/          # Zustand global state stores for elevator data
│   │   ├── types/           # TypeScript interfaces and types
│   │   ├── utils/           # Shared utility functions and configuration
│   │   ├── globals.css      # Global Tailwind and CSS styles
│   │   ├── layout.tsx       # Root layout component entry
│   │   └── page.tsx         # Main frontend app page entry point
│   ├── .env.example         # Frontend environment config (backend API URL)
│   ├── Dockerfile           # Frontend Dockerfile
│   ├── package.json         # Frontend npm dependencies and scripts
│   └── tsconfig.json        # Frontend TypeScript configuration
├── docker-compose.yml       # Compose file to run frontend and backend containers
├── .gitignore               # Ignore files list for git
└── README.md                # This README documentation
```

---

## Technologies Used

- **Backend**: Node.js with TypeScript, WebSocket server
- **Frontend**: Next.js 15 (App Directory), React 19, TypeScript
- **State Management**: Zustand (React state store)
- **Real-time Communication**: Socket.IO Client and Server over WebSocket
- **Styling**: Tailwind CSS with custom CSS variables
- **Fonts**: Google Fonts (Geist, Inter)
- **Containerization**: Docker and Docker Compose (Node 20 Alpine base images)

---

## Prerequisites

- Node.js v20+
- npm or Yarn package manager
- Docker and Docker Compose (optional, for containerized runs)
- Basic familiarity with terminal/command line

---

## Local Setup and Run

### Backend Setup and Run

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create and configure `.env` file for backend environment variables (e.g., ports).

4. Run the backend server locally:

   ```
   npm run dev
   ```

   The backend WebSocket API will by default run on port `8000`.

### Frontend Setup and Run

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create `.env.local` file with the backend API URL:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the frontend development server:

   ```
   npm run dev
   ```

5. Open your browser at [http://localhost:7000](http://localhost:7000) to see the app.

---

## Running with Docker

You can use Docker Compose to run both backend and frontend containers easily.

1. At the project root, build and start containers with:

   ```
   docker-compose up --build
   ```

2. This will start:

   - Backend on port `8000`
   - Frontend on port `7000`

3. Access the frontend UI at [http://localhost:7000](http://localhost:7000).

4. To stop and remove containers:

   ```
   docker-compose down
   ```

*Note:* Ensure the backend URL inside frontend container is properly configured with `NEXT_PUBLIC_API_URL` environment variable for seamless socket communication.

---

## Configuration

Simulation and UI parameters are centralized in `config.ts` and include:

- Elevator defaults: capacity, door open/close times, travel durations
- Simulation scenarios: normal, rush hour, stress test with floor and elevator counts and request frequencies
- Scheduling algorithm parameters (priority timing, lobby priority)
- UI update intervals and animation settings
- Person/passenger limits and animation speed

These configurations can be dynamically changed via the Control Panel UI or programmatically.

---

## Features

- Real-time multi-elevator simulation with comprehensive floor and passenger modeling
- Live updates via WebSocket ensuring synchronized frontend and backend states
- Configurable simulation speed and diverse traffic scenarios
- Elevator state display including positions, directions, doors, passengers, and capacity
- Floor request panels with up/down buttons for passenger calls
- Waiting area indicators displaying passengers waiting per floor
- Metrics and statistics panel with average wait times, requests completed, elevator utilization
- Dark/light mode toggling fitting system preferences
- Responsive UI with Tailwind CSS, accessible controls, and keyboard navigation support

---

## Core Components

- **BuildingDisplay**: Overall UI container integrating elevator and floor views
- **ElevatorBank**: Visual representation of each elevator’s current floor, direction, door status, and passenger load
- **FloorPanels**: Controls for floor-level elevator requests (call buttons)
- **ControlPanel**: Simulation control interface for start/stop, speed tuning, and scenario selection
- **MetricsPanel**: Displays key performance indicators and elevator usage
- **SidePanel**: Hosts the MetricsPanel and the queue of pending floor requests
- **Header**: Application title, connectivity status, and theme toggle

---

## Context and State Management

- Zustand global stores manage elevator snapshots, request queues, configuration data, simulation metrics, and UI state such as floor panel button states and waiting area data.
- React Context provides WebSocket connection management through `SimulationSocketContext`, enabling lifecycle event control (start/stop/reset/update config/floor requests).
- Separate theme context manages light/dark mode with system preference detection and manual toggling.

---

## WebSocket Communication

The frontend communicates with the backend simulation engine over Socket.IO WebSockets.

### Key Messages Received

- `simulation:update`: Elevator states, request queue, metrics, configuration, and running status updates
- `simulation:floorPanelUpdate`: Floor panel button active/inactive states
- `simulation:floorWaitingAreaUpdate`: Passenger counts waiting on floors
- `simulation:elevatorDisplayUpdate`: Currently active elevator display id

### Messages Sent

- `simulation:start` / `simulation:stop` / `simulation:reset`: Simulation lifecycle control
- `simulation:updateConfig`: Change simulation parameters dynamically
- `simulation:floorRequest`: Send floor call request with floor number and direction

This event-driven communication ensures frontend UI is always synchronized with backend simulation state.

---

## Styling and Theming

- Tailwind CSS provides a utility-first, responsive styling foundation.
- Global CSS variables enable seamless light/dark theme backgrounds and text coloring.
- Google Fonts (Geist, Inter) integrated with Next.js font optimization for clean typography.
- Theme toggling supports keyboard navigation and screen reader accessibility for inclusive UX.

---

## Testing and Extending

- TypeScript interfaces enforce strong typing on components and state management for maintainability.
- Modular codebase architecture allows easy addition of new elevator scheduling algorithms or UI features by extending backend simulation logic and frontend stores.
- The simulation engine backend is designed for extensibility with clear separation of concerns.
- Frontend components can be styled independently and extended using the existing state and context patterns.

---