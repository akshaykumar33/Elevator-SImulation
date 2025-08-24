import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Elevator Simulation API',
      version: '1.0.0',
      description: 'API docs for Elevator Simulation backend (Express,Socket + TS)'
    },
    
  
},
  apis: ['./src/apis/routes/*.ts'] 
};
