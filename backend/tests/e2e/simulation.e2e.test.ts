import request from 'supertest';
import app from '../../src/app';
import { describe,test,expect } from '@jest/globals';

describe('Simulation API End-to-End Tests', () => {
  test('GET /api/simulation/snapshot returns simulation snapshot', async () => {
    const res = await request(app).get('/api/simulation/snapshot');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('elevators');
    expect(res.body).toHaveProperty('requestsQueue');
    expect(res.body).toHaveProperty('config');
  });

  test('POST /api/simulation/start starts the simulation', async () => {
    const res = await request(app).post('/api/simulation/start');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'started' });
  });

  test('POST /api/simulation/stop stops the simulation', async () => {
    const res = await request(app).post('/api/simulation/stop');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'stopped' });
  });

  test('POST /api/simulation/reset resets the simulation', async () => {
    const res = await request(app).post('/api/simulation/reset');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'reset' });
  });

  test('POST /api/simulation/config updates configuration', async () => {
    const res = await request(app)
      .post('/api/simulation/config')
      .send({ key: 'numElevators', value: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'config updated', key: 'numElevators', value: 5 });
  });

  test('POST /api/simulation/config with invalid body returns 400', async () => {
    const res = await request(app)
      .post('/api/simulation/config')
      .send({ invalid: 'data' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
