import { Router } from 'express';

const router = Router();

router.post('/briefing', (req, res) => {
  const { name, email, phone, projectType, budget, deadline, description, features } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e E-mail são obrigatórios para registrar o briefing.'
    });
  }

  const protocol = `ES-${Date.now().toString(36).toUpperCase()}`;

  const briefingRecord = {
    protocol,
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: phone || 'Não informado',
    projectType: projectType || 'Website Institucional',
    budget: budget || 'A definir',
    deadline: deadline || 'Flexível',
    features: features || [],
    description: description || ''
  };

  console.log('[BRIEFING RECEBIDO]:', briefingRecord);

  res.status(201).json({
    success: true,
    protocol,
    message: 'Briefing transmitido para a rede neural da El Shanday.',
    data: briefingRecord
  });
});

export default router;
