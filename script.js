document.addEventListener('DOMContentLoaded', () => {
  const embersContainer = document.getElementById('embers');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  const lightning = document.getElementById('lightning');
  const form = document.getElementById('contact-form');

  const API_BASE = window.API_BASE || (
    location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? ''
      : 'https://flexora-api.onrender.com'
  );
  console.log('[Oracle] API_BASE:', API_BASE);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createEmber() {
    if (!embersContainer || prefersReducedMotion) return;

    let count = 1;
    if (window.OracleFX?.currentState) {
      const rate = window.OracleFX.currentState.particleRate;
      count = Math.floor(rate) + (Math.random() < (rate % 1) ? 1 : 0);
      if (count === 0) return;
    }

    for (let i = 0; i < Math.min(count, 3); i++) {
      setTimeout(createSingleEmber, i * 25);
    }
  }

  function createSingleEmber() {
    if (!embersContainer) return;

    const ember = document.createElement('span');

    const size = Math.random() * 7 + 3;
    const drift = `${Math.random() * 240 - 120}px`;
    const duration = Math.random() * 10 + 9;
    const type = Math.random();
    const opacity = Math.random() * 0.7 + 0.35;

    ember.className = 'ember';

    if (type > 0.62) {
      ember.classList.add('magenta');
    } else if (type < 0.25) {
      ember.classList.add('ash');
    }

    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.setProperty('--drift', drift);
    ember.style.setProperty('--ember-opacity', opacity);
    ember.style.animationDuration = `${duration}s`;

    embersContainer.appendChild(ember);

    ember.addEventListener('animationend', () => {
      ember.remove();
    });
  }

  if (!prefersReducedMotion) {
    for (let i = 0; i < 35; i += 1) {
      setTimeout(createEmber, i * 90);
    }

    setInterval(createEmber, 70);
  }

  function closeMobileMenu() {
    if (!hamburger || !navMobile) return;

    hamburger.classList.remove('active');
    navMobile.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  hamburger?.addEventListener('click', () => {
    if (!navMobile) return;

    const isOpen = navMobile.classList.toggle('active');

    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
    if (!isOpen) hamburger.focus();
  });

  document.querySelectorAll('#nav-mobile a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
      hamburger.focus();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      hamburger.focus();
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach((element) => {
    revealObserver.observe(element);
  });

  lightning?.addEventListener('mouseenter', () => {
    lightning.style.animationDuration = '0.55s';
  });

  lightning?.addEventListener('mouseleave', () => {
    lightning.style.animationDuration = '3.5s';
  });

  // --- ORÁCULO DE ZEUS (Chat IA Cinematográfico) ---
  console.log('[Oracle] script loaded');
  const chatMessages = document.getElementById('chat-messages');
  const chatPlaceholder = document.getElementById('chat-placeholder');
  const questionInput = document.getElementById('user-question');
  const charCount = document.getElementById('char-count');
  const oracleActions = document.getElementById('oracle-actions');
  const clearButton = document.getElementById('clear-oracle');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const oracleSubmit = document.getElementById('oracle-submit');
  console.log('[Oracle] buttons found:', modeBtns.length);
  console.log('[Oracle] submit button:', oracleSubmit);

  const STORAGE_KEY = 'flexora_oracle_messages';
  const CONV_KEY = 'flexora_conversations';
  const ACTIVE_CONV_KEY = 'flexora_active_conversation';
  const MAX_MEMORY = 20;
  let currentModel = 'sabio';
  let isStreaming = false;
  let lastPrompt = '';

  // --- Message persistence (must be before conversation management) ---
  function getMessages() {
    let msgs;
    try { msgs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { msgs = []; }
    return msgs;
  }

  function saveMessages(msgs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MEMORY))); } catch {}
  }

  // --- Shared helpers (must be before conversation management) ---
  function formatTime(ts) {
    if (ts == null || ts === '') return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    chatMessages.parentElement.scrollTop = chatMessages.scrollHeight;
  }

  function hidePlaceholder() {
    if (chatPlaceholder) chatPlaceholder.style.display = 'none';
  }

  function showPlaceholder() {
    if (chatPlaceholder && chatMessages.children.length === 0) {
      chatPlaceholder.style.display = '';
    }
  }

  // --- Conversation management ---
  function getConversations() {
    try { return JSON.parse(localStorage.getItem(CONV_KEY)) || []; } catch { return []; }
  }

  function saveConversations(convs) {
    try { localStorage.setItem(CONV_KEY, JSON.stringify(convs)); } catch {}
  }

  function getActiveConvId() {
    return localStorage.getItem(ACTIVE_CONV_KEY);
  }

  function setActiveConvId(id) {
    if (id) localStorage.setItem(ACTIVE_CONV_KEY, id);
    else localStorage.removeItem(ACTIVE_CONV_KEY);
  }

  function generateConvTitle(messages) {
    const first = messages.find(m => m.role === 'user');
    if (!first) return 'Conversación';
    const words = first.content.trim().split(/\s+/).slice(0, 6).join(' ');
    return words.length > 60 ? words.substring(0, 60) + '…' : words;
  }

  function ensureActiveConversation() {
    let convs = getConversations();
    let activeId = getActiveConvId();
    let conv = convs.find(c => c.id === activeId);
    if (!conv) {
      conv = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: 'Nueva conversación',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      convs.unshift(conv);
      saveConversations(convs);
      setActiveConvId(conv.id);
    }
    return conv;
  }

  function syncMessagesToConversation() {
    const msgs = getMessages();
    const convs = getConversations();
    const activeId = getActiveConvId();
    const conv = convs.find(c => c.id === activeId);
    if (conv) {
      if (msgs.length > 0) conv.title = generateConvTitle(msgs);
      conv.updatedAt = Date.now();
      conv.messages = JSON.parse(JSON.stringify(msgs));
      saveConversations(convs);
    }
    updateConvList();
  }

  function saveAndStartNewConversation() {
    const msgs = getMessages();
    syncMessagesToConversation();
    chatMessages.innerHTML = '';
    if (msgs.length > 0) localStorage.removeItem(STORAGE_KEY);
    setActiveConvId(null);
    ensureActiveConversation();
    showPlaceholder();
    oracleActions.classList.add('is-hidden');
    isStreaming = false;
  }

  function loadConversation(convId) {
    const convs = getConversations();
    const conv = convs.find(c => c.id === convId);
    if (!conv) return;
    syncMessagesToConversation();
    saveMessages(conv.messages);
    chatMessages.innerHTML = '';
    setActiveConvId(conv.id);
    if (conv.messages.length === 0) {
      showPlaceholder();
      oracleActions.classList.add('is-hidden');
    } else {
      hidePlaceholder();
      conv.messages.forEach(m => {
        const el = createMessageElement(m.role, m.content, m.timestamp);
        chatMessages.appendChild(el);
      });
      scrollToBottom();
      oracleActions.classList.remove('is-hidden');
    }
    toggleConvPanel(false);
  }

  function deleteConversation(convId) {
    let convs = getConversations();
    const idx = convs.findIndex(c => c.id === convId);
    if (idx === -1) return;
    convs.splice(idx, 1);
    saveConversations(convs);
    if (getActiveConvId() === convId) {
      setActiveConvId(null);
      if (getMessages().length > 0) {
        chatMessages.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY);
        showPlaceholder();
        oracleActions.classList.add('is-hidden');
      }
      ensureActiveConversation();
    }
    updateConvList();
  }

  function toggleConvPanel(show) {
    const panel = document.getElementById('conversations-panel');
    if (!panel) return;
    if (show === undefined) panel.classList.toggle('visible');
    else if (show) panel.classList.add('visible');
    else panel.classList.remove('visible');
    if (panel.classList.contains('visible')) updateConvList();
  }

  function updateConvList() {
    const list = document.getElementById('conversation-list');
    if (!list) return;
    const convs = getConversations();
    const activeId = getActiveConvId();
    list.innerHTML = '';
    if (convs.length === 0) {
      list.innerHTML = '<div class="conv-empty">Aún no hay pergaminos guardados</div>';
      return;
    }
    convs.forEach(conv => {
      const item = document.createElement('div');
      item.className = 'conv-item' + (conv.id === activeId ? ' active' : '');
      const info = document.createElement('div');
      info.className = 'conv-info';
      info.onclick = () => loadConversation(conv.id);
      const title = document.createElement('div');
      title.className = 'conv-title';
      title.textContent = conv.title;
      const meta = document.createElement('div');
      meta.className = 'conv-meta';
      meta.textContent = formatTime(conv.updatedAt) + ' · ' + conv.messages.length + ' mensajes';
      info.appendChild(title);
      info.appendChild(meta);
      const del = document.createElement('button');
      del.className = 'conv-delete';
      del.textContent = '✕';
      del.title = 'Eliminar pergamino';
      del.onclick = e => { e.stopPropagation(); deleteConversation(conv.id); };
      item.appendChild(info);
      item.appendChild(del);
      list.appendChild(item);
    });
  }

  // --- Guard: abort if required elements are missing ---
  if (!chatMessages || !questionInput || !oracleSubmit) {
    console.warn('[Oracle] Elementos críticos faltan — Oráculo desactivado');
  } else {

  // --- Helper functions ---
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return text.replace(/[&<>"]/g, c => map[c]);
  }

  function decodeHtmlEntitiesForCode(code) {
    return code
      .replace(/&amp;lt;/g, '<')
      .replace(/&amp;gt;/g, '>')
      .replace(/&amp;quot;/g, '"')
      .replace(/&amp;amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }

  // --- Intent & Emotion Detection ---
  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/\b(code|function|error|bug|syntax|server|api|npm|git|html|css|js|javascript|react|angular|vue|node|deno|typescript|python|java|rust|go|install|config|debug|terminal|bash|script|type|class|import|export|async|await|fetch|route|endpoint|database|sql|query|docker|deploy|build|test|unit|framework|librar|dependenc|version|compil|runtime|memory|perform|optimiz|refactor|algorith|dat. structur|complexity|oop|functional|pattern|callback|promise|observable|http|https|websocket|rest|graphql|middleware|handler|event|emit|subscribe|unsubscribe)\b/.test(t)) return 'technical';
    if (/\b(meaning|life|why|purpose|universe|exist|death|soul|truth|reality|conscious|destiny|fate|god|faith|belief|wisdom|knowledge|time|space|infinity|eternal|essence|mortal|divine|cosmos|nature|human|mind|thought|perception|free will|determinism|chaos|order|balance|duality|paradox|enigma|mystery|transcend)\b/.test(t)) return 'philosophical';
    if (/\b(write|create|design|imagine|story|poem|compose|draw|art|music|song|invent|build|make|craft|generat|painting|novel|character|world|idea|concept|vision|aesthetic|beauty|express|emotion|feeling|drama|scene|plot|twist|fantasy|sci.fi|dystopia|utopia|myth|legend|epic|saga|tale|narrative|metaphor|symbol)\b/.test(t)) return 'creative';
    if (/\b(inspire|motivat|strength|overcome|power|determin|courage|persever|keep going|never give up|believe|achieve|dream|purpose|potential|greatness|rise|warrior|fight|victory|conquer|resilien|discipline|willpower|ambition|drive|focus|breakthrough|transform|evolve|grow|surpass|excel|dominate|master|legend)\b/.test(t)) return 'motivational';
    if (/\b(joke|funny|lol|humor|laugh|haha|hilarious|comedy|wit|amusing|silly|ridiculous|absurd|irony|satire|parody|meme|rofl|lmao|chiste|gracia|divertido|cómic)\b/.test(t)) return 'humoristic';
    if (/\b(hello|hi|hey|how are you|what's up|sup|good morning|good evening|greeting|hola|hey there|yo|wassup|howdy|saludos|qué tal|buenas)\b/.test(t)) return 'casual';
    return 'general';
  }

  function detectEmotion(text) {
    const t = text.toLowerCase();
    if (/\b(curious|wonder|learn|understand|how does|tell me about|explain|what is|how to|why does|meaning of|difference between|compared to|vs |versus|define|elaborate|clarify|break down|in simple terms|concept|theory|principle|fundamental|basics)\b/.test(t)) return 'curious';
    if (/\b(urgent|quick|fast|now|hurry|asap|emergency|immediate|critical|crucial|rapid|speed|rush|instant|deadline|ASAP|hurry up|right now|no time)\b/.test(t)) return 'urgent';
    if (/\b(frustrat|annoy|angry|pissed|hate|stupid|damn|hell|not working|broken|useless|terrible|awful|horrible|disaster|fail|fail|sucks|crap|bs|wtf|wth|cannot|can't|won't|doesn't work|not work|error|bug|issue|problem|wrong|bad|worst)\b/.test(t)) return 'frustrated';
    if (/\b(amazing|awesome|cool|great|fantastic|excellent|wonderful|incredible|love|exciting|fun|brilliant|perfect|beautiful|magnificent|gorgeous|stunning|splendid|marvelous|phenomenal|extraordinary|remarkable|outstanding|superb|impressive|mind.blowing|epic|legendary|genius|masterpiece)\b/.test(t)) return 'excited';
    if (/\b(sad|depress|lonely|tired|exhaust|burnout|heart|break|cry|sorry|regret|miss|lost|alone|pain|suffer|struggl|hard|difficult|tough|heavy|weary|hopeless|helpless|empty|numb|grief|mourn|dark|shadow|broken|hurt|wound|scar|fatigue|drain|spent|defeat|defeated|down|low|melancholy|nostalgia|bittersweet)\b/.test(t)) return 'sad';
    return 'neutral';
  }

  // --- Syntax highlight ---
  function highlightCode(code, lang) {
    let h = code;
    const l = (lang || '').toLowerCase();
    h = h.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$&</span>');
    if (l === 'js' || l === 'javascript') {
      h = h
        .replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hljs-string">$&</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch|throw|new|delete|typeof|instanceof|this|super|yield|in|of|from|as|true|false|null|undefined|NaN|Infinity)\b/g, '<span class="hljs-keyword">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');
    } else if (l === 'html') {
      h = h.replace(/(&lt;)(\/?)([\s\S]*?)(&gt;)/g, (_, lt, slash, inner, gt) => {
        const hlInner = inner.replace(/([\w-]+)(=)("(?:[^"]|\\")*")/g, '<span class="hljs-attr">$1</span>$2<span class="hljs-string">$3</span>');
        return lt + slash + '<span class="hljs-tag">' + hlInner + '</span>' + gt;
      });
    } else if (l === 'css') {
      h = h
        .replace(/([\w-]+)(\s*:)/g, '<span class="hljs-property">$1</span>$2')
        .replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|\b\d+(?:px|rem|em|%|vh|vw|s|ms)?\b)/g, '<span class="hljs-number">$1</span>')
        .replace(/\.([\w-]+)/g, '<span class="hljs-selector">.$1</span>');
    } else if (l === 'json') {
      h = h
        .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="hljs-attr">$1</span>$2')
        .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="hljs-string">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="hljs-literal">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');
    } else if (l === 'bash' || l === 'sh') {
      h = h
        .replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hljs-string">$&</span>')
        .replace(/\b(npm|node|cd|ls|echo|cat|grep|curl|wget|git|pip|install|run|build|dev|start|mkdir|rm|cp|mv|chmod|sudo|yarn|pnpm)\b/g, '<span class="hljs-built_in">$1</span>');
    }
    return h;
  }

  // --- Markdown renderer ---
  function renderMarkdown(text) {
    const codeBlocks = [];
    let h = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const idx = codeBlocks.length;
      const decoded = decodeHtmlEntitiesForCode(code);
      const escaped = escapeHtml(decoded);
      const highlighted = highlightCode(escaped, lang);
      const langLabel = lang ? `<span class="code-lang-label">${escapeHtml(lang)}</span>` : '';
      codeBlocks.push(`<div class="code-block-wrapper">${langLabel}<pre><code>${highlighted}</code></pre></div>`);
      return `%%CODE_${idx}%%`;
    });

    h = escapeHtml(h);

    h = h.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    h = h.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    h = h.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    h = h.replace(/^- (.+)$/gm, '<li>$1</li>');

    h = h.replace(/%%CODE_(\d+)%%/g, (_, id) => codeBlocks[parseInt(id)] || '');
    h = h.replace(/\n/g, '<br>');
    return h;
  }

  function loadMessages() {
    let activeId = getActiveConvId();
    let convs = getConversations();
    // Migrate legacy storage if no active conversation exists
    if (!activeId || !convs.find(c => c.id === activeId)) {
      let legacy;
      try { legacy = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { legacy = []; }
      if (legacy.length > 0) {
        const conv = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          title: generateConvTitle(legacy),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: legacy,
        };
        convs.unshift(conv);
        saveConversations(convs);
        setActiveConvId(conv.id);
      }
    }
    const conv = convs.find(c => c.id === getActiveConvId());
    if (!conv || conv.messages.length === 0) return;
    // Sync STORAGE_KEY to the loaded conversation so getMessages() returns correct history
    saveMessages(conv.messages);
    hidePlaceholder();
    conv.messages.forEach(m => {
      const el = createMessageElement(m.role, m.content, m.timestamp);
      chatMessages.appendChild(el);
    });
    scrollToBottom();
    oracleActions.classList.remove('is-hidden');
    const sb = document.getElementById('oracle-submit');
    if (sb) { sb.removeAttribute('disabled'); sb.textContent = 'Invocar ⚡'; }
    questionInput?.removeAttribute('disabled');
    charCount?.classList.remove('text-red-400');
    // Sync legacy storage for backward compat
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conv.messages.slice(-MAX_MEMORY))); } catch {}
  }

  // --- Clear chat / New conversation ---
  clearButton?.addEventListener('click', () => {
    saveAndStartNewConversation();
  });

  // --- Create message element ---
  function createMessageElement(role, content, timestamp, isError) {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${isError ? 'error' : role}`;
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    if (role === 'assistant' || isError) {
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" class="avatar-icon"><polygon points="13,2 4,13 12,13 11,22 20,11 12,11"/></svg>';
    } else {
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" class="avatar-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    }
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-content';
    if (content) contentDiv.innerHTML = renderMarkdown(content);
    bubble.appendChild(contentDiv);
    if (timestamp) {
      const time = document.createElement('span');
      time.className = 'chat-timestamp';
      time.textContent = formatTime(timestamp);
      bubble.appendChild(time);
    }
    msgEl.appendChild(avatar);
    msgEl.appendChild(bubble);
    return msgEl;
  }

  // --- Add message to DOM + persistence ---
  function addMessage(role, content, timestamp) {
    const ts = timestamp || Date.now();
    const el = createMessageElement(role, content, ts);
    chatMessages.appendChild(el);
    hidePlaceholder();
    scrollToBottom();
    const msgs = getMessages();
    msgs.push({ role, content, timestamp: ts });
    saveMessages(msgs);
    oracleActions.classList.remove('is-hidden');
    return el;
  }

  // --- Streaming assistant message ---
  function createStreamingMessage() {
    const ts = Date.now();
    const el = createMessageElement('assistant', '', ts);
    chatMessages.appendChild(el);
    scrollToBottom();
    const contentDiv = el.querySelector('.chat-content');
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    contentDiv.appendChild(cursor);
    return { el, contentDiv, cursor, ts };
  }

  function updateStreaming(contentDiv, cursor, text, done) {
    contentDiv.innerHTML = renderMarkdown(text);
    if (!done) { contentDiv.appendChild(cursor); scrollToBottom(); return; }
    const now = Date.now();
    const el = contentDiv.closest('.chat-message');
    if (el) {
      const tsEl = el.querySelector('.chat-timestamp');
      if (tsEl) tsEl.textContent = formatTime(now);
    }
    const msgs = getMessages();
    msgs.push({ role: 'assistant', content: text, timestamp: now });
    saveMessages(msgs);
    syncMessagesToConversation();
    scrollToBottom();
  }

  // --- Spinner (loading state) ---
  function showSpinner(contentDiv) {
    contentDiv.innerHTML = '<div class="chat-spinner" aria-hidden="true"><span></span><span></span><span></span></div>';
  }

  // --- Mode selector ---
  modeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isStreaming) return;
      modeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentModel = btn.dataset.mode;
      console.log('[Oracle] selected model:', currentModel);
    });
  });

  // --- Character counter ---
  function updateCharCount() {
    const len = questionInput.value.length;
    charCount.textContent = `${len}/2000`;
    charCount.style.color = len > 1900 ? '#ff6b6b' : len > 1500 ? '#ffd700' : 'rgba(223, 250, 255, 0.35)';
  }
  questionInput?.addEventListener('input', updateCharCount);

  // --- Field shake ---
  function shakeField() {
    questionInput.classList.add('oracle-field-error');
    setTimeout(() => questionInput.classList.remove('oracle-field-error'), 800);
  }

  // --- Oracle submit logic ---
  async function submitOracle() {
    if (isStreaming) return;
    const question = questionInput.value.trim();
    if (!question) { shakeField(); return; }
    lastPrompt = question;

    const submitBtn = document.getElementById('oracle-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Consultando... 🌩️";
    isStreaming = true;

    ensureActiveConversation();
    addMessage('user', question);
    const { contentDiv, cursor } = createStreamingMessage();
    showSpinner(contentDiv);
    scrollToBottom();

    const controller = new AbortController();
    const TIMEOUT_MS = 45000;
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const intent = detectIntent(question);
      const emotion = detectEmotion(question);
      console.log(`[Oracle] detected intent: ${intent}`);
      if (emotion !== 'neutral') console.log(`[Oracle] emotional tone: ${emotion}`);
      const fxState = window.OracleFX.getState(emotion, intent);
      window.OracleFX.apply(fxState);

      const allMessages = getMessages();
      const recentMessages = allMessages.slice(-4);
      console.log(`[Oracle] context optimizado → ${recentMessages.length} msgs (de ${allMessages.length})`);
      const history = recentMessages.map(m => ({ role: m.role, content: m.content.slice(-1500) }));
      const res = await fetch(`${API_BASE}/api/oracle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: question, messages: history, model: currentModel, intent, emotion }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido del oráculo' }));
        throw new Error(err.error || `Error ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      contentDiv.innerHTML = '';
      contentDiv.appendChild(cursor);
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
          updateStreaming(contentDiv, cursor, fullResponse, false);
        }
      } catch (streamErr) {
        if (streamErr.name === 'AbortError') throw streamErr;
        console.error('[Oracle] stream read error:', streamErr);
        fullResponse += '\n[Error al leer la respuesta del Oráculo]';
      }
      updateStreaming(contentDiv, cursor, fullResponse, true);
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === 'AbortError';
      console.error('[Oracle] error:', isTimeout ? 'Timeout 45s' : error.message);
      let message;
      if (isTimeout) {
        message = 'El Oráculo tardó demasiado en responder (45s). Intenta con una pregunta más corta o cambia de modo.';
      } else if (error instanceof TypeError && (!error.message || error.message.includes('fetch'))) {
        message = 'El Olimpo est\u00e1 fuera de l\u00ednea. Revisa tu conexi\u00f3n o vuelve a intentarlo.';
      } else if (error.message && error.message.includes('401')) {
        message = 'La API key de OpenRouter no es v\u00e1lida o no est\u00e1 configurada. Revisa <code>server/.env</code>.';
      } else {
        message = error.message || 'El rayo de Zeus ha fallado. Intenta de nuevo.';
      }
      const errEl = createMessageElement('assistant', message, Date.now(), true);
      if (contentDiv && contentDiv.closest('.chat-message')) {
        chatMessages.removeChild(contentDiv.closest('.chat-message'));
      }
      chatMessages.appendChild(errEl);
      scrollToBottom();
      oracleActions.classList.remove('is-hidden');
    } finally {
      clearTimeout(timeoutId);
      window.OracleFX.relax();
      const sb = document.getElementById('oracle-submit');
      if (sb) { sb.disabled = false; sb.innerHTML = "Invocar \u26A1"; }
      questionInput.value = "";
      if (charCount) { charCount.textContent = '0/2000'; charCount.style.color = 'rgba(223, 250, 255, 0.35)'; }
      isStreaming = false;
    }
  }

  // --- Form submit ---
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[Oracle] invoke clicked');
    submitOracle();
  });

  // --- Load messages on startup ---
  loadMessages();

  // --- Pergaminos panel events ---
  const toggleConvBtn = document.getElementById('toggle-conversations');
  toggleConvBtn?.addEventListener('click', () => toggleConvPanel());

  const closeConvBtn = document.getElementById('close-conv-panel');
  closeConvBtn?.addEventListener('click', () => toggleConvPanel(false));

  document.addEventListener('click', (e) => {
    const panel = document.getElementById('conversations-panel');
    if (!panel || !panel.classList.contains('visible')) return;
    if (!e.target.closest('#conversations-panel') && !e.target.closest('#toggle-conversations')) {
      toggleConvPanel(false);
    }
  });

  // --- OracleFX: Visual Reactive Engine ---
  window.OracleFX = window.OracleFX || {
    currentState: null,
    currentIntensity: 0,
    relaxTimer: null,
    auraEl: null,

    profiles: {
      technical:   { glowColor: '#00f5ff', auraColor: 'rgba(0,245,255,0.08)', glowIntensity: 0.6, particleRate: 0.8, animationSpeed: 0.8, lightningSpeed: 2.5 },
      philosophical: { glowColor: '#ffd700', auraColor: 'rgba(168,85,247,0.06)', glowIntensity: 0.7, particleRate: 0.6, animationSpeed: 1.2, lightningSpeed: 4 },
      motivational: { glowColor: '#ff6b35', auraColor: 'rgba(255,107,53,0.08)', glowIntensity: 0.9, particleRate: 1.5, animationSpeed: 0.6, lightningSpeed: 1.5 },
      creative:    { glowColor: '#ff00ff', auraColor: 'rgba(236,72,153,0.07)', glowIntensity: 0.8, particleRate: 1.2, animationSpeed: 0.9, lightningSpeed: 2 },
      urgent:      { glowColor: '#ff3333', auraColor: 'rgba(255,51,51,0.08)', glowIntensity: 1.0, particleRate: 2, animationSpeed: 0.4, lightningSpeed: 0.8 },
      sad:         { glowColor: '#6366f1', auraColor: 'rgba(99,102,241,0.05)', glowIntensity: 0.3, particleRate: 0.3, animationSpeed: 1.5, lightningSpeed: 6 },
      excited:     { glowColor: '#ffd700', auraColor: 'rgba(255,215,0,0.1)', glowIntensity: 1.0, particleRate: 1.8, animationSpeed: 0.5, lightningSpeed: 1.2 },
      neutral:     { glowColor: '#ffd700', auraColor: 'rgba(255,215,0,0.04)', glowIntensity: 0.4, particleRate: 1, animationSpeed: 1, lightningSpeed: 3.5 },
    },

    getState(emotion, intent) {
      if (emotion && emotion !== 'neutral' && this.profiles[emotion]) return this.profiles[emotion];
      if (intent && this.profiles[intent]) return this.profiles[intent];
      return this.profiles.neutral;
    },

    init() {
      if (prefersReducedMotion) return;
      if (this.auraEl) return;
      const container = document.querySelector('.oracle-container');
      if (!container) return;
      this.auraEl = document.createElement('div');
      this.auraEl.className = 'ambient-aura';
      this.auraEl.setAttribute('aria-hidden', 'true');
      container.insertBefore(this.auraEl, container.firstChild);
      console.log('[OracleFX] visual engine initialized');
    },

    apply(state) {
      if (!state || prefersReducedMotion) return;
      if (this.relaxTimer) { cancelAnimationFrame(this.relaxTimer); this.relaxTimer = null; }

      this.currentState = state;
      this.currentIntensity = 1;

      const root = document.documentElement;
      root.style.setProperty('--oracle-glow-color', state.glowColor);
      root.style.setProperty('--oracle-glow-intensity', state.glowIntensity);
      root.style.setProperty('--oracle-animation-speed', `${state.animationSpeed}s`);
      root.style.setProperty('--oracle-lightning-speed', `${state.lightningSpeed}s`);
      root.style.setProperty('--oracle-aura-opacity', Math.min(state.glowIntensity + 0.2, 1));
      root.style.setProperty('--oracle-aura-color', state.auraColor);
      document.body.dataset.oracleState = state === this.profiles.neutral ? '' : Object.keys(this.profiles).find(k => this.profiles[k] === state) || '';
      if (state === this.profiles.neutral) document.body.removeAttribute('data-oracle-state');

      if (lightning) lightning.style.animationDuration = `${state.lightningSpeed}s`;

      console.log(`[OracleFX] emotional state loaded → ${document.body.dataset.oracleState || 'neutral'}`);
      console.log(`[OracleFX] visual profile active → glow: ${state.glowColor}, intensity: ${state.glowIntensity}`);
    },

    relax() {
      if (prefersReducedMotion) return;
      const duration = 4000;
      const startTime = performance.now();
      const startIntensity = this.currentIntensity;
      const root = document.documentElement;

      const step = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const i = startIntensity * (1 - ease);

        root.style.setProperty('--oracle-glow-intensity', i * 0.4);
        root.style.setProperty('--oracle-aura-opacity', i * 0.4);
        root.style.setProperty('--oracle-animation-speed', `${1 + ease * 0.5}s`);

        if (progress < 1) {
          this.relaxTimer = requestAnimationFrame(step);
        } else {
          this.relaxTimer = null;
          this.currentState = null;
          this.currentIntensity = 0;
          document.body.removeAttribute('data-oracle-state');
          root.style.setProperty('--oracle-glow-intensity', '0');
          root.style.setProperty('--oracle-aura-opacity', '0');
          root.style.setProperty('--oracle-lightning-speed', '3.5s');
          if (lightning) lightning.style.animationDuration = '3.5s';
          console.log('[OracleFX] transition complete');
        }
      };

      this.relaxTimer = requestAnimationFrame(step);
    },
  };

  window.OracleFX.init();
  } // end Oracle guard

  // --- SCROLL SPY ---
  const spySections = document.querySelectorAll('section[id]');
  const spyLinks = document.querySelectorAll('.nav-link, .mobile-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    let current = null;

    spySections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (scrollY >= rect.top + window.scrollY) {
        current = section.id;
      }
    });

    spyLinks.forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    if (current) {
      document.querySelectorAll(`[href="#${current}"]`).forEach((link) => {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // --- AÑO DINÁMICO ---
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // --- SERVICE WORKER (PWA) ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err.message);
    });
  }
});