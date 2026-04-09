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

// Advanced Analytics Schemas
const llAffirmation = ["love you", "proud of", "thank you", "best", "sweet", "ba7eb", "to7fa", "helw", "fokhra"];
const llService = ["helped", "did this", "fixed", "made this for", "sa3edt", "3amalt", "gebt"];
const llTime = ["miss", "see you", "together", "wait", "soon", "with you", "wa7ashteni", "ma3ak", "wa2t", "m3ak", "ashofak"];
const llTouch = ["hug", "kiss", "cuddle", "hold", "hodn", "bos", "حضن", "بوس"];

function generateAdvancedAnalytics(messages, gfName) {
    const timeline = {};
    const heatmap = {};
    const timeOfDay = Array(24).fill(0).map((_, i) => ({ hour: i, happy: 0, conflict: 0 }));
    const loveLanguages = { affirmation: 0, service: 0, time: 0, touch: 0 };
    
    let latencySum = 0;
    let latencyCount = 0;
    let lastBfMsgTime = null;

    messages.forEach(m => {
        // Parse time formats like "02/14/2023, 10:30:00 PM"
        const timeStr = m.time.replace('[', '').replace(']', '').trim();
        const dateObj = new Date(timeStr);
        if (isNaN(dateObj)) return; 
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hour = dateObj.getHours();

        const monthKey = `${year}-${month}`;
        const dayKey = `${year}-${month}-${day}`;
        
        if (!timeline[monthKey]) timeline[monthKey] = { label: monthKey, happy: 0, sad: 0, conflict: 0 };
        if (!heatmap[dayKey]) heatmap[dayKey] = { date: dayKey, level: 0 };

        const t = m.text.toLowerCase();
        if (t.includes("omitted")) return;
        
        const isHappy = happyKeywords.some(kw => t.includes(kw));
        const isSad = sadMadKeywords.some(kw => t.includes(kw));
        const isConflict = breakupKeywords.some(kw => t.includes(kw));
        
        if (m.sender === gfName) {
            if (isHappy) timeline[monthKey].happy += 1;
            if (isSad) timeline[monthKey].sad += 1;

            if (llAffirmation.some(kw => t.includes(kw))) loveLanguages.affirmation++;
            if (llService.some(kw => t.includes(kw))) loveLanguages.service++;
            if (llTime.some(kw => t.includes(kw))) loveLanguages.time++;
            if (llTouch.some(kw => t.includes(kw))) loveLanguages.touch++;

            // Measure response time to him
            if (lastBfMsgTime && (dateObj - lastBfMsgTime) > 0 && (dateObj - lastBfMsgTime) < 86400000) { // < 24 hrs
                latencySum += (dateObj - lastBfMsgTime) / 60000; // mins
                latencyCount++;
            }
        } else {
            lastBfMsgTime = dateObj; 
        }
        
        if (isConflict) timeline[monthKey].conflict += 1;
        
        if (isHappy) heatmap[dayKey].level += 1;
        if (isConflict) heatmap[dayKey].level -= 2;

        if (isHappy) timeOfDay[hour].happy++;
        if (isConflict) timeOfDay[hour].conflict++;
    });
    
    // Normalize heatmap - cap it so extreme days don't destroy color bounds
    Object.keys(heatmap).forEach(k => {
        if (heatmap[k].level > 4) heatmap[k].level = 4;
        if (heatmap[k].level < -2) heatmap[k].level = -2;
    });

    return {
        timeline: Object.values(timeline).sort((a,b) => a.label.localeCompare(b.label)),
        heatmap: Object.values(heatmap).sort((a,b) => a.date.localeCompare(b.date)),
        timeOfDay: timeOfDay,
        loveLanguages: loveLanguages,
        avgResponseLatencyMins: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0
    };
}

const analytics = generateAdvancedAnalytics(messages, gfName);

const report = {
    stats: {
        total: messages.length,
        gfTotal: gfMsgs.length,
        bfTotal: bfMsgs.length,
    },
    gfLoveLikes: extractMatches(gfMsgs, likesKeywords),
    gfHappySafe: extractMatches(gfMsgs, happyKeywords),
    gfMadSad: extractMatches(gfMsgs, sadMadKeywords),
    breakdownHints: extractMatches(messages, breakupKeywords),
    ...analytics
};

fs.writeFileSync(path.join(folderPath, 'data.json'), JSON.stringify(report, null, 2));
console.log("Analysis saved to data.json");
