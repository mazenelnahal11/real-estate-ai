/*
 * Dashboard Controller
 * Handles chart initialization, real-time metrics updates, and pagination.
 */

let currentPage = 1;

export function initDashboard() {
    // Inject Animation Styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUpFade {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-20px) scale(0.95); opacity: 0; }
        }
        .animate-float-up {
            animation: floatUpFade 1.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    initDarkMode();
    initChart();
    initRealTimeUpdates();
}

function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (localStorage.getItem('theme') === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        });
    }
}

function initChart() {
    const canvas = document.getElementById('heatScoreChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
    gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');

    window.heatScoreChart = null;

    fetch('/api/chart-data')
        .then(response => response.json())
        .then(chartData => {
            window.heatScoreChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Heat Score',
                        data: chartData.data,
                        borderColor: '#34d399',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#18181b',
                        pointBorderColor: '#34d399',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: customTooltipHandler
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: '#27272a', drawBorder: false },
                            ticks: { color: '#71717a' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#71717a', maxTicksLimit: 8 }
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Chart Init Error:", error));
}

function customTooltipHandler(context) {
    let tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;
    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    if (tooltipModel.body) {
        const dataPoint = context.chart.data.datasets[0].data[tooltipModel.dataPoints[0].dataIndex];
        tooltipEl.innerHTML = `
            <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 flex items-center gap-3 min-w-[140px]">
                <div class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-zinc-500 font-medium uppercase tracking-wider">Heat Score</p>
                    <p class="text-xl font-bold text-slate-900 dark:text-white">${dataPoint}</p>
                </div>
            </div>
        `;
    }

    const position = context.chart.canvas.getBoundingClientRect();
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY + 'px';
    tooltipEl.style.transform = 'translate(-50%, -120%)';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.zIndex = 100;
}

function initRealTimeUpdates() {
    // Expose pagination functions to window for onclick handlers
    window.applyFilters = () => { currentPage = 1; updateDashboard(); };
    window.changePage = (page) => { if (page >= 1) { currentPage = page; updateDashboard(); } };

    // Start polling
    setInterval(updateDashboard, 5000);
}

function updateDashboard() {
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', currentPage);

    Promise.all([
        fetch(`/api/dashboard-stats?${params.toString()}`).then(res => res.json()),
        fetch('/api/chart-data').then(res => res.json())
    ]).then(([statsData, chartData]) => {
        updateMetric('totalLeads', statsData.totalLeads);
        updateMetric('hotLeads', statsData.hotLeads);
        updateMetric('avgHeatScore', statsData.avgHeatScore);
        updateMetric('projectedRevenue', statsData.projectedRevenue, true);

        if (window.heatScoreChart) {
            window.heatScoreChart.data.labels = chartData.labels;
            window.heatScoreChart.data.datasets[0].data = chartData.data;
            window.heatScoreChart.update('none');
        }

        renderTable(statsData.recentChats);
        renderPagination(statsData.pagination);
    }).catch(err => console.error("Polling Error:", err));
}

function updateMetric(elementId, newValue, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentText = element.textContent.replace(/[^0-9.-]/g, '');
    const currentVal = parseFloat(currentText) || 0;
    const newVal = parseFloat(newValue);

    if (currentVal !== newVal) {
        const diff = newVal - currentVal;
        if (diff !== 0) {
            const delta = document.createElement('span');
            const prefix = diff > 0 ? '+' : '';
            const formattedDiff = isCurrency ? '$' + Math.abs(diff).toLocaleString() : Math.abs(diff);

            delta.textContent = `${prefix}${formattedDiff}`;
            delta.className = `absolute -top-4 right-0 text-sm font-bold ${diff > 0 ? 'text-emerald-500' : 'text-red-500'} animate-float-up pointer-events-none`;

            if (element.parentNode.style.position !== 'relative' && !element.parentNode.className.includes('relative')) {
                element.parentNode.classList.add('relative');
            }
            element.parentNode.appendChild(delta);
            setTimeout(() => delta.remove(), 2000);
        }
        element.textContent = isCurrency ? '$' + newVal.toLocaleString() : newVal;
    }
}

function renderTable(chats) {
    const tbody = document.getElementById('recentChatsBody');
    if (!tbody) return;

    tbody.innerHTML = chats.map(chat => {
        const heatColor = chat.heat_score >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
            chat.heat_score >= 50 ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-red-500/10 text-red-500';

        const callBadge = chat.call_requested ?
            `<div class="flex items-center gap-2"><span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">Yes</span>${chat.best_call_time ? '<span class="text-zinc-400" title="Best time: ' + chat.best_call_time + '"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>' : ''}</div>` :
            '<span class="text-zinc-600">-</span>';

        const date = new Date(chat.start_time);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return `
            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer animate-fade-in-up" data-chat-id="${chat.chat_id}">
                <td class="px-6 py-4 font-medium text-zinc-900 dark:text-white">${chat.name || 'Unknown'}</td>
                <td class="px-6 py-4">${chat.phone || '-'}</td>
                <td class="px-6 py-4">${chat.budget ? '$' + Number(chat.budget).toLocaleString() : '-'}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${heatColor}">${chat.heat_score || 0}</span></td>
                <td class="px-6 py-4">${callBadge}</td>
                <td class="px-6 py-4 max-w-xs truncate" title="${chat.summary}">${chat.summary || '-'}</td>
                <td class="px-6 py-4 text-xs text-zinc-500">${dateStr}</td>
            </tr>
        `;
    }).join('');
}

function renderPagination(pagination) {
    if (!pagination) return;
    const { page, totalPages } = pagination;
    const container = document.getElementById('paginationControls');
    if (!container) return;

    let html = '';

    html += `<button onclick="changePage(${page - 1})" class="px-3 py-1 text-sm rounded-md transition-colors ${page === 1 ? 'text-zinc-500 cursor-not-allowed hidden' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}" ${page === 1 ? 'disabled' : ''}>Prev</button>`;

    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
        html += `<button onclick="changePage(1)" class="px-3 py-1 text-sm rounded-md transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">1</button>`;
        if (startPage > 2) html += `<span class="px-2 text-zinc-400">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="changePage(${i})" class="px-3 py-1 text-sm rounded-md transition-colors ${i === page ? 'bg-emerald-500 text-white font-medium shadow-md shadow-emerald-900/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="px-2 text-zinc-400">...</span>`;
        html += `<button onclick="changePage(${totalPages})" class="px-3 py-1 text-sm rounded-md transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">${totalPages}</button>`;
    }

    html += `<button onclick="changePage(${page + 1})" class="px-3 py-1 text-sm rounded-md transition-colors ${page >= totalPages ? 'text-zinc-500 cursor-not-allowed hidden' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}" ${page >= totalPages ? 'disabled' : ''}>Next</button>`;

    container.innerHTML = html;
}
