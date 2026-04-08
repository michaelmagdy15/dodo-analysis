const fs = require('fs');

const rawText = fs.readFileSync('raw_playbook.txt', 'utf8');
const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const playbook = [];
let currentCategory = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Categories
    const isAllCaps = line.toUpperCase() === line && line.length > 10;
    const isNumberedHeader = /^\d+\.\s/.test(line) && !line.includes(':') && line.length < 80;
    const isExplicitSummary = line.startsWith('Summary:');

    if (isAllCaps || isNumberedHeader || isExplicitSummary) {
        currentCategory = { category: line, points: [] };
        playbook.push(currentCategory);
        continue;
    }

    if (!currentCategory) {
        currentCategory = { category: "General Insights", points: [] };
        playbook.push(currentCategory);
    }

    currentCategory.points.push(line);
}


// Clean up any empty categories
const cleanedPlaybook = playbook.filter(c => c.points.length > 0);

fs.writeFileSync('playbook.json', JSON.stringify(cleanedPlaybook, null, 2));
console.log(`Saved ${cleanedPlaybook.reduce((acc, c) => acc + c.points.length, 0)} points across ${cleanedPlaybook.length} categories to playbook.json`);
