import express from 'express';
import SimulationEngine from '@/apis/services/SimulationEngine';

const router = express.Router();
const simEngine = SimulationEngine.getInstance();

/**
 * @swagger
 * tags:
 *   name: Simulation
 *   description: Elevator simulation management
 */

/**
 * @swagger
 * /api/simulation/snapshot:
 *   get:
 *     summary: Get current simulation snapshot
 *     tags: [Simulation]
 *     responses:
 *       200:
 *         description: Snapshot retrieved
 */
router.get('/snapshot', (req, res) => {
  res.json(simEngine.getSnapshot());
});

/**
 * @swagger
 * /api/simulation/start:
 *   post:
 *     summary: Start the simulation
 *     tags: [Simulation]
 *     responses:
 *       200:
 *         description: Simulation started
 */
router.post('/start', (req, res) => {
  simEngine.start();
  res.json({ status: 'started' });
});

/**
 * @swagger
 * /api/simulation/stop:
 *   post:
 *     summary: Stop the simulation
 *     tags: [Simulation]
 *     responses:
 *       200:
 *         description: Simulation stopped
 */
router.post('/stop', (req, res) => {
  simEngine.stop();
  res.json({ status: 'stopped' });
});

/**
 * @swagger
 * /api/simulation/reset:
 *   post:
 *     summary: Reset the simulation
 *     tags: [Simulation]
 *     responses:
 *       200:
 *         description: Simulation reset
 */
router.post('/reset', (req, res) => {
  simEngine.reset();
  res.json({ status: 'reset' });
});

/**
 * @swagger
 * /api/simulation/config:
 *   post:
 *     summary: Update simulation config
 *     tags: [Simulation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Config updated
 *       400:
 *         description: Invalid request body
 */
router.post('/config', (req, res) => {
  const { key, value } = req.body;
  if (key && value !== undefined) {
    simEngine.updateConfig(key, value);
    return res.json({ status: 'config updated', key, value });
  }
  res.status(400).json({ error: 'Invalid request body' });
});

export default router;