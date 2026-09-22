import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limit: max 20 messages per minute per IP
const chatLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Limite de mensagens atingido. Aguarde alguns instantes antes de enviar novamente.',
});

router.post('/chat', chatLimiter, async (req, res, next) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mensagem vazia ou inválida.', code: 'INVALID_MESSAGE' },
      });
    }

    const cleanMessage = message.trim().slice(0, 500);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Você é o NPC / Agente de IA da Agência El Shanday, especializada em desenvolvimento web de alta performance (HTML5, SCSS, ES6 Vanilla JS, Node.js, Express, 3D Canvas, Retro Gaming 8-bit/16-bit).
Responda em português de forma concisa, amigável e com personalidade retro/cyberpunk.
Pergunta: ${cleanMessage}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({ success: true, reply, source: 'gemini-ai' });
          }
        }
      } catch (err) {
        console.warn(
          '[Gemini AI Gateway Notice]: Usando fallback inteligente.',
          err.name || err.message
        );
      }
    }

    // Intelligent Fallback Knowledge Engine
    const lower = cleanMessage.toLowerCase();
    let reply =
      'Protocolo El Shanday ativo. Como posso ajudar você a subir de nível no mundo digital?';

    if (
      lower.includes('preço') ||
      lower.includes('quanto custa') ||
      lower.includes('valor') ||
      lower.includes('orçamento')
    ) {
      reply =
        'Nossos projetos retro e de alta performance começam a partir de R$ 2.500 para Landing Pages e R$ 4.200 para Web Apps completos. Use a calculadora em tempo real na aba Briefing para simular!';
    } else if (
      lower.includes('serviço') ||
      lower.includes('skills') ||
      lower.includes('fazem') ||
      lower.includes('tecnologias')
    ) {
      reply =
        'Desenvolvemos: 1. Web Apps SPAs Ultra-rápidas; 2. Interfaces Retro Pixel Art & Modernas; 3. Minigames e Shaders 2D/3D (Canvas/WebGL); 4. APIs e Automações com IA.';
    } else if (
      lower.includes('contato') ||
      lower.includes('whatsapp') ||
      lower.includes('falar') ||
      lower.includes('telefone')
    ) {
      reply =
        'Você pode abrir uma conversa instantânea clicando no botão de WhatsApp ou enviar um briefing detalhado na aba Briefing!';
    } else if (lower.includes('prazo') || lower.includes('tempo') || lower.includes('demora')) {
      reply =
        'Trabalhamos com modos Express Speedrun (5 a 10 dias) para projetos prioritários ou campanhas padrão de 15 a 25 dias com garantia de qualidade.';
    } else if (lower.includes('doom') || lower.includes('jogo') || lower.includes('easter egg')) {
      reply =
        'Dica de Player: Experimente os botões [JOGO] e [DOOM] no topo da tela ou digite "matrix" no nosso terminal CLI!';
    }

    return res.json({
      success: true,
      reply,
      source: 'neural-fallback-engine',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
