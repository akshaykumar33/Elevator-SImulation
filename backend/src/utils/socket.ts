import { Server, Socket } from 'socket.io';
import type SimulationEngine from '@/apis/services/SimulationEngine';
import type { SimulationSnapshot,Direction } from '@/types/types';
import { logger } from '@/apis/middlewares/logger';


export default function setupSocket(io: Server, simulationEngine: SimulationEngine) {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Send initial snapshot on connection
        socket.emit('simulation:update', simulationEngine.getSnapshot());

        // Forward SimulationEngine updates to this client
        const onUpdate = (snapshot: SimulationSnapshot) => {
            socket.emit('simulation:update', snapshot);
        };
        simulationEngine.on('update', onUpdate);

        const onFloorPanelUpdate = (data:{floor:number,direction:Direction,active:boolean}) => {
            socket.emit("simulation:floorPanelUpdate", data);
        };

        simulationEngine.on("floorPanelUpdate", onFloorPanelUpdate);

        const onFloorWaitingAreaUpdate = (data: { floor: number; waitingPeople: any[] }) => {
            socket.emit('simulation:floorWaitingAreaUpdate', data);
        };

        const onElevatorDisplayUpdate = (data: { elevatorId: number }) => {
            socket.emit('simulation:elevatorDisplayUpdate', data);
        };

        simulationEngine.on('simulation:floorWaitingAreaUpdate', onFloorWaitingAreaUpdate);
        simulationEngine.on('simulation:elevatorDisplayUpdate', onElevatorDisplayUpdate);

        // Listen for control commands
        socket.on('simulation:start', () => simulationEngine.start());
        socket.on('simulation:stop', () => simulationEngine.stop());
        socket.on('simulation:reset', () => simulationEngine.reset());
        socket.on('simulation:updateConfig', ({ key, value }) => {
            simulationEngine.updateConfig(key, value);
        });

        socket.on('simulation:floorRequest', ({ floor, direction }) => simulationEngine.handleFloorRequest(floor, direction));
   

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
            simulationEngine.off('update', onUpdate);
        });
    });
}