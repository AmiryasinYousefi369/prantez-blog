(function () {
  var term = document.getElementById('term');
  var hiddenInput = document.getElementById('hidden-input');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PROMPT = 'tony@stark:~$';
  var history = [];
  var historyIndex = -1;
  var currentValue = '';
  var promptRow = null;
  var locked = true; // locked during boot

  // ---------- rendering helpers ----------

  function scrollDown() {
    term.scrollTop = term.scrollHeight;
  }

  function addLine(text, cls) {
    var div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.innerHTML = text;
    term.appendChild(div);
    scrollDown();
    return div;
  }

  function addBlank() {
    addLine('&nbsp;');
  }

  function typeLine(text, cls, speed, cb) {
    return new Promise(function (resolve) {
      var div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      term.appendChild(div);
      if (reduceMotion) {
        div.textContent = text;
        scrollDown();
        resolve();
        return;
      }
      var i = 0;
      var timer = setInterval(function () {
        i++;
        div.textContent = text.slice(0, i);
        scrollDown();
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed || 16);
    });
  }

  function sleep(ms) {
    return new Promise(function (res) { setTimeout(res, reduceMotion ? 0 : ms); });
  }

  // ---------- prompt line (the live input) ----------

  function renderPrompt() {
    promptRow = document.createElement('div');
    promptRow.className = 'prompt-row';
    promptRow.innerHTML =
      '<span class="sym">' + PROMPT + '</span>' +
      '<span class="typed"></span><span class="caret"></span>';
    term.appendChild(promptRow);
    scrollDown();
    updatePromptText();
  }

  function updatePromptText() {
    if (!promptRow) return;
    var typedEl = promptRow.querySelector('.typed');
    typedEl.textContent = ' ' + currentValue;
  }

  function commitPrompt() {
    if (promptRow) {
      promptRow.querySelector('.caret').remove();
    }
  }

  // ---------- commands ----------

  var COMMANDS = {
    help: function () {
      addLine('Available commands:', 'head');
      addLine('  about       — who is running this thing');
      addLine('  skills      — the toolkit');
      addLine('  projects    — things that got built');
      addLine('  contact     — how to reach me');
      addLine('  whoami      — identity check');
      addLine('  clear       — wipe the screen');
      addLine('  jarvis      — ask nicely');
      addBlank();
    },
    about: function () {
      addLine('Tony Stark', 'head');
      addLine('Front-end Web Developer', 'gold');
      addBlank();
      addLine('Building fast, clean interfaces — no suit required, just');
      addLine('HTML, CSS and JavaScript. Based in the workshop, powered');
      addLine('by coffee (and, allegedly, an arc reactor).');
      addBlank();
    },
    skills: function () {
      addLine('Toolkit:', 'head');
      var skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Git', 'REST APIs', 'UI Design', 'Responsive Design'];
      addLine('  ' + skills.join('  ·  '));
      addBlank();
    },
    projects: function () {
      addLine('Projects:', 'head');
      addBlank();
      addLine('  01  E-Commerce Store', 'gold');
      addLine('      React · Redux · Stripe');
      addLine('      Full online store with cart, filtering and checkout.');
      addBlank();
      addLine('  02  Task Manager', 'gold');
      addLine('      React · Firebase');
      addLine('      Team task app with live sync and shared boards.');
      addBlank();
      addLine('  03  Weather Dashboard', 'gold');
      addLine('      JavaScript · REST API · Chart.js');
      addLine('      Multi-city weather with interactive charts.');
      addBlank();
      addLine('  (placeholders — swap in real project links)', 'muted');
      addBlank();
    },
    contact: function () {
      addLine('Reach me at:', 'head');
      addLine('  email     — <a class="link" href="mailto:tony@example.com">tony@example.com</a>');
      addLine('  github    — <a class="link" href="https://github.com/" target="_blank" rel="noopener">github.com/</a>');
      addLine('  linkedin  — <a class="link" href="https://linkedin.com/" target="_blank" rel="noopener">linkedin.com/</a>');
      addBlank();
    },
    whoami: function () {
      addLine('tony_stark — the one who built this terminal from scratch.');
      addBlank();
    },
    jarvis: function () {
      addLine('J.A.R.V.I.S. is currently unavailable.', 'red');
      addLine('This is just HTML and JavaScript, sir. No AI butler included.', 'muted');
      addBlank();
    },
    'sudo': function () {
      addLine('Nice try. Permission denied — even for you, sir.', 'red');
      addBlank();
    },
    clear: function () {
      term.innerHTML = '';
    },
  };

  function runCommand(raw) {
    var cmd = raw.trim();
    if (cmd === '') return;

    var key = cmd.split(' ')[0].toLowerCase();
    if (key === 'sudo') {
      COMMANDS.sudo();
      return;
    }
    if (COMMANDS[key]) {
      COMMANDS[key]();
    } else {
      addLine('command not found: ' + escapeHtml(cmd), 'red');
      addLine('type \'help\' to see available commands.', 'muted');
      addBlank();
    }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- input handling ----------

  function nextPrompt() {
    currentValue = '';
    historyIndex = -1;
    renderPrompt();
  }

  hiddenInput.addEventListener('input', function () {
    currentValue = hiddenInput.value;
    updatePromptText();
  });

  hiddenInput.addEventListener('keydown', function (e) {
    if (locked) return;
    if (e.key === 'Enter') {
      var val = currentValue;
      currentValue = hiddenInput.value = '';
      updatePromptText();
      commitPrompt();
      if (val.trim() !== '') history.push(val);
      historyIndex = -1;
      runCommand(val);
      nextPrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) historyIndex = history.length - 1;
      else if (historyIndex > 0) historyIndex--;
      hiddenInput.value = history[historyIndex];
      currentValue = hiddenInput.value;
      updatePromptText();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      historyIndex++;
      if (historyIndex >= history.length) {
        historyIndex = -1;
        hiddenInput.value = '';
      } else {
        hiddenInput.value = history[historyIndex];
      }
      currentValue = hiddenInput.value;
      updatePromptText();
    }
  });

  term.addEventListener('click', function () {
    hiddenInput.focus();
  });

  // ---------- boot sequence ----------

  async function boot() {
    addLine('STARK INDUSTRIES — PERSONAL OS', 'head');
    addLine('────────────────────────────────', 'muted');
    await sleep(200);
    await typeLine('Initializing interface...', 'muted', 10);
    await sleep(150);
    await typeLine('Loading arc reactor core.......... OK', 'muted', 8);
    await sleep(120);
    await typeLine('Calibrating repulsors............. OK', 'muted', 8);
    await sleep(120);
    await typeLine('Connecting to J.A.R.V.I.S.......... OK', 'muted', 8);
    await sleep(300);
    addBlank();
    await typeLine('Welcome back, sir.', 'gold', 22);
    await typeLine("Type 'help' to see available commands.", null, 14);
    addBlank();
    locked = false;
    nextPrompt();
    hiddenInput.focus();
  }

  boot();
})();
