
// Simple client-side quiz & JS code runner with localStorage progress

function ready(fn){ if(document.readyState!='loading'){ fn() } else { document.addEventListener('DOMContentLoaded', fn) } }

ready(() => {
  registerSW();
  wireRunners();
  wireQuizzes();
  hydrateProgress();
});

function wireRunners(){
  document.querySelectorAll('[data-runner]').forEach(el => {
    const ta = el.querySelector('textarea');
    const btn = el.querySelector('button[data-run]');
    const out = el.querySelector('.output');
    btn.addEventListener('click', () => {
      out.textContent = '';
      try{
        const result = Function('"use strict";\n' + ta.value)();
        if(result !== undefined) out.textContent = String(result);
      }catch(e){
        out.textContent = e && e.stack ? e.stack : String(e);
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
  // Carrega progresso salvo e re-renderiza baseando-se no total real de quizzes na página
  renderProgress(JSON.parse(localStorage.getItem('progress') || '{}'));
}

function renderProgress(progress){
  const pill = document.querySelector('#progress-pill');
  if(!pill) return;
  const allQuizzes = document.querySelectorAll('[data-quiz]');
  const total = allQuizzes.length;
  const passed = Object.entries(progress).filter(([k,v]) => v && v.passed).length;
  pill.textContent = passed + ' / ' + total + ' quizzes concluídos';
  if(!document.querySelector('#reset-progress') && pill){
    const btn = document.createElement('button');
    btn.id = 'reset-progress';
    btn.className = 'button secondary';
    btn.style.marginLeft = '8px';
    btn.textContent = 'Reset';
    btn.addEventListener('click', () => { if(confirm('Resetar progresso?')){ localStorage.removeItem('progress'); hydrateProgress(); } });
    pill.insertAdjacentElement('afterend', btn);
  }
}

async function registerSW(){
  if(!('serviceWorker' in navigator)) return;
  // Ajusta caminho do sw quando página está em subpasta (lessons/ ou assignments/)
  const path = location.pathname;
  let swPath = 'sw.js';
  if(/\/(lessons|assignments)\//.test(path)) swPath = '../sw.js';
  try{ await navigator.serviceWorker.register(swPath); }catch(e){}
}
