import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limit: max 10 briefing submissions per 5 minutes per IP
const briefingLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Limite de envio de briefings atingido. Tente novamente em alguns minutos.',
});

router.post('/briefing', briefingLimiter, (req, res) => {
  const { name, email, phone, projectType, budget, deadline, description, features } =
    req.body || {};

  // Validations
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Nome é obrigatório.', code: 'INVALID_NAME' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: { message: 'E-mail inválido.', code: 'INVALID_EMAIL' },
    });
  }

  if (name.length > 100 || email.length > 100) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Campos excedem o limite de caracteres permitido.',
        code: 'INPUT_TOO_LONG',
      },
    });
  }

  const protocol = `ES-${Date.now().toString(36).toUpperCase()}`;

  const sanitizedRecord = {
    protocol,
    receivedAt: new Date().toISOString(),
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 100),
    phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : 'Não informado',
    projectType:
      typeof projectType === 'string' ? projectType.trim().slice(0, 80) : 'Website Institucional',
    budget: typeof budget === 'string' ? budget.trim().slice(0, 50) : 'A definir',
    deadline: typeof deadline === 'string' ? deadline.trim().slice(0, 50) : 'Flexível',
    features: Array.isArray(features)
      ? features.slice(0, 10).map((f) => String(f).slice(0, 50))
      : [],
    description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
  };

  console.log(
    `[BRIEFING REGISTRADO] Protocolo: ${protocol} - Cliente: ${sanitizedRecord.name} <${sanitizedRecord.email}>`
  );

  res.status(201).json({
    success: true,
    protocol,
    message: 'Briefing registrado com sucesso na rede neural El Shanday.',
    data: sanitizedRecord,
  });
});

export default router;
