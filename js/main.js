/**
 * Hanuruha Foundation Landing Page Logic
 * Pure JavaScript - No external dependencies
 */

const loadMetadata = async () => {
    // Preferred: metadata injected via metadata.js for offline/simple usage.
    if (window.__HANURUHA_METADATA) return window.__HANURUHA_METADATA;

    throw new Error('metadata.js not loaded (window.__HANURUHA_METADATA is missing)');
};

const upsertMetaByName = (name, content) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

const upsertMetaByProperty = (property, content) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[property="${property}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
    if (!href) return;
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
};

const upsertJsonLd = (jsonLd) => {
    if (!jsonLd) return;
    let el = document.head.querySelector('script[type="application/ld+json"][data-source="metadata"]');
    if (!el) {
        el = document.createElement('script');
        el.type = 'application/ld+json';
        el.dataset.source = 'metadata';
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);
};

const applyHeadFromMetadata = (metadata) => {
    const site = metadata && metadata.site;
    if (!site) return;

    document.title = site.title || site.metaTitle || document.title;

    // Primary SEO
    upsertMetaByName('title', site.metaTitle || site.title);
    upsertMetaByName('description', site.description);
    upsertMetaByName('keywords', site.keywords);
    upsertMetaByName('author', site.author);
    upsertMetaByName('robots', site.robots);
    upsertLink('canonical', site.canonicalUrl);

    // Open Graph
    const og = site.openGraph;
    if (og) {
        upsertMetaByProperty('og:type', og.type);
        upsertMetaByProperty('og:url', og.url);
        upsertMetaByProperty('og:title', og.title);
        upsertMetaByProperty('og:description', og.description);
        upsertMetaByProperty('og:image', og.image);
    }

    // Twitter
    const tw = site.twitter;
    if (tw) {
        upsertMetaByProperty('twitter:card', tw.card);
        upsertMetaByProperty('twitter:url', tw.url);
        upsertMetaByProperty('twitter:title', tw.title);
        upsertMetaByProperty('twitter:description', tw.description);
        upsertMetaByProperty('twitter:image', tw.image);
    }

    // Structured data
    upsertJsonLd(site.jsonLd);
};

const setText = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value != null ? value : '';
};

const escapeHtml = (value) => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const renderBodyFromMetadata = (metadata) => {
    const content = metadata && metadata.content;
    if (!content) return;

    // Nav
    const navHome = document.getElementById('nav-home-link');
    if (navHome && content.nav) {
        navHome.setAttribute('href', content.nav.homeHref || '/');
        navHome.setAttribute('aria-label', content.nav.homeAriaLabel || 'Home');
    }

    // Logo
    const logoEl = document.getElementById('site-logo');
    if (logoEl && content.logo) {
        logoEl.setAttribute('src', content.logo.src || '');
        logoEl.setAttribute('alt', content.logo.alt || '');
    }

    // Marquee
    const marqueeEl = document.getElementById('marquee-content');
    if (marqueeEl && content.marquee && Array.isArray(content.marquee.items) && content.marquee.items.length) {
        const repeat = typeof content.marquee.repeat === 'number' && isFinite(content.marquee.repeat) ? content.marquee.repeat : 1;
        const all = [];
        for (let i = 0; i < Math.max(1, repeat); i += 1) {
            for (let j = 0; j < content.marquee.items.length; j += 1) all.push(content.marquee.items[j]);
        }

        marqueeEl.innerHTML = all
            .map((text) => `<div class="marquee-item">${escapeHtml(text)}</div>`)
            .join('');
    }

    // Hero
    setText('hero-title', content.hero && content.hero.title);
    setText('hero-description', content.hero && content.hero.description);

    const brochure = content.hero && content.hero.brochure;
    const brochureLink = document.getElementById('brochure-link');
    if (brochureLink && brochure) {
        brochureLink.setAttribute('href', brochure.href || '#');
        brochureLink.setAttribute('title', brochure.title || '');
        brochureLink.setAttribute('aria-label', brochure.ariaLabel || '');
    }
    setText('brochure-label', brochure && brochure.label);

    // Countdown labels + aria
    const countdown = content.countdown;
    const countdownEl = document.getElementById('countdown');
    if (countdownEl && countdown && countdown.ariaLabel) {
        countdownEl.setAttribute('aria-label', countdown.ariaLabel);
    }
    setText('label-days', countdown && countdown.labels && countdown.labels.days);
    setText('label-hours', countdown && countdown.labels && countdown.labels.hours);
    setText('label-minutes', countdown && countdown.labels && countdown.labels.minutes);
    setText('label-seconds', countdown && countdown.labels && countdown.labels.seconds);

    // Contact
    setText('contact-title', content.contact && content.contact.title);
    setText('contact-subtitle', content.contact && content.contact.subtitle);

    const cardsEl = document.getElementById('contact-cards');
    const cards = content.contact && content.contact.cards;
    if (cardsEl && Array.isArray(cards)) {
        const delays = content.contact && Array.isArray(content.contact.animationDelays) ? content.contact.animationDelays : [];
        cardsEl.innerHTML = cards
            .map((card, idx) => {
                const delay = delays[idx];
                const delayStyle = typeof delay === 'number' ? ` style="transition-delay: ${delay}s"` : '';
                const iconClass = escapeHtml(card.iconClass || '');
                const title = escapeHtml(card.title || '');
                const value = escapeHtml(card.value || '');
                const valueClass = escapeHtml(card.valueClass || 'phone-number');
                const href = escapeHtml(card.href || '#');
                const titleAttr = escapeHtml(card.titleAttr || '');
                const ariaLabel = escapeHtml(card.ariaLabel || '');

                return `
                    <div class="col-md-4 reveal-on-scroll"${delayStyle}>
                        <a href="${href}" class="contact-card" title="${titleAttr}" aria-label="${ariaLabel}">
                            <i class="${iconClass}" aria-hidden="true"></i>
                            <h3 class="fw-bold h5 mb-1">${title}</h3>
                            <span class="${valueClass} contact-value">${value}</span>
                        </a>
                    </div>
                `;
            })
            .join('');
    }

    // WhatsApp
    const wa = content.whatsapp;
    const waLink = document.getElementById('whatsapp-link');
    if (waLink && wa) {
        waLink.setAttribute('href', wa.href || '#');
        waLink.setAttribute('title', wa.title || '');
        waLink.setAttribute('aria-label', wa.ariaLabel || '');
    }

    // Footer
    setText('footer-brand', content.footer && content.footer.brand);
    const footerBrand = document.getElementById('footer-brand');
    if (footerBrand && content.footer && typeof content.footer.brandLetterSpacingPx === 'number' && isFinite(content.footer.brandLetterSpacingPx)) {
        footerBrand.style.letterSpacing = content.footer.brandLetterSpacingPx + 'px';
    }
    setText('footer-address', content.footer && content.footer.address);
    const copyrightEl = document.getElementById('footer-copyright');
    if (copyrightEl) {
        copyrightEl.innerHTML = (content.footer && content.footer.copyrightHtml) ? content.footer.copyrightHtml : '';
    }
};

