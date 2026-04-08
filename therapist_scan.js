const fs = require('fs');
const path = require('path');

const files = ['_chat_1.txt', '_chat_2.txt', '_chat_3.txt', '_chat_4.txt'];
const folderPath = 'c:\\Users\\Mi5a\\Documents\\dodo analysis';

let messages = [];
let currentMsg = null;

const pattern = /^\[?(\d{2}\/\d{2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s?[AP]M)\]?\s(.*?):\s(.*)/;

// Read all messages
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
            currentMsg = {
                file: file,
                time: match[1],
                sender: match[2].trim(),
                text: match[3].trim()
            };
        } else {
            if (currentMsg) {
                currentMsg.text += " " + cleanLine;
            }
        }
    });
});
if (currentMsg) messages.push(currentMsg);

// Keyword categories
const conflictWords = ["sorry", "asef", "asfah", "z3lan", "za3lan", "meday2", "mday2", "khalas", "5alas", "msh 3arfa", "msh fahem", "mesh 3arfa", "tired", "ta3bana", "leave", "break", "enough"];
const vulnerabilityWords = ["trust", "sa2", "scared", "khayfa", "5ayfa", "hurt", "wa7di", "alone", "feelings", "connected", "overthink", "overthinking", "safe"];
const affectionWords = ["love", "ba7eb", "b7b", "doura", "douri", "princess", "bmoot", "wa7ashtini", "miss you"];

let out = "";

function analyzeCategory(words, tag) {
    let count = 0;
    let excerpts = [];
    
    // Reverse loop to get the MOST RECENT moments (from 2026/2025 back)
    for (let i = messages.length - 1; i >= 0; i--) {
        let m = messages[i];
        let t = m.text.toLowerCase();
        if (t.includes("omitted")) continue;
        
        if (words.some(w => t.includes(w))) {
            count++;
            if (excerpts.length < 20 && t.length > 20) {
                let context = [];
                if (i > 0) context.push(`${messages[i-1].sender}: ${messages[i-1].text}`);
                context.push(`${m.sender}: ${m.text}`);
                if (i < messages.length - 1) context.push(`${messages[i+1].sender}: ${messages[i+1].text}`);
                excerpts.push(`[${m.file} | ${m.time}]\n` + context.join('\n'));
            }
        }
    }
    out += `\n=== CATEGORY: ${tag} ===\n`;
    out += `Total hits: ${count}\n\n`;
    out += excerpts.join('\n\n---\n\n') + '\n';
}

out += `TOTAL MESSAGES ANALYZED: ${messages.length}\n`;

analyzeCategory(vulnerabilityWords, "RECENT VULNERABILITY & DEEP EMOTION");
analyzeCategory(conflictWords, "RECENT CONFLICT & TENSION");
analyzeCategory(affectionWords, "RECENT AFFECTION & SHIFTS");

fs.writeFileSync(path.join(folderPath, 'therapist_report_recent.txt'), out);
console.log("therapist_report_recent.txt generated.");
