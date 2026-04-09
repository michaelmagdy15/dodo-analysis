const fs = require('fs');

/**
 * PRODUCTION BUILD SCRIPT
 * Bundles index.html, index.css, app.js, and data into a single, unified index.html 
 * optimized for GitHub Pages and Netlify (zero-404 architecture).
 */

console.log('--- STARTING CLEAN BUILD ---');

try {
    // 1. Load component files
    const html = fs.readFileSync('index.html', 'utf8');
    const css = fs.readFileSync('index.css', 'utf8');
    const js = fs.readFileSync('app.js', 'utf8');
    const dataRaw = fs.readFileSync('data.json', 'utf8');
    const playbookRaw = fs.readFileSync('playbook.json', 'utf8');

    // 2. Prepare the bundle
    // CRITICAL: Escape </script> tags in data to prevent premature script termination
    const safeData = dataRaw.replace(/<\/script>/g, '<\\/script>');
    const safePlaybook = playbookRaw.replace(/<\/script>/g, '<\\/script>');

    // Strip out existing payloads to prevent double-bundling if run multiple times
    let cleanHtml = html
        .replace(/<script id="app-data-payload"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<script id="app-playbook-payload"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<script id="app-logic"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<style>[\s\S]*?<\/style>/g, ''); 

    // Inline the CSS
    let singleHtml = cleanHtml.replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
    if (singleHtml === cleanHtml) {
        singleHtml = cleanHtml.replace(/<\/head>/, `<style>${css}</style>\n</head>`);
    }

    // Remove the external JS script tag
    singleHtml = singleHtml.replace(/<script src="app\.js[^>]*><\/script>/, '');

    // 3. Inject JSON data and JS logic
    const bodyEndInjection = `
<script id="app-data-payload" type="application/json">
${safeData}
</script>
<script id="app-playbook-payload" type="application/json">
${safePlaybook}
</script>
<script id="app-logic">
${js}
</script>
</body>
`;

    singleHtml = singleHtml.replace(/<\/body>/, bodyEndInjection);

    // 4. Output the final file
    fs.writeFileSync('index.html', singleHtml, 'utf8');
    fs.writeFileSync('Dashboard.html', singleHtml, 'utf8'); // Keep backup version

    console.log('--- BUILD SUCCESSFUL ---');
    console.log('Generated: index.html (Bundled Version)');
    console.log('Size: ' + (Buffer.byteLength(singleHtml) / 1024).toFixed(2) + ' KB');

} catch (err) {
    console.error('--- BUILD FAILED ---');
    console.error(err);
    process.exit(1);
}
