/**
 * forge-assistant.js
 * ==================
 * ForgeCAD AI Measurement Assistant — Phase 2
 *
 * Self-contained overlay injected into the ForgeCAD studio (localhost:5173).
 * Communicates with the Capstone harness API at localhost:8000.
 *
 * Flow:
 *  1. Floating FAB appears bottom-right of ForgeCAD UI
 *  2. Click → sliding panel from right
 *  3. Chat clarifies measurements one at a time
 *  4. "Generate Design" → Temporal workflow → .forge.js written to project dir
 *  5. ForgeCAD file watcher fires → 3D viewport updates live
 */

(function() {
  'use strict';

  var API = (document.currentScript && document.currentScript.getAttribute('data-forge-api'))
    || 'http://localhost:8000';

  // ── Prevent double-injection ─────────────────────────────────────────────
  if (document.getElementById('fa-panel')) return;

  // ── State ────────────────────────────────────────────────────────────────
  var state = {
    sessionId: null,
    isReady: false,
    resolvedParams: {},
    projectDir: null,
    projectId: null,
    workflowId: null,
    pollTimer: null,
    generating: false,
    panelOpen: false,
  };

  // ── CSS ──────────────────────────────────────────────────────────────────
  var CSS = `
:root {
  --fa-bg: rgba(8,12,24,0.97);
  --fa-surface: rgba(15,22,38,0.98);
  --fa-surface2: rgba(20,29,46,0.95);
  --fa-border: rgba(255,255,255,0.07);
  --fa-border2: rgba(255,255,255,0.12);
  --fa-accent: #6366f1;
  --fa-accent2: #8b5cf6;
  --fa-green: #10b981;
  --fa-amber: #f59e0b;
  --fa-red: #ef4444;
  --fa-text: #e2e8f0;
  --fa-text2: #94a3b8;
  --fa-muted: #4b5e7a;
  --fa-radius: 12px;
  --fa-t: 0.28s cubic-bezier(.4,0,.2,1);
}

/* FAB */
#fa-fab {
  position: fixed; right: 22px; bottom: 22px; z-index: 99999;
  width: 50px; height: 50px; border-radius: 50%;
  background: linear-gradient(135deg, var(--fa-accent), var(--fa-accent2));
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 21px;
  box-shadow: 0 4px 20px rgba(99,102,241,.45);
  transition: transform var(--fa-t), box-shadow var(--fa-t);
  font-family: system-ui, sans-serif;
}
#fa-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(99,102,241,.65); }
#fa-fab.open { transform: rotate(45deg) scale(0.95); }
#fa-fab::after {
  content: ''; position: absolute; inset: -5px; border-radius: 50%;
  border: 2px solid var(--fa-accent); opacity: 0;
  animation: faRing 3.5s ease-in-out infinite;
}
@keyframes faRing {
  0%,100%{transform:scale(1);opacity:.35} 50%{transform:scale(1.22);opacity:0}
}
#fa-notif {
  position: absolute; top: 5px; right: 5px;
  width: 11px; height: 11px; border-radius: 50%;
  background: var(--fa-green); border: 2px solid #080c18;
  display: none;
}
#fa-fab.has-notif #fa-notif { display: block; }

/* Panel */
#fa-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 390px;
  background: var(--fa-bg);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--fa-border);
  transform: translateX(100%);
  transition: transform 0.36s cubic-bezier(.4,0,.2,1), box-shadow 0.36s;
  display: flex; flex-direction: column; z-index: 99998;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 13px; color: var(--fa-text);
  box-shadow: none;
}
#fa-panel.open {
  transform: translateX(0);
  box-shadow: -12px 0 48px rgba(0,0,0,.7);
}

/* Header */
#fa-header {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--fa-border);
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-shrink: 0;
  background: var(--fa-surface);
}
.fa-header-left { display: flex; flex-direction: column; gap: 3px; }
.fa-title {
  font-size: 14px; font-weight: 600; color: #c4b5fd;
  display: flex; align-items: center; gap: 8px;
}
.fa-badge {
  font-size: 9px; padding: 2px 7px; border-radius: 10px;
  background: rgba(99,102,241,.2); color: #a5b4fc;
  font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
}
.fa-sub { font-size: 11px; color: var(--fa-muted); }

/* Project pill */
#fa-project-pill {
  display: none;
  margin: 10px 14px 0;
  background: rgba(16,185,129,.07);
  border: 1px solid rgba(16,185,129,.18);
  border-radius: 8px;
  padding: 8px 12px;
  flex-shrink: 0;
}
#fa-project-pill.visible { display: flex; align-items: center; gap: 8px; }
.fa-proj-icon { font-size: 14px; }
.fa-proj-info { flex: 1; min-width: 0; }
.fa-proj-name { font-size: 12px; font-weight: 600; color: var(--fa-green); }
.fa-proj-path { font-size: 10px; color: var(--fa-muted); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Params strip */
#fa-params {
  display: none;
  padding: 8px 14px;
  background: rgba(16,185,129,.05);
  border-bottom: 1px solid rgba(16,185,129,.1);
  flex-shrink: 0;
}
#fa-params.visible { display: block; }
.fa-params-title { font-size: 9px; color: var(--fa-green); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
.fa-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.fa-chip {
  font-size: 10px; padding: 2px 8px; border-radius: 10px;
  background: rgba(16,185,129,.1); color: var(--fa-green);
  border: 1px solid rgba(16,185,129,.2);
  font-family: 'JetBrains Mono', 'Fira Mono', monospace;
}

/* Body */
#fa-body {
  flex: 1; overflow-y: auto; padding: 14px 12px;
  display: flex; flex-direction: column; gap: 10px;
}
#fa-body::-webkit-scrollbar { width: 3px; }
#fa-body::-webkit-scrollbar-thumb { background: var(--fa-border2); border-radius: 2px; }

/* Messages */
.fa-msg { display: flex; flex-direction: column; gap: 3px; max-width: 90%; }
.fa-msg.user { align-self: flex-end; }
.fa-msg.assistant { align-self: flex-start; }
.fa-bubble {
  padding: 10px 13px; border-radius: 14px;
  font-size: 13px; line-height: 1.55; word-break: break-word;
}
.fa-msg.user .fa-bubble {
  background: linear-gradient(135deg, var(--fa-accent), var(--fa-accent2));
  color: #fff; border-bottom-right-radius: 4px;
}
.fa-msg.assistant .fa-bubble {
  background: var(--fa-surface2); border: 1px solid var(--fa-border);
  color: var(--fa-text); border-bottom-left-radius: 4px;
}
.fa-time { font-size: 9px; color: var(--fa-muted); padding: 0 3px; }
.fa-msg.user .fa-time { text-align: right; }

/* Typing */
#fa-typing { align-self: flex-start; }
.fa-typing-bubble {
  padding: 10px 14px;
  background: var(--fa-surface2); border: 1px solid var(--fa-border);
  border-radius: 14px; border-bottom-left-radius: 4px;
}
.fa-dots { display: flex; gap: 5px; align-items: center; }
.fa-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--fa-muted);
  animation: faBounce 1.2s ease-in-out infinite;
}
.fa-dots span:nth-child(2) { animation-delay: .2s; }
.fa-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes faBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

/* Suggestions */
#fa-suggestions {
  padding: 2px 12px 8px; display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0;
}
.fa-sugg {
  font-size: 11px; padding: 4px 10px; border-radius: 14px;
  background: var(--fa-surface2); border: 1px solid var(--fa-border);
  color: var(--fa-text2); cursor: pointer; transition: var(--fa-t);
  font-family: system-ui, sans-serif;
}
.fa-sugg:hover { border-color: var(--fa-accent); color: var(--fa-accent); }

/* Ready banner */
#fa-ready {
  display: none;
  margin: 0 12px;
  background: rgba(16,185,129,.07);
  border: 1px solid rgba(16,185,129,.2);
  border-radius: var(--fa-radius);
  padding: 12px 14px;
  gap: 10px; align-items: center; flex-shrink: 0;
}
#fa-ready.visible { display: flex; }
.fa-ready-icon { font-size: 18px; flex-shrink: 0; }
.fa-ready-text { flex: 1; color: var(--fa-green); line-height: 1.4; }
#fa-generate-btn {
  background: var(--fa-green); color: #000; border: none;
  padding: 7px 14px; border-radius: 8px; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: var(--fa-t); white-space: nowrap;
  flex-shrink: 0;
}
#fa-generate-btn:hover { filter: brightness(1.1); }
#fa-generate-btn:disabled { opacity: .5; cursor: not-allowed; filter: none; }

/* Progress */
#fa-progress {
  display: none; margin: 0 12px;
  background: var(--fa-surface2); border: 1px solid var(--fa-border);
  border-radius: var(--fa-radius); padding: 14px; flex-shrink: 0;
}
#fa-progress.visible { display: block; }
.fa-prog-title { font-size: 11px; color: var(--fa-text2); margin-bottom: 10px; display: flex; justify-content: space-between; }
.fa-stage-row { display: flex; gap: 6px; flex-wrap: wrap; }
.fa-stage-chip {
  font-size: 10px; padding: 3px 8px; border-radius: 10px;
  background: var(--fa-surface); border: 1px solid var(--fa-border);
  color: var(--fa-muted);
  transition: var(--fa-t);
}
.fa-stage-chip.done { background: rgba(16,185,129,.12); color: var(--fa-green); border-color: rgba(16,185,129,.25); }
.fa-stage-chip.active { background: rgba(99,102,241,.15); color: #a5b4fc; border-color: var(--fa-accent); animation: faChipPulse 2s infinite; }
.fa-stage-chip.error { background: rgba(239,68,68,.12); color: var(--fa-red); border-color: rgba(239,68,68,.25); }
@keyframes faChipPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
#fa-prog-msg { font-size: 11px; color: var(--fa-text2); margin-top: 8px; }

/* Success banner */
#fa-done {
  display: none; margin: 0 12px;
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25);
  border-radius: var(--fa-radius); padding: 14px; flex-shrink: 0;
}
#fa-done.visible { display: block; }
#fa-done .fa-done-title { font-size: 13px; font-weight: 600; color: var(--fa-green); margin-bottom: 4px; }
#fa-done .fa-done-sub { font-size: 11px; color: var(--fa-text2); }
#fa-done .fa-done-file { font-size: 10px; color: var(--fa-muted); font-family: monospace; margin-top: 6px; }

/* Close button */
#fa-close {
  background: none; border: none; color: var(--fa-muted); cursor: pointer;
  font-size: 17px; padding: 2px; line-height: 1; transition: color var(--fa-t);
}
#fa-close:hover { color: var(--fa-text); }

/* Input */
#fa-input-row {
  padding: 10px 12px 14px;
  border-top: 1px solid var(--fa-border);
  display: flex; gap: 7px; align-items: flex-end; flex-shrink: 0;
  background: var(--fa-surface);
}
#fa-input {
  flex: 1; background: rgba(0,0,0,.2);
  border: 1px solid var(--fa-border2); border-radius: 12px;
  padding: 9px 14px; color: var(--fa-text); font-size: 13px;
  outline: none; resize: none; min-height: 38px; max-height: 96px;
  font-family: system-ui, -apple-system, sans-serif; line-height: 1.4;
  transition: border-color var(--fa-t);
}
#fa-input:focus { border-color: rgba(99,102,241,.5); }
#fa-send {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--fa-accent); border: none; color: #fff; cursor: pointer;
  flex-shrink: 0; font-size: 15px; transition: var(--fa-t);
  display: flex; align-items: center; justify-content: center;
}
#fa-send:hover { background: var(--fa-accent2); }
#fa-send:disabled { opacity: .4; cursor: not-allowed; }
`;

  // ── Inject CSS ───────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.id = 'fa-styles';
  style.textContent = CSS;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────────────
  var fab = document.createElement('button');
  fab.id = 'fa-fab';
  fab.title = 'AI Measurement Assistant';
  fab.innerHTML = '<span id="fa-fab-icon">🤖</span><span id="fa-notif"></span>';

  var panel = document.createElement('div');
  panel.id = 'fa-panel';
  panel.innerHTML = `
    <div id="fa-header">
      <div class="fa-header-left">
        <div class="fa-title">🔬 Measurement Assistant <span class="fa-badge">AI</span></div>
        <div class="fa-sub">Clarifies dimensions before CAD generation</div>
      </div>
      <button id="fa-close">✕</button>
    </div>
    <div id="fa-project-pill">
      <span class="fa-proj-icon">📁</span>
      <div class="fa-proj-info">
        <div class="fa-proj-name" id="fa-proj-name">—</div>
        <div class="fa-proj-path" id="fa-proj-path">—</div>
      </div>
    </div>
    <div id="fa-params">
      <div class="fa-params-title">✓ Captured measurements</div>
      <div class="fa-chips" id="fa-params-list"></div>
    </div>
    <div id="fa-body">
      <div class="fa-msg assistant">
        <div class="fa-bubble">
          👋 Hi! I'm your <strong>measurement assistant</strong>.<br><br>
          Tell me what part you want to design and I'll ask the right questions to nail down every dimension — then generate it directly in ForgeCAD.
        </div>
        <div class="fa-time">Just now</div>
      </div>
    </div>
    <div id="fa-suggestions">
      <button class="fa-sugg" data-msg="A mounting plate">Mounting plate</button>
      <button class="fa-sugg" data-msg="A pipe bracket">Pipe bracket</button>
      <button class="fa-sugg" data-msg="An enclosure box">Enclosure box</button>
      <button class="fa-sugg" data-msg="A gear">Gear</button>
      <button class="fa-sugg" data-msg="A shaft collar">Shaft collar</button>
    </div>
    <div id="fa-ready">
      <span class="fa-ready-icon">✅</span>
      <span class="fa-ready-text">All measurements captured!<br>Ready to generate your part.</span>
      <button id="fa-generate-btn">Generate ✦</button>
    </div>
    <div id="fa-progress">
      <div class="fa-prog-title">
        <span>Generating…</span>
        <span id="fa-prog-stage"></span>
      </div>
      <div class="fa-stage-row" id="fa-stage-row"></div>
      <div id="fa-prog-msg"></div>
    </div>
    <div id="fa-done">
      <div class="fa-done-title">✅ Design complete!</div>
      <div class="fa-done-sub">ForgeCAD is updating your viewport…</div>
      <div class="fa-done-file" id="fa-done-file"></div>
    </div>
    <div id="fa-input-row">
      <textarea id="fa-input" rows="1" placeholder="Describe your part or answer a question…"></textarea>
      <button id="fa-send">➤</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  // ── Helper: detect ForgeCAD project ─────────────────────────────────────
  function detectProject() {
    fetch('/api/projects')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (!data || !data.projects || !data.projects.length) return;
        var proj = data.projects[0];
        state.projectDir = proj.localPath;
        state.projectId  = proj.id;
        var pill = document.getElementById('fa-project-pill');
        var nameEl = document.getElementById('fa-proj-name');
        var pathEl = document.getElementById('fa-proj-path');
        nameEl.textContent = proj.name;
        pathEl.textContent = proj.localPath;
        pill.classList.add('visible');
      })
      .catch(function() {});
  }

  // ── Open / close ─────────────────────────────────────────────────────────
  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    panel.classList.toggle('open', state.panelOpen);
    fab.classList.toggle('open', state.panelOpen);
    if (state.panelOpen) {
      detectProject();
      setTimeout(function() { document.getElementById('fa-input').focus(); }, 360);
    }
  }
  fab.addEventListener('click', togglePanel);
  document.getElementById('fa-close').addEventListener('click', togglePanel);

  // ── Suggestion chips ─────────────────────────────────────────────────────
  document.querySelectorAll('.fa-sugg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.getElementById('fa-input').value = btn.dataset.msg;
      document.getElementById('fa-suggestions').style.display = 'none';
      sendMessage();
    });
  });

  // ── Time helper ──────────────────────────────────────────────────────────
  function now() {
    return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  // ── Format text ──────────────────────────────────────────────────────────
  function fmt(t) {
    return (t || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/`([^`]+)`/g,'<code style="background:rgba(0,0,0,.2);padding:1px 5px;border-radius:4px;font-family:monospace">$1</code>')
      .replace(/\n/g,'<br>');
  }

  // ── Append message ────────────────────────────────────────────────────────
  function appendMsg(role, text) {
    var body = document.getElementById('fa-body');
    var wrap = document.createElement('div');
    wrap.className = 'fa-msg ' + role;
    wrap.innerHTML = '<div class="fa-bubble">' + fmt(text) + '</div>'
      + '<div class="fa-time">' + now() + '</div>';
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var body = document.getElementById('fa-body');
    var d = document.createElement('div');
    d.id = 'fa-typing'; d.className = 'fa-msg assistant';
    d.innerHTML = '<div class="fa-typing-bubble"><div class="fa-dots"><span></span><span></span><span></span></div></div>';
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() { var el=document.getElementById('fa-typing'); if(el) el.remove(); }

  // ── Update params strip ───────────────────────────────────────────────────
  function updateParams(params) {
    if (!params || !Object.keys(params).length) return;
    state.resolvedParams = Object.assign({}, state.resolvedParams, params);
    var strip = document.getElementById('fa-params');
    var list  = document.getElementById('fa-params-list');
    strip.classList.add('visible');
    list.innerHTML = Object.entries(state.resolvedParams)
      .map(function(e) {
        return '<span class="fa-chip">' + e[0].replace(/_/g,' ') + ': <strong>' + e[1] + '</strong></span>';
      }).join('');
  }

  // ── Send chat message ─────────────────────────────────────────────────────
  function sendMessage() {
    var inp = document.getElementById('fa-input');
    var msg = inp.value.trim();
    if (!msg || state.generating) return;

    inp.value = '';
    inp.style.height = 'auto';
    document.getElementById('fa-suggestions').style.display = 'none';
    document.getElementById('fa-send').disabled = true;
    appendMsg('user', msg);
    showTyping();

    var body = { message: msg };
    if (state.sessionId) body.session_id = state.sessionId;
    if (!state.sessionId && state.projectDir) body.design_context = 'ForgeCAD project: ' + state.projectDir;

    fetch(API + '/api/v1/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    .then(function(r) {
      hideTyping();
      if (!r.ok) return r.text().then(function(t) { appendMsg('assistant', '⚠️ ' + t); });
      return r.json().then(function(data) {
        state.sessionId = data.session_id;
        state.isReady   = data.is_ready;
        appendMsg('assistant', data.response);
        updateParams(data.resolved_params);
        if (data.is_ready) {
          document.getElementById('fa-ready').classList.add('visible');
          fab.classList.add('has-notif');
        }
      });
    })
    .catch(function(e) {
      hideTyping();
      appendMsg('assistant', '⚠️ Could not reach harness API at ' + API);
    })
    .finally(function() {
      document.getElementById('fa-send').disabled = false;
      document.getElementById('fa-input').focus();
    });
  }

  // ── Keyboard / auto-resize ────────────────────────────────────────────────
  var inputEl = document.getElementById('fa-input');
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 96) + 'px';
  });
  document.getElementById('fa-send').addEventListener('click', sendMessage);

  // ── Pipeline stage rendering ──────────────────────────────────────────────
  var STAGES = ['PLANNING','GENERATING','VERIFYING','AWAITING_APPROVAL','HANDOFF','DONE'];
  var ICONS  = {PLANNING:'🧠',GENERATING:'⌨️',VERIFYING:'🔍',AWAITING_APPROVAL:'👤',HANDOFF:'📦',DONE:'✅',FAILED:'❌'};

  function renderStages(currentStage) {
    var row = document.getElementById('fa-stage-row');
    var curIdx = STAGES.indexOf(currentStage);
    row.innerHTML = STAGES.map(function(s, i) {
      var cls = 'fa-stage-chip';
      if (i < curIdx || currentStage === 'DONE') cls += ' done';
      else if (s === currentStage) cls += (currentStage === 'FAILED' ? ' error' : ' active');
      return '<span class="' + cls + '">' + (ICONS[s]||'') + ' ' + s + '</span>';
    }).join('');
    document.getElementById('fa-prog-stage').textContent = currentStage;
  }

  // ── Generate / poll ───────────────────────────────────────────────────────
  document.getElementById('fa-generate-btn').addEventListener('click', triggerGenerate);

  function triggerGenerate() {
    if (!state.sessionId) return;
    state.generating = true;
    document.getElementById('fa-generate-btn').disabled = true;
    document.getElementById('fa-ready').classList.remove('visible');
    document.getElementById('fa-progress').classList.add('visible');
    document.getElementById('fa-done').classList.remove('visible');
    renderStages('PLANNING');

    // First finalize the prompt
    fetch(API + '/api/v1/assistant/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: state.sessionId }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var prompt = data.refined_prompt;
      document.getElementById('fa-prog-msg').textContent = 'Starting workflow…';
      // Trigger design
      return fetch(API + '/api/v1/forgecad/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          project_dir: state.projectDir,
          resolved_params: state.resolvedParams,
        }),
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      state.workflowId = data.workflow_id;
      document.getElementById('fa-prog-msg').textContent = 'Workflow ID: ' + data.workflow_id;
      pollWorkflow();
    })
    .catch(function(e) {
      document.getElementById('fa-prog-msg').textContent = '⚠️ ' + e.message;
      state.generating = false;
      document.getElementById('fa-generate-btn').disabled = false;
    });
  }

  function pollWorkflow() {
    if (!state.workflowId) return;
    var handled = false;  // guard: only handle terminal state once
    state.pollTimer = setInterval(function() {
      fetch(API + '/api/v1/designs/' + state.workflowId + '/status')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(status) {
          if (!status || handled) return;
          renderStages(status.stage || 'PLANNING');
          var terminal = ['DONE', 'FAILED', 'ESCALATED'];
          if (terminal.indexOf(status.stage) !== -1) {
            handled = true;
            clearInterval(state.pollTimer);
            state.pollTimer = null;
            if (status.stage === 'DONE') {
              copyAndComplete(status);
            } else {
              document.getElementById('fa-prog-msg').textContent = '✗ ' + (status.failure_reason || 'Generation failed');
              state.generating = false;
              document.getElementById('fa-generate-btn').disabled = false;
            }
          }
        })
        .catch(function() {});
    }, 3000);
  }

  function copyAndComplete(status) {
    if (!state.projectDir) {
      // No project dir detected — skip copy, just show completion
      onDesignComplete(status, null);
      return;
    }
    document.getElementById('fa-prog-msg').textContent = 'Copying design to ForgeCAD workspace…';
    fetch(API + '/api/v1/forgecad/copy/' + state.workflowId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_dir: state.projectDir,
        name: 'generated_part',
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      onDesignComplete(status, data.dest || null);
    })
    .catch(function(e) {
      // Copy failed — still show completion, user can open file manually
      onDesignComplete(status, null);
    });
  }

  function onDesignComplete(status, copiedPath) {
    document.getElementById('fa-progress').classList.remove('visible');
    document.getElementById('fa-done').classList.add('visible');

    var displayPath = copiedPath
      || (state.projectDir ? state.projectDir + '/generated_part.forge.js' : '');
    document.getElementById('fa-done-file').textContent = displayPath;

    var msg = copiedPath
      ? '✅ Design ready! **generated_part.forge.js** has been written to your ForgeCAD workspace. Click it in the file tree to open.'
      : '✅ Design ready! Open it from the ForgeCAD file tree.';
    appendMsg('assistant', msg);
    fab.classList.add('has-notif');
    state.generating = false;
  }
})();
