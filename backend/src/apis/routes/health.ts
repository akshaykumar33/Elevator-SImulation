import express from 'express';
import { logger } from '@/apis/middlewares/logger';

const router = express.Router();

router.get('/', (req, res) => {
      logger.info("Health is Good")
      res.json({ status: 'Health is Good' });
});

export default router;