const initScrollReveal = () => {
    const nodes = Array.prototype.slice.call(document.querySelectorAll('.reveal-on-scroll'));
    if (!nodes.length) return;

    // Respect reduced motion.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        for (let i = 0; i < nodes.length; i += 1) nodes[i].classList.add('is-visible');
        return;
    }

    // Fallback: if IntersectionObserver isn't supported, reveal immediately.
    if (!('IntersectionObserver' in window)) {
        for (let i = 0; i < nodes.length; i += 1) nodes[i].classList.add('is-visible');
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        },
        { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    for (let i = 0; i < nodes.length; i += 1) observer.observe(nodes[i]);
};

const getLaunchDate = (metadata) => {
    const launch = metadata && metadata.launch;
    if (!launch) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 30);
        return fallback;
    }

    if (launch.mode === 'isoDate' && typeof launch.isoDate === 'string') {
        const d = new Date(launch.isoDate);
        if (!isNaN(d.getTime())) return d;
    }

    if (launch.mode === 'offsetDays') {
        const offsetDays = typeof launch.offsetDays === 'number' && isFinite(launch.offsetDays) ? launch.offsetDays : 30;
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d;
    }

    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 30);
    return fallback;
};

const initCountdown = (metadata) => {
    const launchDate = getLaunchDate(metadata);
    const countdownCfg = metadata && metadata.content && metadata.content.countdown;

    const updateTimer = () => {
        const now = new Date().getTime();
        const diff = launchDate.getTime() - now;

        const els = {
            d: document.getElementById('days'),
            h: document.getElementById('hours'),
            m: document.getElementById('minutes'),
            s: document.getElementById('seconds'),
            container: document.getElementById('countdown')
        };

        if (!els.d || !els.container) return;

        if (diff <= 0) {
            els.container.innerHTML = (countdownCfg && countdownCfg.openTextHtml) ? countdownCfg.openTextHtml : "<h3 class='text-white fw-bold'>FACILITY NOW OPEN</h3>";
            els.container.setAttribute('aria-label', (countdownCfg && countdownCfg.openAriaLabel) ? countdownCfg.openAriaLabel : 'The facility is now open');
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        els.d.innerText = d.toString().padStart(2, '0');
        els.h.innerText = h.toString().padStart(2, '0');
        els.m.innerText = m.toString().padStart(2, '0');
        els.s.innerText = s.toString().padStart(2, '0');

        const baseLabel = (countdownCfg && countdownCfg.ariaLabel) ? countdownCfg.ariaLabel : 'Time remaining until launch';
        if (s === 0 || els.container.getAttribute('aria-label') === baseLabel) {
            els.container.setAttribute('aria-label', `Launching in ${d} days, ${h} hours, and ${m} minutes`);
        }
    };

    setInterval(updateTimer, 1000);
    updateTimer();
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const metadata = await loadMetadata();
        applyHeadFromMetadata(metadata);
        renderBodyFromMetadata(metadata);
        initScrollReveal();
        initCountdown(metadata);
    } catch (err) {
        console.error(err);

        const heroTitle = document.getElementById('hero-title');
        const heroDesc = document.getElementById('hero-description');
        if (heroTitle) heroTitle.textContent = 'Content unavailable';
        if (heroDesc) heroDesc.textContent = 'metadata.js could not be loaded. Please ensure metadata.js is present and referenced by index.html.';

        initCountdown(null);
    }
});
