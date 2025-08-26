// Simple client-side quiz & JS code runner with localStorage progress
// Runner aprimorado: captura console.log/info/warn/error, suporta await, avalia última expressão,
// mostra mensagem quando sem retorno, toolbar (Limpar / Copiar) e atalho Ctrl+Enter.

function ready(fn){
  if(document.readyState != 'loading'){ fn(); }
  else { document.addEventListener('DOMContentLoaded', fn); }
}

ready(() => {
  registerSW();
  wireRunners();
  wireQuizzes();
  hydrateProgress();
});

function wireRunners(){
  document.querySelectorAll('[data-runner]').forEach(el => {
    const ta = el.querySelector('textarea');
    const runBtn = el.querySelector('button[data-run]');
    const out = el.querySelector('.output');

    // Toolbar (limpar / copiar) se ainda não existe
    if(!el.querySelector('.runner-toolbar')){
      const bar = document.createElement('div');
      bar.className = 'runner-toolbar';
      bar.style.display = 'flex';
      bar.style.gap = '6px';
      bar.style.margin = '6px 0';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.textContent = 'Limpar';
      clearBtn.className = 'button secondary';
      clearBtn.addEventListener('click', () => { out.textContent = ''; });

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copiar saída';
      copyBtn.className = 'button secondary';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(out.textContent || '');
      });

      bar.append(clearBtn, copyBtn);
      runBtn.insertAdjacentElement('beforebegin', bar);
    }

    async function execute(){
      out.textContent = '';
      const code = ta.value;
      const logs = [];

      const formatArg = a => {
        if(typeof a === 'object' && a !== null){
          try { return JSON.stringify(a); } catch(_e){ return '[object]'; }
        }
        return String(a);
      };

      const fakeConsole = {};
      ['log','info','warn','error'].forEach(m => {
        fakeConsole[m] = (...args) => logs.push(args.map(formatArg).join(' '));
      });

      let result;
      let error;
      const hasAwait = /\bawait\b/.test(code);

      try {
        // Wrapper para permitir await quando detectar 'await'
        const wrapper = hasAwait
          ? '(async () => {\\n' + code + '\\n})()'
          : '(function(){\\n' + code + '\\n})()';

        result = Function('console', '"use strict"; return ' + wrapper)(fakeConsole);

        // Se retornou uma Promise, aguarda
        if(result && typeof result.then === 'function'){
            result = await result;
        }

        // Heurística: tentar última expressão se ainda undefined
        if(result === undefined){
          const lines = code.trim().split(/\\n/).filter(l => l.trim() !== '');
          const last = lines[lines.length - 1];
          if(
            last &&
            !/^(return|const|let|var|for\\b|while\\b|if\\b|class\\b|function\\b|async\\b|await\\b)/.test(last.trim())
          ){
            try {
              if(/\\bawait\\b/.test(last)){
                result = await Function('console','"use strict"; return (async ()=> ( ' + last + ' ))()')(fakeConsole);
              } else {
                result = Function('console','"use strict"; return ( ' + last + ' )')(fakeConsole);
              }
            } catch(_e){}
          }
        }
      } catch(e){
        error = e;
      }

      const parts = [];
      if(logs.length) parts.push(logs.join('\\n'));

      if(error){
        parts.push(error && error.stack ? error.stack : String(error));
      } else if(result !== undefined){
        parts.push(String(result));
      } else if(!logs.length){
        parts.push('Executado. (Sem retorno) — use return ou deixe uma expressão final.');
      }

      out.textContent = parts.join('\\n\\n--\\n\\n');
    }

    runBtn.addEventListener('click', () => execute());

    // Atalho Ctrl+Enter / Cmd+Enter
    ta.addEventListener('keydown', e => {
      if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
        e.preventDefault();
        execute();
      }
    });
  });
}

function wireQuizzes(){
  document.querySelectorAll('[data-quiz]').forEach((quizEl, idx) => {
    const key = quizEl.getAttribute('data-key') || ('quiz-' + idx);
    const options = quizEl.querySelectorAll('.option');
    const correct = quizEl.getAttribute('data-answer');
    const result = quizEl.querySelector('[data-result]');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const v = opt.getAttribute('data-value');
        options.forEach(o => o.classList.remove('correct','incorrect'));
        if(v === correct){
          opt.classList.add('correct');
          result.textContent = 'Acertou! ✅';
          saveProgress(key, true);
        }else{
          opt.classList.add('incorrect');
          result.textContent = 'Tente novamente.';
          saveProgress(key, false);
        }
      });
    });
  });
}

function saveProgress(key, passed){
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress[key] = { passed: !!passed, ts: Date.now() };
  localStorage.setItem('progress', JSON.stringify(progress));
  renderProgress(progress);
}

function hydrateProgress(){
  renderProgress(JSON.parse(localStorage.getItem('progress') || '{}'));
}

function renderProgress(progress){
  const pill = document.querySelector('#progress-pill');
  if(!pill) return;
  const allQuizzes = document.querySelectorAll('[data-quiz]');
  const total = allQuizzes.length;
  const passed = Object.entries(progress).filter(([_,v]) => v && v.passed).length;
  pill.textContent = passed + ' / ' + total + ' quizzes concluídos';
  if(!document.querySelector('#reset-progress') && pill){
    const btn = document.createElement('button');
    btn.id = 'reset-progress';
    btn.className = 'button secondary';
    btn.style.marginLeft = '8px';
    btn.textContent = 'Reset';
    btn.addEventListener('click', () => {
      if(confirm('Resetar progresso?')){
        localStorage.removeItem('progress');
        hydrateProgress();
      }
    });
    pill.insertAdjacentElement('afterend', btn);
  }
}

async function registerSW(){
  if(!('serviceWorker' in navigator)) return;
  const path = location.pathname;
  let swPath = 'sw.js';
  if(/\\/(lessons|assignments)\\//.test(path)) swPath = '../sw.js';
  try { await navigator.serviceWorker.register(swPath); } catch(e){}
}