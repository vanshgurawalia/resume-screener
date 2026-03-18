// PDF.js worker setup
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let pdfText = null;
let activeTab = 'paste';

// ── Tab switching ──────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-paste').classList.toggle('active', tab === 'paste');
  document.getElementById('tab-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('paste-panel').classList.toggle('hidden', tab !== 'paste');
  document.getElementById('upload-panel').classList.toggle('hidden', tab !== 'upload');
}

// ── Drag & drop ────────────────────────────────────────────────
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('drag-over');
}
function handleDragLeave() {
  document.getElementById('drop-zone').classList.remove('drag-over');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') processFile(file);
  else alert('Please upload a PDF file.');
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function clearFile() {
  pdfText = null;
  document.getElementById('file-pill').classList.add('hidden');
  document.getElementById('drop-zone').classList.remove('hidden');
  document.getElementById('file-input').value = '';
}

async function processFile(file) {
  document.getElementById('drop-zone').classList.add('hidden');
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('pill-status').textContent = 'Reading…';
  document.getElementById('file-pill').classList.remove('hidden');

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      pdfText = text;
      document.getElementById('pill-status').textContent = `${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''} · ready`;
    } catch (err) {
      alert('Could not read PDF. Try pasting the text instead.');
      clearFile();
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── Analyze ────────────────────────────────────────────────────
async function analyze() {
  const jd = document.getElementById('jd').value.trim();
  const resumeContent = activeTab === 'paste'
    ? document.getElementById('resume').value.trim()
    : pdfText;

  if (!jd) { alert('Please paste the job description.'); return; }
  if (!resumeContent) {
    alert(activeTab === 'upload'
      ? 'Please wait for the PDF to finish loading, or switch to paste mode.'
      : 'Please paste your resume.');
    return;
  }

  setLoading(true);

  const prompt = `You are a professional resume screener. Analyze the resume against the job description and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

{
  "matchScore": <integer 0-100>,
  "skillsMatch": <integer 0-100>,
  "experienceMatch": <integer 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["tip1", "tip2", "tip3", "tip4"],
  "summary": "2-3 sentence honest assessment of this candidate for this role."
}

Job Description:
${jd}

Resume:
${resumeContent}`;

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const raw = data.content.map(i => i.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    renderResults(parsed);
  } catch (err) {
    console.error(err);
    alert('Something went wrong. Check the console for details and try again.');
    setLoading(false);
  }
}

function setLoading(on) {
  document.getElementById('analyze-btn').disabled = on;
  document.getElementById('btn-text').textContent = on ? 'Analyzing…' : 'Analyze match';
  document.getElementById('loading').classList.toggle('hidden', !on);
  document.getElementById('results').classList.add('hidden');
}

// ── Render results ─────────────────────────────────────────────
function scoreClass(n) {
  if (n >= 70) return { text: 'c-green', bar: 'bar-green' };
  if (n >= 45) return { text: 'c-amber', bar: 'bar-amber' };
  return { text: 'c-red', bar: 'bar-red' };
}

function renderResults(d) {
  setLoading(false);

  // Scores
  const scores = [
    { val: d.matchScore, label: 'Overall match' },
    { val: d.skillsMatch, label: 'Skills match' },
    { val: d.experienceMatch, label: 'Experience match' }
  ];
  document.getElementById('score-grid').innerHTML = scores.map(s => {
    const cls = scoreClass(s.val);
    return `
      <div class="score-card">
        <div class="score-val ${cls.text}">${s.val}%</div>
        <div class="score-lbl">${s.label}</div>
        <div class="score-bar"><div class="score-bar-fill ${cls.bar}" style="width:0%" data-target="${s.val}%"></div></div>
      </div>`;
  }).join('');

  // Animate bars after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.score-bar-fill').forEach(el => {
      el.style.width = el.dataset.target;
    });
  });

  // Summary
  document.getElementById('result-summary').textContent = d.summary;

  // Matched skills
  const matchedEl = document.getElementById('matched-section');
  if (d.matchedSkills && d.matchedSkills.length) {
    matchedEl.innerHTML = `
      <h3>Skills you have</h3>
      <div class="tag-row">${d.matchedSkills.map(s => `<span class="tag tag-green">${s}</span>`).join('')}</div>`;
    matchedEl.classList.remove('hidden');
  } else {
    matchedEl.classList.add('hidden');
  }

  // Missing skills
  const missingEl = document.getElementById('missing-section');
  if (d.missingSkills && d.missingSkills.length) {
    missingEl.innerHTML = `
      <h3>Skills to add or highlight</h3>
      <div class="tag-row">${d.missingSkills.map(s => `<span class="tag tag-red">${s}</span>`).join('')}</div>`;
    missingEl.classList.remove('hidden');
  } else {
    missingEl.classList.add('hidden');
  }

  // Tips
  const tipsEl = document.getElementById('tips-section');
  if (d.suggestions && d.suggestions.length) {
    tipsEl.innerHTML = `
      <h3>How to improve your resume</h3>
      <ul class="tip-list">${d.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
    tipsEl.classList.remove('hidden');
  } else {
    tipsEl.classList.add('hidden');
  }

  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Reset ──────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('jd').value = '';
  document.getElementById('resume').value = '';
  clearFile();
  switchTab('paste');
  document.getElementById('results').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
