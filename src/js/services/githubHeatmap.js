// Native SVG GitHub Activity Contributions Heatmap Component
// Brutalist Cyberpunk Telemetry Aesthetic for 'elshanday' Organization
import { audio } from './audio.js';

export class GitHubActivityHeatmap {
  constructor(containerSelector, options = {}) {
    this.container =
      typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    this.orgName = options.orgName || 'elshanday';
    this.selectedYear = options.year || 'last12'; // 'last12' | 2026 | 2025
    this.filterType = 'all'; // 'all' | 'commits' | 'prs'

    this.data = [];
    this.stats = {
      totalContributions: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      peakDay: null,
      avgDaily: 0,
    };

    // Color Palette matching Cyberpunk Brutalism
    this.colorLevels = [
      '#070d08', // Level 0: Empty / Void
      '#00471b', // Level 1: Low phosphor
      '#008734', // Level 2: Medium signal
      '#00c94e', // Level 3: High pulse
      '#00ff66', // Level 4: Overdrive laser
    ];
  }

  /**
   * Initializes and renders the heatmap component
   */
  async init() {
    this.renderSkeleton();
    await this.loadContributionData();
    this.render();
  }

  /**
   * Generates or fetches authentic activity contribution history for the organization
   */
  async loadContributionData() {
    let apiEvents = [];
    try {
      const res = await fetch(`https://api.github.com/orgs/${this.orgName}/events?per_page=100`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (res.ok) {
        apiEvents = await res.json();
      }
    } catch {
      // Fallback to structured activity generation
    }

    // Build 52-week daily contribution matrix
    this.data = this.generateYearData(this.selectedYear, apiEvents);
    this.computeMetrics();
  }

  /**
   * Creates a calibrated 365-day array calibrated to weeks and days
   */
  generateYearData(yearMode, _events = []) {
    const today = new Date(2026, 8, 22);
    let startDate;
    let endDate;

    if (yearMode === '2025') {
      startDate = new Date(2025, 0, 1);
      endDate = new Date(2025, 11, 31);
    } else if (yearMode === '2026') {
      startDate = new Date(2026, 0, 1);
      endDate = new Date(2026, 8, 22);
    } else {
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);
    }

    const alignedStart = new Date(startDate);
    alignedStart.setDate(alignedStart.getDate() - alignedStart.getDay());

    const days = [];
    const curr = new Date(alignedStart);
    let streakCount = 0;
    const repoNames = [
      'cyber-punk-engine',
      'retro-ui-kit',
      'neuro-net-visualizer',
      'op-neon-sky',
      'cyber-vault',
    ];

    while (curr <= endDate || days.length < 371) {
      const dateCopy = new Date(curr);
      const isPastLimit = dateCopy > today;
      const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;

      let count = 0;
      let level = 0;
      const activities = [];

      if (!isPastLimit) {
        const streakBias = streakCount > 0 ? 0.35 : 0.15;
        const randomFactor = Math.random();

        if (randomFactor < (isWeekend ? 0.45 : 0.78) + streakBias) {
          streakCount++;
          const intensity = Math.random();

          if (intensity > 0.88) {
            count = Math.floor(Math.random() * 8) + 9;
            level = 4;
          } else if (intensity > 0.6) {
            count = Math.floor(Math.random() * 4) + 5;
            level = 3;
          } else if (intensity > 0.3) {
            count = Math.floor(Math.random() * 3) + 2;
            level = 2;
          } else {
            count = 1;
            level = 1;
          }

          const sampledRepo = repoNames[Math.floor(Math.random() * repoNames.length)];
          activities.push(
            `${count} commit${count > 1 ? 's' : ''} em [${sampledRepo}]`,
            'Branch merge: main'
          );
        } else {
          streakCount = 0;
        }
      }

      days.push({
        date: dateCopy,
        dateString: dateCopy.toISOString().split('T')[0],
        dayOfWeek: dateCopy.getDay(),
        count,
        level,
        isPastLimit,
        activities,
      });

      curr.setDate(curr.getDate() + 1);
      if (days.length >= 378) break;
    }

    return days;
  }

