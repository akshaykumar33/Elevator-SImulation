export const CONFIG = {
    elevatorDefaults: {
        capacity: 8,
        doorOpenTime: 2000,
        doorCloseTime: 1500,
        floorTravelTime: 1000,
        currentFloor: 1,
        targetFloor: 1,
        direction: 'idle',
        doorState: 'closed',
    },
    scenario: {
        normal: { numElevators: 3, numFloors: 10, requestFrequency: 3000, peakTrafficMode: false },
        rush: { numElevators: 4, numFloors: 15, requestFrequency: 1000, peakTrafficMode: true },
        stress: { numElevators: 6, numFloors: 20, requestFrequency: 500, peakTrafficMode: false }
    },
    simulationDefaults: {
        numElevators: 3,
        numFloors: 10,
        requestFrequency: 2000,
        simulationSpeed: 1,
        peakTrafficMode: false
    },
    algorithmSettings: {
        priorityEscalationTime: 30000,
        morningRushStart: 8,
        morningRushEnd: 10,
        lobbyPriorityMultiplier: 1.5,
        maxWaitTime: 60000
    },
    uiSettings: {
        animationDuration: 800,
        updateInterval: 100,
        metricsUpdateInterval: 1000
    },
    personSettings: {
        enterDuration: 1000,
        exitDuration: 800,
        walkSpeed: 200,
        personIcon: "👤",
        maxVisiblePeople: 8,
        maxPeoplePerFloor: 5
    }
};