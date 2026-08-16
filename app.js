// Work gallery category filter
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('[data-category]').forEach(item => item.classList.toggle('hidden', button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter));
}));

// Contact Form & Quick Lead Handler (Sends instant Telegram alerts with email & details)
(() => {
    const BOT_TOKEN = '8978692415:AAErBcFHz3xBkr1XHoHGaG9cFrigha6iSrk';
    const CHAT_ID = '5977766921';

    // Main Contact Brief Form Handler
    document.querySelectorAll('.brief').forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.textContent = 'Sending...'; submitBtn.disabled = true; }

            const formData = new FormData(form);
            const name = formData.get('name') || 'Not provided';
            const email = formData.get('email') || 'Not provided';
            const company = formData.get('company') || 'Not provided';
            const need = formData.get('need') || 'Not provided';
            const message = formData.get('message') || 'No details provided';

            let locStr = 'Unknown Location';
            let ipStr = '';
            try {
                const geoRes = await fetch('https://ipwho.is/').then(r => r.json());
                if (geoRes.success) {
                    const flag = geoRes.flag?.emoji ? geoRes.flag.emoji + ' ' : '';
                    locStr = `${flag}${geoRes.city || ''}, ${geoRes.country || ''}`;
                    ipStr = geoRes.ip || '';
                }
            } catch(e) {}

            let tgMessage = `📩 *NEW PROJECT BRIEF RECEIVED!*\n\n`;
            tgMessage += `👤 *Name*: ${name}\n`;
            tgMessage += `📧 *Email*: \`${email}\`\n`;
            tgMessage += `🏢 *Company*: ${company}\n`;
            tgMessage += `💡 *Need*: ${need}\n`;
            tgMessage += `💬 *Message*: ${message}\n\n`;
            tgMessage += `📍 *Location*: ${locStr}\n`;
            if (ipStr) tgMessage += `🌐 *IP*: ${ipStr}\n`;
            tgMessage += `⏰ *Time*: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: tgMessage, parse_mode: 'Markdown' })
            }).catch(() => {});

            // Also trigger mailto: digitallyhq@gmail.com
            const subject = encodeURIComponent('Project inquiry from ' + name);
            const details = encodeURIComponent([...new FormData(form)].map(([k, v]) => k + ': ' + v).join('\n'));
            setTimeout(() => {
                window.location.href = 'mailto:digitallyhq@gmail.com?subject=' + subject + '&body=' + details;
            }, 300);

            let feedback = form.querySelector('.form-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'form-feedback';
                feedback.style.cssText = 'margin-top:16px; font-weight:700; color:var(--gold); font-size:14px;';
                form.appendChild(feedback);
            }
            feedback.textContent = '✓ Thank you! Your brief has been sent to Bhavesh & Samruddhi. We will reply within 24 hours.';
            if (submitBtn) { submitBtn.textContent = 'Brief Sent ✓'; }
            form.reset();
        });
    });

    // Quick Email Lead Bar Handler
    document.querySelectorAll('.quick-lead-form').forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const emailInput = form.querySelector('input[type="email"]');
            const statusDiv = form.nextElementSibling || form.querySelector('.quick-lead-msg');
            const email = emailInput ? emailInput.value : '';

            if (!email) return;
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '...'; }

            let locStr = 'Unknown Location';
            try {
                const geoRes = await fetch('https://ipwho.is/').then(r => r.json());
                if (geoRes.success) {
                    const flag = geoRes.flag?.emoji ? geoRes.flag.emoji + ' ' : '';
                    locStr = `${flag}${geoRes.city || ''}, ${geoRes.country || ''}`;
                }
            } catch(e) {}

            let tgMessage = `⚡ *QUICK EMAIL LEAD CAPTURED!*\n\n`;
            tgMessage += `📧 *Email*: \`${email}\`\n`;
            tgMessage += `📄 *Page Submitted From*: ${document.title} (\`${window.location.pathname.split('/').pop() || 'index.html'}\`)\n`;
            tgMessage += `📍 *Location*: ${locStr}\n`;
            tgMessage += `⏰ *Time*: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: tgMessage, parse_mode: 'Markdown' })
            }).catch(() => {});

            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.color = '#c7ff54';
                statusDiv.textContent = '✓ Thanks! We will reach out shortly.';
            }
            if (submitBtn) { submitBtn.textContent = 'Sent ✓'; }
            if (emailInput) emailInput.value = '';
        });
    });
})();

// Social Lightbox & Carousel Slide Viewer
(() => {
    const modal = document.createElement('div');
    modal.id = 'social-lightbox';
    modal.className = 'social-lightbox';
    modal.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" id="lb-close">✕ Close</button>
            <img src="" alt="Social Work Preview" class="lightbox-img" id="lb-img">
            <div class="lightbox-bar">
                <div>
                    <div class="lightbox-title" id="lb-title"></div>
                    <div class="lightbox-counter" id="lb-counter"></div>
                </div>
                <div class="lightbox-nav" id="lb-nav">
                    <button class="lightbox-btn" id="lb-prev">← Prev</button>
                    <button class="lightbox-btn" id="lb-next">Next →</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const lbImg = modal.querySelector('#lb-img');
    const lbTitle = modal.querySelector('#lb-title');
    const lbCounter = modal.querySelector('#lb-counter');
    const lbNav = modal.querySelector('#lb-nav');
    const btnPrev = modal.querySelector('#lb-prev');
    const btnNext = modal.querySelector('#lb-next');
    const btnClose = modal.querySelector('#lb-close');

    let currentSlides = [];
    let currentIndex = 0;
    let currentTitle = '';

    function updateLightbox() {
        if (!currentSlides.length) return;
        lbImg.src = currentSlides[currentIndex];
        lbTitle.textContent = currentTitle;
        if (currentSlides.length > 1) {
            lbNav.style.display = 'flex';
            lbCounter.textContent = `Slide ${currentIndex + 1} of ${currentSlides.length}`;
        } else {
            lbNav.style.display = 'none';
            lbCounter.textContent = 'Static Post';
        }
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('[data-slides]');
        if (card) {
            currentSlides = JSON.parse(card.dataset.slides || '[]');
            currentTitle = card.dataset.title || 'Social Work Showcase';
            currentIndex = 0;
            updateLightbox();
            modal.classList.add('active');
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentSlides.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentSlides.length) % currentSlides.length;
        updateLightbox();
    });

    btnNext.addEventListener('click', () => {
        if (currentSlides.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentSlides.length;
        updateLightbox();
    });

    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('active');
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') btnPrev.click();
            if (e.key === 'ArrowRight') btnNext.click();
        }
    });
})();

// Simple Clean Yellow Dot Cursor
(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = -100, mouseY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    const hoverSelectors = 'a, button, input, textarea, .project, .gallery-item, .gallery-card, .gallery-tile, .case-card, .filter, .social-btn, .lightbox-btn, .lightbox-close, #lb-close, #lb-prev, #lb-next';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverSelectors)) {
            document.body.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelectors)) {
            document.body.classList.remove('cursor-hover');
        }
    });

    window.addEventListener('mousedown', () => document.body.classList.add('cursor-active'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-active'));
})();

// Minimal Studio Floating Glass Navigation Bar (<900px)
(() => {
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isAbout = window.location.pathname.includes('about');
    const isServices = window.location.pathname.includes('services');
    const isWork = window.location.pathname.includes('work') || window.location.pathname.includes('case-');
    const isContact = window.location.pathname.includes('contact');

    const floatNav = document.createElement('div');
    floatNav.className = 'floating-mobile-nav';
    floatNav.innerHTML = `
        <a href="index.html" class="float-nav-item ${isHome ? 'active' : ''}">Home</a>
        <a href="about.html" class="float-nav-item ${isAbout ? 'active' : ''}">About</a>
        <a href="services.html" class="float-nav-item ${isServices ? 'active' : ''}">Capabilities</a>
        <a href="work.html" class="float-nav-item ${isWork ? 'active' : ''}">Work</a>
        <a href="contact.html" class="float-nav-item ${isContact ? 'active' : ''}">Contact</a>
    `;
    document.body.appendChild(floatNav);
})();

// Private Visitor Telegram Alert System
(() => {
    const sessionKey = 'tg_alert_' + window.location.pathname;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const BOT_TOKEN = '8978692415:AAErBcFHz3xBkr1XHoHGaG9cFrigha6iSrk';
    const CHAT_ID = '5977766921';

    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return '📱 Mobile';
        if (/ipad|tablet/i.test(ua)) return '📱 Tablet';
        return '💻 Desktop';
    };

    const sendAlert = (geoData = {}) => {
        const pageTitle = document.title || 'DigitAlly Site';
        const pagePath = window.location.pathname.split('/').pop() || 'index.html';
        const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct / Bookmark';
        const device = getDeviceType();
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const flag = geoData.flag?.emoji ? geoData.flag.emoji + ' ' : '';
        const city = geoData.city || 'Unknown City';
        const region = geoData.region || '';
        const country = geoData.country || 'Unknown Location';
        const locationStr = `${flag}${city}${region ? ', ' + region : ''}, ${country}`;
        const isp = geoData.connection?.org || geoData.connection?.isp || '';
        const ip = geoData.ip || '';

        let message = `🔔 *New Visitor Alert!*\n\n`;
        message += `📍 *Location*: ${locationStr}\n`;
        if (isp) message += `🏢 *Network/ISP*: ${isp}\n`;
        if (ip) message += `🌐 *IP Address*: ${ip}\n`;
        message += `📄 *Page*: ${pageTitle} (\`${pagePath}\`)\n`;
        message += `🔗 *Source*: ${referrer}\n`;
        message += `💻 *Device*: ${device} (${screenRes})\n`;
        message += `⏰ *Time*: ${time}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        }).catch(() => {});
    };

    fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => sendAlert(data))
        .catch(() => sendAlert());
})();

