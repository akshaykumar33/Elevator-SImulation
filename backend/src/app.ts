import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '@/docs/swagger';
import { requestLogger } from '@/apis/middlewares/logger';
import { errorMiddleware } from '@/apis/middlewares/error';
import simulationRouter from '@/apis/routes/simulation';
import healthRouter from '@/apis/routes/health';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', healthRouter);
app.use('/api/simulation', simulationRouter);
app.use(errorMiddleware);

export default app;
