const fs = require('fs');
const path = require('path');

// Read all source files
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('index.css', 'utf8');
let js = fs.readFileSync('app.js', 'utf8');

const dataRaw = fs.readFileSync('data.json', 'utf8');
const playbookRaw = fs.readFileSync('playbook.json', 'utf8');

// --- Modify JS for Offline Use ---
// 1. Remove the standard init call
js = js.replace('initDashboard();', '// initDashboard(); handled by inline loader');

// 2. Add an inline loader that uses the window data instead of fetch
const inlineLoader = `
async function initOfflineDashboard() {
    try {
        const data = window.__APP_DATA__;
        const playbook = window.__PLAYBOOK_DATA__;

        if (!data || !playbook) throw new Error('Inlined data missing.');

        renderDashboard(data);
        renderPlaybook(playbook);
        setupEmergencyModal(playbook);
        
        document.body.classList.add('loaded');
        console.log('Offline Dashboard Loaded Successfully');
    } catch (e) {
        console.error('Offline Load Error:', e);
    }
}
document.addEventListener('DOMContentLoaded', initOfflineDashboard);
`;

// --- Compile Single File ---
let singleHtml = html;

// Inject internal CSS
singleHtml = singleHtml.replace(/<link rel="stylesheet" href="index\.css[^>]*>/, `<style>\n${css}\n</style>`);

// Remove external JS link
singleHtml = singleHtml.replace(/<script src="app\.js[^>]*><\/script>/, '');

// Inject JSON data and JS logic
const bodyEndInjection = `
<script id="app-data">
    window.__APP_DATA__ = ${dataRaw};
    window.__PLAYBOOK_DATA__ = ${playbookRaw};
</script>
<script id="app-logic">
${js}
${inlineLoader}
</script>
</body>
`;

singleHtml = singleHtml.replace(/<\/body>/, bodyEndInjection);

// Output the final file
fs.writeFileSync('Dashboard.html', singleHtml, 'utf8');
console.log('--- BUILD SUCCESSFUL ---');
console.log('Generated: Dashboard.html');
console.log('Size: ' + (Buffer.byteLength(singleHtml) / 1024).toFixed(2) + ' KB');
