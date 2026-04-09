const DATA_URL = 'data.json';
const PLAYBOOK_URL = 'playbook.json';

document.addEventListener('DOMContentLoaded', () => {
    // Check for offline data payloads first
    const dataPayload = document.getElementById('app-data-payload');
    const playbookPayload = document.getElementById('app-playbook-payload');

    if (dataPayload && playbookPayload) {
        console.log('--- OFFLINE MODE (PAYLOAD DETECTED) ---');
        try {
            const data = JSON.parse(dataPayload.textContent);
            const playbook = JSON.parse(playbookPayload.textContent);
            processAndRender(data, playbook);
        } catch (e) {
            console.error('Payload Parse Error:', e);
            initDashboard(); // Fallback to fetch if parse fails
        }
    } else {
        console.log('--- ONLINE MODE (FETCHING) ---');
        initDashboard();
    }
    setupModals();
});

async function initDashboard() {
    try {
        const [dataRes, playbookRes] = await Promise.all([
            fetch(`${DATA_URL}?v=${Date.now()}`),
            fetch(`${PLAYBOOK_URL}?v=${Date.now()}`)
        ]);

        if (!dataRes.ok || !playbookRes.ok) throw new Error('Failed to load data files.');

        const data = await dataRes.json();
        const playbook = await playbookRes.json();

        processAndRender(data, playbook);
    } catch (error) {
        console.error('Core Load Error:', error);
        showErrorUI();
    }
}

function processAndRender(data, playbook) {
    if (!data || !playbook) return;
    
    try { renderDashboard(data); } catch (e) { console.error('Dashboard Render Error:', e); }
    try { renderPlaybook(playbook); } catch (e) { console.error('Playbook Render Error:', e); }
    try { setupEmergencyModal(playbook); } catch (e) { console.error('Modal Setup Error:', e); }
    
    document.body.classList.add('loaded'); // Trigger CSS animations
}

function showErrorUI() {
    document.body.innerHTML = `
        <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0d1117; color: #ff7b72; font-family: sans-serif; text-align: center; padding: 2rem;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️ Connection Interrupted</h1>
            <p style="font-size: 1.2rem; max-width: 600px; color: #8b949e;">The analytics engine could not fetch local data. This is usually due to browser security restrictions on local files.</p>
            <div style="margin-top: 2rem; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #58a6ff; font-weight: bold; margin-bottom: 0.5rem;">To fix this:</p>
                <p style="font-size: 0.9rem; line-height: 1.5;">Open <strong>Dashboard.html</strong> (the portable version) <br> or run <code>node build_offline.js</code> in this folder.</p>
            </div>
        </div>
    `;
}

function renderDashboard(data) {
    if (!data) return;
    
    // Stats Mapping
    const stats = data.stats || {};
    const total = stats.total || 0;
    const gf = stats.gfTotal || stats.gf || 0;
    const bf = stats.bfTotal || stats.bf || 0;

    if(document.getElementById('total-msgs')) document.getElementById('total-msgs').textContent = total.toLocaleString();
    if(document.getElementById('gf-msgs')) document.getElementById('gf-msgs').textContent = gf.toLocaleString();
    if(document.getElementById('bf-msgs')) document.getElementById('bf-msgs').textContent = bf.toLocaleString();
    if(document.getElementById('avg-summary-latency')) document.getElementById('avg-summary-latency').textContent = data.avgResponseLatencyMins || 20;

    // Advanced Visualizations
    if (data.heatmap) renderHeatmap(data.heatmap);
    if (data.timeOfDay) renderRadialClock(data.timeOfDay);
    if (data.loveLanguages) renderDonutPie(data.loveLanguages);
    if (data.timeline) renderTimeline(data.timeline);

    // Feeds
    renderFeed('feed-likes', data.gfLoveLikes);
    renderFeed('feed-happy', data.gfHappySafety);
    renderFeed('feed-sad', data.gfMadSad);
    renderFeed('feed-breakup', data.gfChallenges);
}

function renderFeed(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="p-4 text-muted">No specific logs found.</div>`;
        return;
    }

    items.slice(0, 15).forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'feed-entry';
        entry.innerHTML = `
            <div class="feed-time">${item.time || 'Log Entry'}</div>
            <div class="feed-text">${item.text}</div>
        `;
        container.appendChild(entry);
    });
}

function renderHeatmap(heatmapData) {
    const container = document.getElementById('heatmap-grid');
    if (!container || !heatmapData) return;
    container.innerHTML = '';

    const max = Math.max(...heatmapData.map(d => d.value), 1);
    
    heatmapData.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const opacity = day.value > 0 ? (0.2 + (day.value / max) * 0.8) : 0.05;
        cell.style.background = `rgba(63, 185, 80, ${opacity})`;
        cell.setAttribute('title', `${day.date}: ${day.value} messages`);
        container.appendChild(cell);
    });
}

function renderRadialClock(timeData) {
    const container = document.getElementById('clock-vis');
    if (!container || !timeData) return;

    let svgHtml = `<svg width="180" height="180" viewBox="0 0 100 100" class="donut-svg">`;
    svgHtml += `<circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />`;
    
    timeData.forEach((hourData, i) => {
        const angle = (i * 15) - 90;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 38 * Math.cos(rad);
        const y = 50 + 38 * Math.sin(rad);
        
        const happy = hourData.happy || 0;
        const conflict = hourData.conflict || 0;
        const total = happy + conflict;
        const safetyFactor = happy / (total || 1);
        
        const color = (total === 0) ? 'rgba(255,255,255,0.05)' : (safetyFactor > 0.7 ? '#3fb950' : (safetyFactor > 0.4 ? '#d29922' : '#ff7b72'));
        const size = (total === 0) ? 1.5 : (2 + Math.min(total / 800, 3));
        
        svgHtml += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}">
            <title>Hour ${i}:00 | Safety: ${(safetyFactor*100).toFixed(0)}% (${total} msgs)</title>
        </circle>`;
    });

    svgHtml += `
        <text x="50" y="48" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">SAFE</text>
        <text x="50" y="56" text-anchor="middle" fill="#8b949e" font-size="4">ZONES</text>
    </svg>`;
    
    container.innerHTML = svgHtml;
}

