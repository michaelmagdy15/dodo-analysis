const fs = require('fs');
const path = require('path');

// Read all source files
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('index.css', 'utf8');
let js = fs.readFileSync('app.js', 'utf8');

const dataRaw = fs.readFileSync('data.json', 'utf8');
const playbookRaw = fs.readFileSync('playbook.json', 'utf8');

// --- Modify JS for Offline Use ---
// 1. Remove the standard init call to avoid double firing
js = js.replace('initDashboard();', '// initDashboard(); handled by inline loader');

// 2. Add an inline loader that extracts data from the JSON script tags
const inlineLoader = `
function initOfflineDashboard() {
    try {
        console.log('--- STARTING OFFLINE INIT ---');
        const dataPayload = document.getElementById('app-data-payload');
        const playbookPayload = document.getElementById('playbook-data-payload');
        
        if (!dataPayload || !playbookPayload) {
            console.error('Data payloads not found in DOM.');
            return;
        }

        const data = JSON.parse(dataPayload.textContent);
        const playbook = JSON.parse(playbookPayload.textContent);

        window.__APP_DATA__ = data;
        window.__PLAYBOOK_DATA__ = playbook;

        if (typeof processAndRender === 'function') {
            processAndRender(data, playbook);
        } else {
            console.error('processAndRender function not found.');
        }
        
        console.log('--- OFFLINE DASHBOARD LOADED ---');
    } catch (e) {
        console.error('Offline Load Error:', e);
    }
}
// Run immediately if DOM is ready, or wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineDashboard);
} else {
    initOfflineDashboard();
}
`;

// --- Compile Single File ---
let singleHtml = html;

// Inject internal CSS
singleHtml = singleHtml.replace(/<link rel="stylesheet" href="index\.css[^>]*>/, `<style>\n${css}\n</style>`);

// Remove external JS link
singleHtml = singleHtml.replace(/<script src="app\.js[^>]*><\/script>/, '');

// Inject JSON data and JS logic
const bodyEndInjection = `
<script id="app-data-payload" type="application/json">
${dataRaw}
</script>
<script id="app-playbook-payload" type="application/json">
${playbookRaw}
</script>
<script id="app-logic">
${js}
</script>
</body>
`;

singleHtml = singleHtml.replace(/<\/body>/, bodyEndInjection);

// Output the final file
fs.writeFileSync('Dashboard.html', singleHtml, 'utf8');
console.log('--- BUILD SUCCESSFUL ---');
console.log('Generated: Dashboard.html');
console.log('Size: ' + (Buffer.byteLength(singleHtml) / 1024).toFixed(2) + ' KB');