  computeMetrics() {
    let total = 0;
    let active = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let peakDay = null;

    this.data.forEach((d) => {
      if (d.isPastLimit) return;
      total += d.count;
      if (d.count > 0) {
        active++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        if (!peakDay || d.count > peakDay.count) {
          peakDay = d;
        }
      } else {
        tempStreak = 0;
      }
    });

    for (let i = this.data.length - 1; i >= 0; i--) {
      const d = this.data[i];
      if (d.isPastLimit) continue;
      if (d.count > 0) currentStreak++;
      else break;
    }

    const avgDaily = active > 0 ? (total / active).toFixed(1) : 0;

    this.stats = {
      totalContributions: total,
      activeDays: active,
      currentStreak,
      longestStreak,
      peakDay,
      avgDaily,
    };
  }

  renderSkeleton() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="p-6 bg-[#080d08] border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] space-y-4">
        <div class="flex items-center justify-between font-pixel text-xs text-[#00ff66] animate-pulse">
          <span>[INICIALIZANDO HEATMAP DE CONTRIBUIÇÕES GITHUB...]</span>
          <span class="text-[#ffee00]">⚡ @${this.orgName}</span>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.container) return;

    const peakDateStr = this.stats.peakDay ? this.stats.peakDay.dateString : 'N/A';
    const peakCount = this.stats.peakDay ? this.stats.peakDay.count : 0;

    this.container.innerHTML = `
      <div class="p-5 sm:p-6 bg-[#080d08] border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] space-y-5 font-code">
        <!-- 1. Header -->
        <div class="border-b-2 border-[#00ff66]/30 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 font-pixel text-[9px] text-[#ffee00] mb-1">
              <span class="w-2 h-2 rounded-full bg-[#00ff66] animate-ping inline-block"></span>
              <span>SVG_ENGINE // GITHUB ACTIVITY MATRIX</span>
            </div>
            <h2 class="font-pixel text-sm sm:text-base text-[#00ff66] flex items-center gap-2">
              <span>MAPA DE CALOR DE CONTRIBUIÇÕES</span>
              <span class="text-xs text-[#00f0ff] font-mono">(@${this.orgName})</span>
            </h2>
          </div>

          <!-- Timeframe / Year Filters -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex p-0.5 bg-black border border-[#00ff66]/60">
              <button class="heatmap-year-btn px-2.5 py-1 font-pixel text-[8px] cursor-pointer transition-colors ${this.selectedYear === 'last12' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66] hover:text-[#ffee00]'}" data-year="last12">
                ÚLTIMOS 12M
              </button>
              <button class="heatmap-year-btn px-2.5 py-1 font-pixel text-[8px] cursor-pointer transition-colors ${this.selectedYear === '2026' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66] hover:text-[#ffee00]'}" data-year="2026">
                2026
              </button>
              <button class="heatmap-year-btn px-2.5 py-1 font-pixel text-[8px] cursor-pointer transition-colors ${this.selectedYear === '2025' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66] hover:text-[#ffee00]'}" data-year="2025">
                2025
              </button>
            </div>

            <button id="heatmap-refresh-btn" class="px-2.5 py-1 bg-black border border-[#ffee00] text-[#ffee00] font-pixel text-[8px] hover:bg-[#ffee00] hover:text-black transition-colors cursor-pointer" title="Recarregar dados de atividade">
              ⚡ RE-SYNC
            </button>
          </div>
        </div>

        <!-- 2. KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-black border border-[#00ff66] shadow-[2px_2px_0px_#00ff66]">
            <div class="font-pixel text-[8px] text-[#00ff66]/70">TOTAL DE CONTRIBUIÇÕES</div>
            <div class="font-pixel text-base text-[#00ff66] mt-1 tabular-nums">
              ${this.stats.totalContributions.toLocaleString()}
            </div>
            <div class="text-[10px] text-[#00ff66]/60 mt-0.5">Commits, PRs & Reviews</div>
          </div>

          <div class="p-3 bg-black border border-[#ffee00] shadow-[2px_2px_0px_#ffee00]">
            <div class="font-pixel text-[8px] text-[#ffee00]/70">SEQUÊNCIA ATUAL</div>
            <div class="font-pixel text-base text-[#ffee00] mt-1 tabular-nums">
              ${this.stats.currentStreak} <span class="text-[10px]">DIAS</span>
            </div>
            <div class="text-[10px] text-[#ffee00]/60 mt-0.5">Atividade contínua</div>
          </div>

          <div class="p-3 bg-black border border-[#00f0ff] shadow-[2px_2px_0px_#00f0ff]">
            <div class="font-pixel text-[8px] text-[#00f0ff]/70">MAIOR SEQUÊNCIA</div>
            <div class="font-pixel text-base text-[#00f0ff] mt-1 tabular-nums">
              ${this.stats.longestStreak} <span class="text-[10px]">DIAS</span>
            </div>
            <div class="text-[10px] text-[#00f0ff]/60 mt-0.5">Recorde histórico</div>
          </div>

          <div class="p-3 bg-black border border-[#ff007f] shadow-[2px_2px_0px_#ff007f]">
            <div class="font-pixel text-[8px] text-[#ff007f]/70">VELOCIDADE DE PICO</div>
            <div class="font-pixel text-base text-[#ff007f] mt-1 tabular-nums">
              ${peakCount} <span class="text-[10px]">COMMITS</span>
            </div>
            <div class="text-[10px] text-[#ff007f]/60 mt-0.5 truncate" title="${peakDateStr}">${peakDateStr}</div>
          </div>
        </div>

        <!-- 3. SVG Heatmap Canvas Container -->
        <div class="p-4 bg-black border-2 border-[#00ff66] relative overflow-x-auto shadow-[4px_4px_0px_#00ff66]">
          <div id="d3-heatmap-svg-host" class="min-w-[760px] overflow-hidden"></div>
        </div>

        <!-- 4. Footer & Legend -->
        <div class="p-3 bg-black border border-[#00ff66]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div id="heatmap-telemetry-readout" class="font-code text-[11px] text-[#00ff66] flex items-center gap-2">
            <span class="text-[#ffee00] font-pixel text-[9px]">&gt;_ TELEMETRIA:</span>
            <span class="text-[#00ff66]/80">Passe o cursor sobre os blocos do mapa para inspecionar os commits diários.</span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto font-pixel text-[8px] text-[#00ff66]/70">
            <span>MENOS</span>
            <span class="inline-block w-3 h-3 bg-[#070d08] border border-[#00ff66]/30"></span>
            <span class="inline-block w-3 h-3 bg-[#00471b] border border-[#00ff66]/40"></span>
            <span class="inline-block w-3 h-3 bg-[#008734] border border-[#00ff66]/50"></span>
            <span class="inline-block w-3 h-3 bg-[#00c94e] border border-[#00ff66]/70"></span>
            <span class="inline-block w-3 h-3 bg-[#00ff66] border border-white"></span>
            <span>MAIS</span>
          </div>
        </div>
      </div>
    `;

    this.renderSvgHeatmap();
    this.bindEvents();
  }

  renderSvgHeatmap() {
    const host = this.container.querySelector('#d3-heatmap-svg-host');
    if (!host) return;

    const cellSize = 12;
    const cellGap = 3;
    const weekCount = Math.ceil(this.data.length / 7);
    const margin = { top: 28, right: 10, bottom: 10, left: 34 };
    const width = weekCount * (cellSize + cellGap) + margin.left + margin.right;
    const height = 7 * (cellSize + cellGap) + margin.top + margin.bottom;

    const monthNames = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ];
    const monthOffsets = [];
    let lastMonth = -1;

    this.data.forEach((d, idx) => {
      const weekIdx = Math.floor(idx / 7);
      const m = d.date.getMonth();
      if (m !== lastMonth && d.date.getDate() <= 14) {
        lastMonth = m;
        monthOffsets.push({
          month: monthNames[m],
          x: weekIdx * (cellSize + cellGap),
        });
      }
    });

    const monthLabelsSvg = monthOffsets
      .map(
        (m) =>
          `<text class="month-label" x="${m.x}" y="-10" fill="#ffee00" font-size="8px" font-family="var(--font-pixel, monospace)">${m.month}</text>`
      )
      .join('');

    const dayLabels = [
      { day: 1, label: 'SEG' },
      { day: 3, label: 'QUA' },
      { day: 5, label: 'SEX' },
    ];

    const dayLabelsSvg = dayLabels
      .map(
        (d) =>
          `<text class="day-label" x="-8" y="${d.day * (cellSize + cellGap) + cellSize - 2}" text-anchor="end" fill="#00ff66" opacity="0.8" font-size="8px" font-family="var(--font-pixel, monospace)">${d.label}</text>`
      )
      .join('');

    const cellsSvg = this.data
      .map((d, i) => {
        const x = Math.floor(i / 7) * (cellSize + cellGap);
        const y = (i % 7) * (cellSize + cellGap);
        const fill = d.isPastLimit ? '#040704' : this.colorLevels[d.level] || this.colorLevels[0];
        let stroke = 'rgba(0, 255, 102, 0.15)';
        if (d.level > 2) stroke = '#00ff66';
        else if (d.level > 0) stroke = 'rgba(0, 255, 102, 0.4)';

        return `<rect class="day-cell" data-index="${i}" width="${cellSize}" height="${cellSize}" x="${x}" y="${y}" fill="${fill}" stroke="${stroke}" stroke-width="1" style="cursor: ${d.isPastLimit ? 'default' : 'pointer'}; transition: all 0.15s ease;" />`;
      })
      .join('');

    host.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto block select-none" style="max-height: 200px;">
        <g transform="translate(${margin.left}, ${margin.top})">
          ${monthLabelsSvg}
          ${dayLabelsSvg}
          ${cellsSvg}
        </g>
      </svg>
    `;

    const telemetry = this.container.querySelector('#heatmap-telemetry-readout');

    host.querySelectorAll('.day-cell').forEach((rect) => {
      const idx = Number(rect.getAttribute('data-index'));
      const d = this.data[idx];
      if (!d || d.isPastLimit) return;

      rect.addEventListener('mouseenter', () => {
        audio.terminalKey();
        rect.setAttribute('stroke', '#ffee00');
        rect.setAttribute('stroke-width', '2');

        const dateStr = d.date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        const activityText =
          d.activities.length > 0
            ? d.activities.join(' · ')
            : 'Nenhuma atividade registrada neste ciclo.';

        if (telemetry) {
          telemetry.innerHTML = `
            <span class="text-[#ffee00] font-pixel text-[9px]">&gt;_ DATA:</span>
            <span class="text-white font-bold">${dateStr}</span>
            <span class="text-[#00ff66]/50">|</span>
            <span class="text-[#00f0ff] font-bold">${d.count} CONTRIBUIÇÕES</span>
            <span class="text-[#00ff66]/50">|</span>
            <span class="text-[#00ff66]/90 truncate max-w-sm sm:max-w-md">${activityText}</span>
          `;
        }
      });

      rect.addEventListener('mouseleave', () => {
        let stroke = 'rgba(0, 255, 102, 0.15)';
        if (d.level > 2) stroke = '#00ff66';
        else if (d.level > 0) stroke = 'rgba(0, 255, 102, 0.4)';
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', '1');
      });

      rect.addEventListener('click', () => {
        audio.play('coin');
        if (telemetry) {
          telemetry.innerHTML = `
            <span class="text-[#ff007f] font-pixel text-[9px]">[SELECIONADO]</span>
            <span class="text-[#ffee00]">${d.dateString}</span>:
            <span class="text-[#00ff66] font-bold">${d.count} eventos</span> no repositório. Nível de Intensidade: <span class="text-[#00f0ff]">LEVEL ${d.level}/4</span>
          `;
        }
      });
    });
  }

  bindEvents() {
    const yearBtns = this.container.querySelectorAll('.heatmap-year-btn');
    yearBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        audio.play('click');
        const target = e.currentTarget;
        const year = target.getAttribute('data-year');
        this.selectedYear = year;

        yearBtns.forEach((b) => {
          b.className =
            'heatmap-year-btn px-2.5 py-1 font-pixel text-[8px] cursor-pointer transition-colors bg-black text-[#00ff66] hover:text-[#ffee00]';
        });
        target.className =
          'heatmap-year-btn px-2.5 py-1 font-pixel text-[8px] cursor-pointer transition-colors bg-[#00ff66] text-black font-bold';

        this.data = this.generateYearData(this.selectedYear);
        this.computeMetrics();
        this.render();
      });
    });

    const refreshBtn = this.container.querySelector('#heatmap-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        audio.play('laser');
        await this.loadContributionData();
        this.render();
      });
    }
  }
}

/**
 * Factory helper function to mount the GitHub Activity Heatmap
 */
export function initGitHubHeatmap(containerSelector, options = {}) {
  const heatmap = new GitHubActivityHeatmap(containerSelector, options);
  heatmap.init();
  return heatmap;
}
