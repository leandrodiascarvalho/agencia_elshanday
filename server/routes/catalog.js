import { Router } from 'express';
import { SERVICES } from '../data/services.js';
import { FAQ } from '../data/faq.js';

const router = Router();

router.get('/services', (req, res) => {
  res.json({
    success: true,
    data: SERVICES,
  });
});

router.get('/faq', (req, res) => {
  res.json({
    success: true,
    data: FAQ,
  });
});

export default router;
