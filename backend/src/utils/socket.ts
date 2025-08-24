import { Server, Socket } from 'socket.io';
import type SimulationEngine from '@/apis/services/SimulationEngine';
import type { SimulationSnapshot } from '@/types/types';
import { logger } from '@/apis/middlewares/logger';


export default function setupSocket(io: Server, simulationEngine: SimulationEngine) {
    io.on('connection', (socket: Socket) => {
        logger.info(`Client connected: ${socket.id}`);

        // Send initial snapshot on connection
        socket.emit('simulation:update', simulationEngine.getSnapshot());

        // Forward SimulationEngine updates to this client
        const onUpdate = (snapshot: SimulationSnapshot) => {
            socket.emit('simulation:update', snapshot);
        };
        simulationEngine.on('update', onUpdate);

        // Listen for control commands
        socket.on('simulation:start', () => simulationEngine.start());
        socket.on('simulation:stop', () => simulationEngine.stop());
        socket.on('simulation:reset', () => simulationEngine.reset());
        socket.on('simulation:updateConfig', ({ key, value }) => {
            simulationEngine.updateConfig(key, value);
        });

        socket.on('simulation:floorRequest', ({ floor, direction }) => simulationEngine.handleFloorRequest(floor, direction));
        socket.on('simulation:elevatorDisplayUpdate', ({ elevatorId }) => simulationEngine.updateElevatorDisplay(elevatorId));
        socket.on('simulation:floorWaitingAreaUpdate', ({ floor }) => simulationEngine.updateFloorWaitingArea(floor));
        socket.on('simulation:floorPanelUpdate', ({ floor, direction, active }) => simulationEngine.updateFloorPanel(floor, direction, active));

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
            simulationEngine.off('update', onUpdate);
        });
    });
}
