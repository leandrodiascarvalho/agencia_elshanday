export function renderBriefing(container) {
  container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-black font-['Orbitron'] text-white mb-2">BRIEFING DIGITAL & <span class="text-[#fefe00]">CALCULADORA</span></h2>
        <p class="text-slate-400 font-['Share_Tech_Mono']">Estime o orçamento em tempo real e envie as especificações do seu projeto.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Interactive Form -->
        <div class="lg:col-span-2 cyber-panel p-6 sm:p-8 space-y-6">
          <form id="briefing-form" class="space-y-4 font-['Rajdhani']">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-300 text-sm mb-1 font-mono">SEU NOME / EMPRESA</label>
                <input type="text" name="name" required class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none focus:border-[#ff007f]" placeholder="Ex: Ana Silva" />
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-1 font-mono">E-MAIL CORPORATIVO</label>
                <input type="email" name="email" required class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none focus:border-[#ff007f]" placeholder="ana@empresa.com" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-300 text-sm mb-1 font-mono">TIPO DE PROJETO</label>
                <select id="calc-base" name="projectType" class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none">
                  <option value="2500">Landing Page Futurista (R$ 2.500)</option>
                  <option value="4200">Web App / SPA Completa (R$ 4.200)</option>
                  <option value="6000">Plataforma E-commerce / SaaS (R$ 6.000)</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-1 font-mono">PRAZO DESEJADO</label>
                <select name="deadline" class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none">
                  <option value="Express (5 a 10 dias)">Express (5 a 10 dias)</option>
                  <option value="Padrão (15 a 25 dias)">Padrão (15 a 25 dias)</option>
                  <option value="Flexível">Flexível</option>
                </select>
              </div>
            </div>

            <!-- Features Selection -->
            <div>
              <label class="block text-slate-300 text-sm mb-2 font-mono">MÓDULOS ADICIONAIS</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                <label class="flex items-center gap-2 p-3 bg-black/40 border border-slate-700 rounded cursor-pointer hover:border-[#00f3ff]">
                  <input type="checkbox" class="feature-cb" value="800" data-name="3D WebGL / Three.js" />
                  <span>3D WebGL / Three.js (+R$ 800)</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-black/40 border border-slate-700 rounded cursor-pointer hover:border-[#00f3ff]">
                  <input type="checkbox" class="feature-cb" value="1200" data-name="Agente IA Gemini" />
                  <span>Agente IA Gemini (+R$ 1.200)</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-black/40 border border-slate-700 rounded cursor-pointer hover:border-[#00f3ff]">
                  <input type="checkbox" class="feature-cb" value="600" data-name="SEO & Copywriting" />
                  <span>SEO & Copywriting (+R$ 600)</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-black/40 border border-slate-700 rounded cursor-pointer hover:border-[#00f3ff]">
                  <input type="checkbox" class="feature-cb" value="500" data-name="Automação WhatsApp" />
                  <span>Automação WhatsApp (+R$ 500)</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-slate-300 text-sm mb-1 font-mono">DESCREVA SEU OBJETIVO</label>
              <textarea name="description" rows="3" class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none focus:border-[#ff007f]" placeholder="Conte-nos sobre sua ideia ou necessidades principais..."></textarea>
            </div>

            <button type="submit" class="w-full py-4 rounded-lg bg-linear-to-r from-[#00f3ff] to-[#ff007f] text-black font-black font-['Orbitron'] text-sm hover:opacity-90 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition cursor-pointer">
              TRANSMITIR BRIEFING // SUBMIT
            </button>
          </form>
        </div>

        <!-- Budget Estimator Panel -->
        <div class="cyber-panel p-6 sm:p-8 flex flex-col justify-between font-['Share_Tech_Mono']">
          <div>
            <span class="text-xs text-[#00f3ff] uppercase block mb-1">ESTIMATIVA NEURAL</span>
            <h3 class="text-2xl font-bold font-['Orbitron'] text-white mb-6">RESUMO DO ORÇAMENTO</h3>

            <div class="space-y-3 text-sm text-slate-300 border-b border-slate-800 pb-6 mb-6">
              <div class="flex justify-between">
                <span>Base do Projeto:</span>
                <span id="summary-base" class="text-white">R$ 2.500</span>
              </div>
              <div class="flex justify-between">
                <span>Módulos Extras:</span>
                <span id="summary-extras" class="text-white">R$ 0</span>
              </div>
            </div>

            <div class="text-xs text-slate-400 mb-2">VALOR ESTIMADO TOTAL:</div>
            <div id="total-price" class="text-4xl font-black font-['Orbitron'] text-[#fefe00] drop-shadow-[0_0_10px_rgba(254,254,0,0.5)]">
              R$ 2.500
            </div>
          </div>

          <div id="briefing-feedback" class="mt-6 text-xs text-slate-400">
            * Valores e prazos são estimativas e serão homologados após alinhamento técnico.
          </div>
        </div>
      </div>
    </div>
  `;

  // Dynamic Calculation
  const form = container.querySelector('#briefing-form');
  const baseSelect = container.querySelector('#calc-base');
  const checkboxes = container.querySelectorAll('.feature-cb');
  const baseSummary = container.querySelector('#summary-base');
  const extrasSummary = container.querySelector('#summary-extras');
  const totalDisplay = container.querySelector('#total-price');

  function updatePrice() {
    const base = parseInt(baseSelect.value, 10) || 0;
    let extras = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) extras += parseInt(cb.value, 10);
    });

    baseSummary.textContent = `R$ ${base.toLocaleString('pt-BR')}`;
    extrasSummary.textContent = `R$ ${extras.toLocaleString('pt-BR')}`;
    totalDisplay.textContent = `R$ ${(base + extras).toLocaleString('pt-BR')}`;
  }

  baseSelect.addEventListener('change', updatePrice);
  checkboxes.forEach(cb => cb.addEventListener('change', updatePrice));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const selectedFeatures = [];
    checkboxes.forEach(cb => {
      if (cb.checked) selectedFeatures.push(cb.getAttribute('data-name'));
    });

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      projectType: baseSelect.options[baseSelect.selectedIndex].text,
      deadline: formData.get('deadline'),
      description: formData.get('description'),
      budget: totalDisplay.textContent,
      features: selectedFeatures
    };

    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const feedback = container.querySelector('#briefing-feedback');
      if (feedback) {
        feedback.innerHTML = `<span class="text-[#00ff66] font-bold">✓ Briefing enviado com sucesso! Protocolo: ${data.protocol}</span>`;
      }
      form.reset();
      updatePrice();
    } catch (err) {
      alert('Erro ao enviar briefing. Tente novamente.');
    }
  });
}
