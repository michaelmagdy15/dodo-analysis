import os
import re
from collections import Counter

folder_path = r"c:\Users\Mi5a\Documents\dodo analysis"
files = ["_chat_1.txt", "_chat_2.txt", "_chat_3.txt", "_chat_4.txt"]

messages = []
current_msg = None

# Regex to match the timestamp and sender part
pattern = re.compile(r'^\[?(\d{2}/\d{2}/\d{4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M)\]?\s(.*?):\s(.*)')

for file in files:
    path = os.path.join(folder_path, file)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # Some lines start with \u200e character, so we strip it.
            line = line.lstrip("\u200e")
            match = pattern.match(line)
            if match:
                if current_msg:
                    messages.append(current_msg)
                current_msg = {
                    "time": match.group(1),
                    "sender": match.group(2).replace("\u200e", "").strip(),
                    "text": match.group(3).strip()
                }
            else:
                if current_msg:
                    current_msg["text"] += " " + line

if current_msg:
    messages.append(current_msg)

gf_name = "My Princess 👸❤️😘"
bf_name = "Michael Mitry"

gf_msgs = [m for m in messages if m["sender"] == gf_name]
bf_msgs = [m for m in messages if m["sender"] == bf_name]

print(f"Total messages parsed: {len(messages)}")
print(f"Girlfriend messages: {len(gf_msgs)}")
print(f"Boyfriend messages: {len(bf_msgs)}")

# Let's extract some keywords
likes_keywords = ["love", "like", "fav", "favorite", "ba7eb", "bahib", "baheb", "bmoot fe", "bmoot", "to7fa", "helw", "helwa", "7elw", "7elwa", "gamed", "gamda"]
happy_keywords = ["happy", "bafra7", "farhana", "far7ana", "mabsoot", "mabsota", "mabsouta", "safe", "barta7"]
sad_mad_keywords = ["mad", "angry", "hate", "z3lan", "za3lan", "za3lana", "z3lana", "metday2", "metday2a", "betday2", "sad", "bekrah", "bakrah", "bكره", "makhnou2a", "ma5nou2a", "mday2a", "mday2ani", "wages"]

def extract_contexts(msgs, keywords):
    results = []
    for m in msgs:
        text = m["text"].lower()
        if any(kw in text for kw in keywords) and "omitted" not in text:
            results.append(m["text"])
    return results

gf_likes = extract_contexts(gf_msgs, likes_keywords)
gf_happy = extract_contexts(gf_msgs, happy_keywords)
gf_sad = extract_contexts(gf_msgs, sad_mad_keywords)
bf_sad = extract_contexts(bf_msgs, sad_mad_keywords)

print(f"\nGF Likes/Loves ({len(gf_likes)}):")
for t in gf_likes[-30:]: # Print last 30 for context
    print("- " + t[:150])

print(f"\nGF Happy/Safe ({len(gf_happy)}):")
for t in gf_happy[-30:]:
    print("- " + t[:150])

print(f"\nGF Sad/Mad ({len(gf_sad)}):")
for t in gf_sad[-30:]:
    print("- " + t[:150])

# Semi-breakup context
breakup_kws = ["5alas", "khalas", "break", "leave", "sibe", "sibni", "seebni", "seeb", "msheya", "msh hakalemak", "msh hatkalaem", "mesh hatkalaem", "bye", "enough"]
gf_breakup = extract_contexts(gf_msgs, breakup_kws)
print(f"\nGF Breakup Context ({len(gf_breakup)}):")
for t in gf_breakup[-30:]:
    print("- " + t[:150])
