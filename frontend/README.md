# Elevator Simulation System

## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup and Run](#local-setup-and-run)
  - [Running with Docker](#running-with-docker)
- [Configuration](#configuration)
- [Features](#features)
- [Core Components](#core-components)
- [Context and State Management](#context-and-state-management)
- [WebSocket Communication](#websocket-communication)
- [Styling and Theming](#styling-and-theming)
- [Testing and Extending](#testing-and-extending)
- [License](#license)

***

## Project Overview

This project simulates an elevator system with multiple configurable elevators serving multiple floors. It’s designed to model elevator scheduling, passenger movement, and real-time updates driven by a backend simulation engine. The frontend is built with Next.js and React using TypeScript, combined with Zustand for state management and Socket.IO for real-time communication. The backend (not included here) handles the elevator logic and simulation engine.

***

## Folder Structure

```
/
├── app/                # Next.js frontend app source
│   ├── components/     # React components for UI (ElevatorBank, FloorPanels, ControlPanel, etc.)
│   ├── contexts/       # React context providers (Theme, SimulationSocket for websockets)
│   ├── stores/         # Zustand global state stores
│   ├── types/          # TypeScript types and interfaces
│   ├── utils/          # Utility functions and configuration files
│   ├── globals.css     # Global CSS and styling entry
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Main app page entry
├── Dockerfile          # Dockerfile for frontend containerization
├── package.json        # NPM dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

***

## Technologies Used

- **Frontend**: Next.js 13 (app directory), React 18, TypeScript
- **State Management**: Zustand
- **Real-time Communication**: Socket.IO Client
- **Styling**: Tailwind CSS, custom CSS variables
- **Fonts**: Google Fonts (Geist, Inter)
- **Containerization**: Docker (Node 20 Alpine image)
- **Backend (assumed)**: WebSocket server providing elevator simulation updates

***

## Getting Started

### Prerequisites

- Node.js (v20 recommended)
- npm or Yarn
- Docker (optional, for running containerized version)
- Environment variable `NEXT_PUBLIC_API_URL` set for WebSocket backend endpoint

### Local Setup and Run

1. **Clone the repository**:
   ``` bash
   git clone <https://github.com/akshaykumar33/Elevator-SImulation>
   cd <frontend>
   ```

2. **Install dependencies**:
   ``` bash
   npm install
   ```

3. **Create a `.env.local` file at the root with the backend API URL**:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:7000` in your browser to view the app (configured port in Dockerfile).

***

### Running with Docker

To build and run the frontend using Docker:

1. **Build the Docker image**:
   ```bash
   docker build -t elevator-simulation-frontend .
   ```

2. **Run the container**:
   ```bash
   docker run -p 7000:7000 elevator-simulation-frontend
   ```

3. **Access the app at `http://localhost:7000`.**

*Note:* Ensure the backend server is accessible via the `NEXT_PUBLIC_API_URL` environment variable inside the container (configure accordingly in your Docker or docker-compose setup).

***

## Configuration

Configuration options are stored in `config.ts`, including:

- Elevator default settings (capacity, times for door open/close, floor travel)
- Simulation scenarios (normal, rush, stress) defining elevator count, floors, request frequency
- Algorithm parameters (priority timeouts, rush hour timing, lobby priority)
- UI update timings
- Person settings for animation and limits

The `TestScenarios` component allows quick switching between predefined traffic conditions.

***

## Features

- Real-time elevator simulation with multiple elevators and floors
- Dynamic, configurable simulation speed and request frequency
- Simulation scenarios for normal, rush hour, and stress test
- Elevator state display including direction, door status, passengers, and capacity
- Floor panels for requesting elevators (up/down buttons)
- Waiting area display for people waiting per floor
- Metrics panel showing average wait time, utilization, completed requests
- Dark/light theme toggle supporting system preferences
- Responsive design with Tailwind CSS
- WebSocket-based backend communication for live updates

***

## Core Components

- **BuildingDisplay**: Main UI container rendering elevator bank and floor panels
- **ElevatorBank**: Visualizes each elevator's state: floor position, direction, door state, passengers
- **FloorPanels**: Buttons for each floor to request elevator up/down
- **ControlPanel**: Settings to start/stop simulation, adjust speed, and update config
- **MetricsPanel**: Displays performance statistics and elevator utilization
- **SidePanel**: Contains MetricsPanel and RequestQueue for pending passenger requests
- **Header**: App title, status indicator, theme toggle

***

## Context and State Management

- `useSimulationStore` (Zustand): Stores elevator snapshots, request queue, config, simulation metrics, UI states (floor panels, waiting areas), and flag/status controls
- `SimulationSocketContext`: Provides WebSocket connection and action methods to interact with backend (start, stop, reset, update config, floor requests)
- `ThemeContext`: Controls light/dark theme with automatic detection and manual toggle

***

## WebSocket Communication

The client uses Socket.IO to connect to the backend simulation server.

Key events:

- **simulation:update**: Updates elevator states, requests, metrics, config, timer, running status
- **simulation:floorPanelUpdate**: Update floor panel button active states
- **simulation:floorWaitingAreaUpdate**: Update waiting people display at floors
- **simulation:elevatorDisplayUpdate**: Updates active elevator display ID

Client emits include:

- **simulation:start/stop/reset**: Control simulation lifecycle
- **simulation:updateConfig**: Change simulation parameters
- **simulation:floorRequest**: Send floor request with floor number and direction

***

## Styling and Theming

- Uses Tailwind CSS for utility-first styling
- Global CSS variables for light/dark mode backgrounds and foregrounds
- Google Fonts integrated using Next.js font optimization
- Theme toggle accessible with keyboard and screen readers

***

## Testing and Extending

- Components use TypeScript interfaces for strong typing
- Simulation config and state management centralized via hooks/context for easier extension
- Adding new elevator algorithms or UI features involves expanding the `simulationEngine` backend and updating snapshots/state
- UI components can be styled or enhanced independently leveraging modular design

***


