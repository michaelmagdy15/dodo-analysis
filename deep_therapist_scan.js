const fs = require('fs');
const path = require('path');

const files = ['_chat_3.txt', '_chat_4.txt'];
const folderPath = 'c:\\Users\\Mi5a\\Documents\\dodo analysis';

let messages = [];
let currentMsg = null;
const pattern = /^\[?(\d{2}\/\d{2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s?[AP]M)\]?\s(.*?):\s(.*)/;

files.forEach(file => {
    const filePath = path.join(folderPath, file);
    if (!fs.existsSync(filePath)) return;
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    lines.forEach(line => {
        let cleanLine = line.trim().replace(/\u200e/g, "");
        const match = cleanLine.match(pattern);
        if (match) {
            if (currentMsg) messages.push(currentMsg);
            currentMsg = { file: file, time: match[1], sender: match[2].trim(), text: match[3].trim() };
        } else {
            if (currentMsg) currentMsg.text += " " + cleanLine;
        }
    });
});
if (currentMsg) messages.push(currentMsg);

let out = "=== DEEP THERAPIST ANALYSIS REPORT ===\n\n";

// 1. Longest messages (often indicates high emotional outpouring)
messages.sort((a,b) => b.text.length - a.text.length);
out += "--- LONGEST MESSAGES FROM MICHAEL ---\n";
messages.filter(m => m.sender.includes("Michael")).slice(0, 10).forEach(m => {
    out += `[${m.time}] : ${m.text.substring(0, 800)}...\n\n`;
});

out += "--- LONGEST MESSAGES FROM SANDRA ---\n";
messages.filter(m => !m.sender.includes("Michael")).slice(0, 10).forEach(m => {
    out += `[${m.time}] : ${m.text.substring(0, 800)}...\n\n`;
});

// 2. Exact conversation blocks around critical emotional triggers in April 2026
// Sort back chronologically
messages.sort((a, b) => {
    // Just relying on array order before sorting was better, let's re-read to preserve order.
});

// To be safe, let's re-read properly in order
let orderedMsgs = [];
let currentOrderedMsg = null;
files.forEach(file => {
    const filePath = path.join(folderPath, file);
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach(line => {
        let cleanLine = line.trim().replace(/\u200e/g, "");
        const match = cleanLine.match(pattern);
        if (match) {
            if (currentOrderedMsg) orderedMsgs.push(currentOrderedMsg);
            currentOrderedMsg = { file: file, time: match[1], sender: match[2].trim(), text: match[3].trim() };
        } else {
            if (currentOrderedMsg) currentOrderedMsg.text += " " + cleanLine;
        }
    });
});
if (currentOrderedMsg) orderedMsgs.push(currentOrderedMsg);

out += "--- CRITICAL DIALOGUE (March-April 2026) around 'disconnect'/'hurt'/'feel' ---\n";
const triggerWords = ["emotionally connected", "hurt", "feelings", "safety", "trust", "uncertain", "breakup", "distance", "alined", "nos kom", "leave", "tired"];

for(let i=orderedMsgs.length-5000; i<orderedMsgs.length; i++) {
    if(i < 0) continue;
    let text = orderedMsgs[i].text.toLowerCase();
    if(triggerWords.some(w => text.includes(w)) && text.length > 20 && !text.includes("omitted") && !text.includes("chemotherapy")) {
        out += `\n> FOUND TRIGGER IN:\n`;
        for(let j=Math.max(0, i-4); j<=Math.min(orderedMsgs.length-1, i+4); j++) {
            out += `[${orderedMsgs[j].time}] ${orderedMsgs[j].sender}: ${orderedMsgs[j].text}\n`;
        }
        out += `\n-----------------\n`;
    }
}

fs.writeFileSync(path.join(folderPath, 'deep_report.txt'), out);
console.log("deep_report.txt generated with advanced insights.");
