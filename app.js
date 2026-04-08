document.addEventListener('DOMContentLoaded', () => {
    // Load main dashboard data with cache buster
    fetch('data.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            renderDashboard(data);
        })
        .catch(err => {
            console.error("Error loading data:", err);
            document.querySelectorAll('.loading').forEach(el => {
                if(el.closest('#playbook-container')) return; // handled separately
                el.textContent = "Error loading analysis data locally.";
                el.style.color = "var(--accent-red)";
            });
        });

    // Load Playbook data with cache buster
    fetch('playbook.json?v=' + Date.now())

        .then(response => response.json())
        .then(data => {
            renderPlaybook(data);
        })
        .catch(err => {
            console.error("Error loading playbook:", err);
            const container = document.getElementById('playbook-container');
            if(container) container.innerHTML = "<p class='loading' style='color:var(--accent-red)'>Error loading playbook data.</p>";
        });
});

function renderDashboard(data) {
    // Render Stats
    animateValue("total-msgs", 0, data.stats.total, 1500);
    animateValue("gf-msgs", 0, data.stats.gfTotal, 1500);
    animateValue("bf-msgs", 0, data.stats.bfTotal, 1500);

    // Render Feeds
    renderFeed('feed-likes', data.gfLoveLikes);
    renderFeed('feed-happy', data.gfHappySafe);
    renderFeed('feed-sad', data.gfMadSad);
    renderFeed('feed-breakup', data.breakdownHints);
}

function renderFeed(elementId, messages) {
    const container = document.getElementById(elementId);
    container.innerHTML = ""; // clear loading
    
    if (!messages || messages.length === 0) {
        container.innerHTML = "<p class='loading' style='animation:none;'>No significant insights found in this area.</p>";
        return;
    }

    // Only show last 50 for performance and relevance (usually the most recent are the most relevant in this context)
    const recentMessages = messages.slice(-50);
    
    // Reverse to show most recent at the top
    recentMessages.reverse().forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        
        const time = document.createElement('span');
        time.className = 'chat-time';
        time.textContent = msg.time;
        
        const text = document.createElement('p');
        text.className = 'chat-text';
        text.textContent = msg.text;
        
        bubble.appendChild(time);
        bubble.appendChild(text);
        container.appendChild(bubble);
    });
}

// Simple number counting animation
function animateValue(id, start, end, duration) {
    if (start === end) return;
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    if(stepTime === 0) stepTime = 1;
    let obj = document.getElementById(id);
    
    let timer = setInterval(function() {
        current += increment * Math.ceil(range / (duration / stepTime)); // accelerate
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        obj.innerHTML = current.toLocaleString();
    }, stepTime);
}

// Render the Master Playbook
function renderPlaybook(playbookData) {
    const container = document.getElementById('playbook-container');
    if (!container) return;
    container.innerHTML = ""; // Clear loading state

    let pointCounter = 1;

    playbookData.forEach(category => {
        // Create category wrapper
        const catDiv = document.createElement('div');
        catDiv.className = 'playbook-category';

        // Category Title
        const title = document.createElement('h3');
        title.textContent = category.category;
        catDiv.appendChild(title);

        // Horizontal scrolling wrapper for cards
        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'playbook-cards-wrapper';

        // Create cards
        category.points.forEach(point => {
            const card = document.createElement('div');
            card.className = 'playbook-card';

            const num = document.createElement('div');
            num.className = 'playbook-card-number';
            num.textContent = `Rule #${pointCounter}`;

            // Split the point into title (before colon) and text (after colon)
            const splitIndex = point.indexOf(':');
            let pointTitle = "";
            let pointText = point;
            
            // If it has a colon fairly early on
            if(splitIndex !== -1 && splitIndex < 80) {
                pointTitle = point.substring(0, splitIndex).trim();
                pointText = point.substring(splitIndex + 1).trim();
            } else if (point.length < 80 && splitIndex === -1) {
                // If it's a short line without a colon (a custom bolded title)
                pointTitle = point;
                pointText = "";
            }

            if(pointTitle) {
                const cTitle = document.createElement('div');
                cTitle.className = 'playbook-card-title';
                cTitle.textContent = pointTitle;
                card.appendChild(cTitle);
            }

            if(pointText) {
                const cText = document.createElement('div');
                cText.className = 'playbook-card-text';
                cText.textContent = pointText;
                card.appendChild(cText);
            }
            
            card.insertBefore(num, card.firstChild);
            
            cardsWrapper.appendChild(card);
            pointCounter++;
        });

        catDiv.appendChild(cardsWrapper);
        container.appendChild(catDiv);
    });
}

