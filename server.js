require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});

// ── Pipeline API endpoint ─────────────────────────────────────────
app.post('/api/pipeline', async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Please provide a research topic.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it as an environment variable.'
    });
  }

const genAI = new GoogleGenerativeAI(apiKey);

  const SYSTEM = `You are the MiDAS AI Research Pipeline — the AI intelligence engine of the Malaysian Institute of Defence and Security (MiDAS). Your role is to generate authoritative, institutional-grade research outputs on defence and security topics relevant to Malaysia and the ASEAN region.

Return ONLY valid JSON — no markdown fences, no preamble, no extra text. Use exactly this structure:

{
  "title": "Full research brief title — MiDAS Policy Analysis [Year]",
  "policy_html": "HTML string — 4 substantive paragraphs using <p> tags. Include a <h3>MiDAS Recommendations</h3> section with 3-4 <div class='rec-item'> divs. Minimum 600 words. Cite real institutions: SIPRI, IISS Military Balance, NACSA, Reuters Defence, Jane's Defence Weekly, Bernama, RSIS, The Diplomat, ASEAN Secretariat. Use realistic statistics. Write in authoritative editorial style appropriate for a defence think tank.",
  "exec_summary": "Exactly 3 sentences. Ministerial grade. Sentence 1: the core finding with the key statistic. Sentence 2: the structural implication. Sentence 3: the single highest-priority recommended action.",
  "findings": [
    {
      "stat": "display value e.g. 28% or USD 12.4B or 187",
      "unit": "unit if needed e.g. /mo or B or % — or empty string",
      "label": "short label for what this measures",
      "change": "year-on-year change or context",
      "source": "Institution · Document name"
    }
  ],
  "dashboard_stats": [
    {
      "val": "display value",
      "label": "what it measures",
      "chg": "change text",
      "chg_color": "#27ae60 for positive or #c0392b for negative or #e67e22 for caution"
    }
  ],
  "bars": [
    {
      "name": "country or category label",
      "val": 5.5,
      "max": 13,
      "color": "#1d5a8e for normal or #c0392b for Malaysia highlighted"
    }
  ],
  "bar_label": "Chart title with source and year",
  "social_x": "Maximum 270 characters. Start with a hard-hitting statistic or MiDAS:. Include 3-4 relevant hashtags at the end. No em-dashes.",
  "social_li": "Maximum 480 characters. Professional tone. Core insight + structural implication + call to action. Hashtags at end.",
  "social_tags": "#Tag1 #Tag2 #Tag3 #Tag4 #Tag5",
  "bm_exec": "Bahasa Malaysia executive summary — use authentic ceramah register appropriate for Malaysian government audience. NOT formal Bahasa Baku. NOT Indonesian vocabulary.",
  "bm_analysis": "Bahasa Malaysia analysis paragraph — same register",
  "bm_rec": "Bahasa Malaysia recommendations — same register"
}

REQUIREMENTS:
- findings: exactly 6 items
- dashboard_stats: exactly 3 items
- bars: 4-6 items for a horizontal bar chart relevant to the topic
- All statistics must be realistic and plausible for the Malaysia/ASEAN defence context
- Policy brief must contain genuine analytical insight, not generic observations
- Bahasa Malaysia sections must read as written by a Malaysian government official, not translated`;

try {
  const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
  responseMimeType: 'application/json',
  temperature: 0.2,
  maxOutputTokens: 8192
}
});

  const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: `${SYSTEM}

Generate a comprehensive MiDAS AI Research Pipeline output for this topic:
${topic.trim()}`
        }
      ]
    }
  ]
});

 const rawText = result.response.text();

console.log('\nRAW GEMINI RESPONSE:\n');
console.log(rawText);

const cleaned = rawText
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();

let parsed;

try {
  parsed = JSON.parse(cleaned);

  console.log('\nJSON PARSED SUCCESSFULLY\n');

} catch (parseError) {

  console.error('\nJSON PARSE ERROR:\n', parseError);

  return res.status(500).json({
    error: 'Gemini returned invalid JSON.',
    raw: rawText
  });
}

res.json({
  success: true,
  data: parsed
});

} catch (err) {

console.error('Gemini API error:', err);

res.status(500).json({
  error: err.message
});

}

});

// ── Serve frontend for all other routes ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅  MiDAS Pipeline Demo running at http://localhost:${PORT}`);
  console.log(`API key: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ NOT SET'}\n`);
});
