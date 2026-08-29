import { FAQ } from '../../server/data/faq.js';

export function renderFaq(container) {
  const faqHtml = FAQ.map(item => `
    <div class="cyber-panel p-6">
      <h3 class="text-lg font-bold font-['Orbitron'] text-[#00f3ff] mb-2">${item.question}</h3>
      <p class="text-slate-300 font-['Rajdhani'] text-base leading-relaxed">${item.answer}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="space-y-8 max-w-4xl mx-auto">
      <div class="text-center">
        <h2 class="text-3xl font-black font-['Orbitron'] text-white mb-2">PERGUNTAS <span class="text-[#00f3ff]">FREQUENTES</span></h2>
        <p class="text-slate-400 font-['Share_Tech_Mono']">Tudo o que você precisa saber sobre nossos processos e tecnologia.</p>
      </div>

      <div class="space-y-4">
        ${faqHtml}
      </div>
    </div>
  `;
}