function renderDonutPie(loveData) {
    const container = document.getElementById('love-vis');
    if (!container || !loveData) return;

    const items = Object.entries(loveData).map(([key, value]) => ({ key, value }));
    const total = items.reduce((sum, item) => sum + item.value, 0);
    
    let currentPercent = 0;
    const colors = ['#bc8cff', '#3fb950', '#58a6ff', '#ff7b72', '#d29922'];
    const radius = 35;
    const circumference = 2 * Math.PI * radius;

    let svgHtml = `<svg width="180" height="180" viewBox="0 0 100 100" class="donut-svg">`;
    
    items.forEach((item, i) => {
        if (total === 0) return;
        const percent = (item.value / total);
        const offset = circumference - (percent * circumference);
        const rotation = (currentPercent * 360);
        
        svgHtml += `
            <circle cx="50" cy="50" r="${radius}" 
                class="donut-segment" 
                stroke="${colors[i % colors.length]}" 
                stroke-dasharray="${circumference} ${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(${rotation} 50 50)">
                <title>${item.key}: ${(percent*100).toFixed(1)}%</title>
            </circle>`;
        
        currentPercent += percent;
    });

    svgHtml += `<text x="50" y="54" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">TRIGGERS</text></svg>`;
    
    let legendHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 0.7rem;">';
    items.slice(0, 4).forEach((item, i) => {
        legendHtml += `<div><span style="display:inline-block; width:8px; height:8px; background:${colors[i % colors.length]}; border-radius:50%; margin-right:4px;"></span> ${item.key}</div>`;
    });
    legendHtml += '</div>';

    container.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center;">${svgHtml}${legendHtml}</div>`;
}

function renderTimeline(timelineData) {
    const container = document.getElementById('timeline-chart');
    if (!container || !timelineData) return;
    container.innerHTML = '';

    const max = Math.max(...timelineData.map(d => (d.happy || 0) + (d.sad || 0) + (d.conflict || 0)), 1);
    
    timelineData.forEach(point => {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'timeline-bar-wrapper';
        
        const total = (point.happy || 0) + (point.sad || 0) + (point.conflict || 0);
        const bar = document.createElement('div');
        bar.className = 'timeline-bar';
        const height = (total / max) * 100;
        bar.style.height = `${height}%`;
        bar.style.background = 'var(--accent-blue)';
        
        const labelStr = point.label || point.month || 'X';
        barWrapper.setAttribute('title', `${labelStr}: ${total} messages`);
        barWrapper.appendChild(bar);
        
        const label = document.createElement('span');
        label.className = 'timeline-label';
        label.textContent = labelStr.includes('-') ? labelStr.split('-')[1] : labelStr.slice(-2);
        barWrapper.appendChild(label);
        
        container.appendChild(barWrapper);
    });
}

function renderPlaybook(playbook) {
    const container = document.getElementById('playbook-carousel');
    if (!container || !playbook || !playbook.sections) return;
    container.innerHTML = '';

    playbook.sections.forEach(section => {
        const card = document.createElement('div');
        card.className = 'playbook-card';
        card.innerHTML = `
            <h3>${section.category}</h3>
            <ul>
                ${section.points.map(p => `<li><strong>${p.title}:</strong> ${p.text}</li>`).join('')}
            </ul>
        `;
        container.appendChild(card);
    });
}

function setupEmergencyModal(playbook) {
    const modal = document.getElementById('emergency-modal');
    const fab = document.getElementById('emergency-btn');
    const close = document.querySelector('.close-modal');
    const container = document.getElementById('emergency-content');

    if (!modal || !fab || !close || !container) return;

    fab.onclick = (e) => {
        e.preventDefault();
        const anchors = playbook?.sections?.find(s => s.category.includes('Emergency') || s.category.includes('Anchor'));
        if (anchors && anchors.points) {
            container.innerHTML = anchors.points.map(p => `
                <div class="emergency-point">
                    <h4>${p.title}</h4>
                    <p>${p.text}</p>
                </div>
            `).join('');
        }
        modal.classList.add('show');
    };

    close.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('show'); };
}

function setupModals() {
    // Other modal setup if needed
}
