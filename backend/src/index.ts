import 'module-alias/register';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import SimulationEngine from '@/apis/services/SimulationEngine';
import setupSocket from '@/utils/socket';
import { logger } from '@/apis/middlewares/logger';

dotenv.config();

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

const simulationEngine = SimulationEngine.getInstance();
setupSocket(io, simulationEngine);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  logger.info(`Server listening on ${PORT}`);
});
