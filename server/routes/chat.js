import { Router } from 'express';

const router = Router();

router.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Mensagem não fornecida.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `Você é a IA Cyberpunk da Agência El Shanday (Web Design futurista, 3D WebGL, Automações e IA). Responda em português com tom cyberpunk, prestativo e profissional. Pergunta do usuário: ${message}`
              }]
            }
          ]
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return res.json({ success: true, reply, source: 'gemini-ai' });
      }
    } catch (err) {
      console.warn('[Gemini API error, using fallback]:', err.message);
    }
  }

  // Fallback Inteligente caso não tenha API key configurada
  const lower = message.toLowerCase();
  let reply = 'Protocolo El Shanday ativo. Como posso ajudar a transformar sua presença digital hoje?';

  if (lower.includes('preço') || lower.includes('quanto custa') || lower.includes('valor')) {
    reply = 'Nossos projetos de alta performance começam a partir de R$ 1.800, variando conforme integrações 3D, IA e complexidade. Você pode usar nossa calculadora na aba Briefing!';
  } else if (lower.includes('serviço') || lower.includes('fazem')) {
    reply = 'Desenvolvemos SPAs futuristas, Web Design Cyberpunk, experiências 3D com Three.js, shaders, automações e integração com agentes de IA.';
  } else if (lower.includes('contato') || lower.includes('whatsapp')) {
    reply = 'Você pode agendar um atendimento direto pelo nosso modal de WhatsApp ou enviar um briefing detalhado na aba Briefing.';
  }

  return res.json({
    success: true,
    reply,
    source: 'cyber-neural-fallback'
  });
});

export default router;
