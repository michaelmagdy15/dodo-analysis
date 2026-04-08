const fs = require('fs');
const path = require('path');

const files = ['_chat_1.txt', '_chat_2.txt', '_chat_3.txt', '_chat_4.txt'];
const folderPath = 'c:\\Users\\Mi5a\\Documents\\dodo analysis';

let messages = [];
let currentMsg = null;

const pattern = /^\[?(\d{2}\/\d{2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M)\]?\s(.*?):\s(.*)/;

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

const gfName = "My Princess 👸❤️😘";
const bfName = "Michael Mitry";

const gfMsgs = messages.filter(m => m.sender === gfName);
const bfMsgs = messages.filter(m => m.sender === bfName);

console.log(`Total messages: ${messages.length}`);
console.log(`Girlfriend messages: ${gfMsgs.length}`);
console.log(`Boyfriend messages: ${bfMsgs.length}`);

// Keyword extraction logic
const likesKeywords = ["love", "like", "fav", "favorite", "ba7eb", "bahib", "baheb", "bmoot", "to7fa", "helw", "helwa", "7elw", "7elwa", "gamed", "gamda", "b7eb", "b7b"];
const happyKeywords = ["happy", "bafra7", "farhana", "far7ana", "mabsoot", "mabsota", "mabsouta", "safe", "barta7", "mabsouta", " مبسوطة", "فرحانة", "ferht", "fere7t"];
const sadMadKeywords = ["mad", "angry", "hate", "z3lan", "za3lan", "za3lana", "z3lana", "metday2", "metday2a", "betday2", "sad", "bekrah", "bakrah", "bكره", "makhnou2a", "ma5nou2a", "mday2a", "mday2ani", "wages", "wa7esh"];
const breakupKeywords = ["5alas", "khalas", "break", "leave", "sibe", "sibni", "seebni", "seeb", "msheya", "msh hakalemak", "msh hatkalaem", "mesh hatkalaem", "bye", "enough", "we need to talk", "stop", "tired", "ta3bana", "mesh a2dra"];

function extractMatches(msgs, keywords) {
    let results = [];
    msgs.forEach(m => {
        const t = m.text.toLowerCase();
        if (t.includes("omitted")) return;
        if (keywords.some(kw => t.includes(kw))) {
            results.push({ time: m.time, text: m.text });
        }
    });
    return results;
}

const report = {
    stats: {
        total: messages.length,
        gfTotal: gfMsgs.length,
        bfTotal: bfMsgs.length,
    },
    gfLoveLikes: extractMatches(gfMsgs, likesKeywords),
    gfHappySafe: extractMatches(gfMsgs, happyKeywords),
    gfMadSad: extractMatches(gfMsgs, sadMadKeywords),
    breakdownHints: extractMatches(messages, breakupKeywords) // analyze both for hints
};

fs.writeFileSync(path.join(folderPath, 'data.json'), JSON.stringify(report, null, 2));
console.log("Analysis saved to data.json");
