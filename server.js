require('dotenv').config();

const express = require('express'); 
const Groq = require("groq-sdk");
const path = require('path');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GROQ_API_KEY });
});

// ── Pipeline API endpoint ─────────────────────────────────────────
app.post('/api/pipeline', async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Please provide a research topic.' });
  }

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error: 'GROQ_API_KEY is not set.'
  });
}


  const SYSTEM = `You are an AI Research and Intelligence Pipeline.
Your role is to generate authoritative, institutional-grade research outputs on policy, business, technology, security, geopolitical, and strategic topics.

Return ONLY valid JSON — no markdown fences, no preamble, no extra text. Use exactly this structure:

{
  "title": "Full Research Brief Title [Year]",

  "policy_html": "HTML string — 4 substantive paragraphs using <p> tags. Include a <h3>Recommendations</h3> section with 3-4 <div class='rec-item'> divs. Minimum 600 words.",

  "exec_summary": "Exactly 3 sentences. Ministerial grade.",

  "findings": [
    {
      "stat": "display value",
      "unit": "unit if needed",
      "label": "short label",
      "change": "context or year-on-year change",
      "source": "Institution · Document"
    }
  ],

  "dashboard_stats": [
    {
      "val": "display value",
      "label": "metric label",
      "chg": "change text",
      "chg_color": "#27ae60"
    }
  ],

  "bars": [
    {
      "name": "country or category",
      "val": 5.5,
      "max": 13,
      "color": "#1d5a8e"
    }
  ],

  "bar_label": "Chart title with source and year",

  "social_x": "Maximum 270 characters.",
  "social_li": "Maximum 480 characters.",
  "social_tags": "#Tag1 #Tag2 #Tag3 #Tag4 #Tag5",

  "bm_exec": "Bahasa Malaysia executive summary.",
  "bm_analysis": "Bahasa Malaysia analysis.",
  "bm_rec": "Bahasa Malaysia recommendations.",

  "case_number": "CASE-2026-001",
  "report_datetime": "June 10, 2026 14:30",
  "officer": "Lead Intelligence Officer",
  "incident_time": "June 08, 2026 09:15",
  "location": "Kuala Lumpur, Malaysia",
  "incident_type": "Cybersecurity Incident",

  "reporting_party": "Organization or individual reporting the incident",
  "victims": "Victim details",
  "subjects": "Subject or suspect details",

  "chronological_narrative": [
    {
      "time": "June 08, 2026 @ 09:15",
      "action": "Initial incident detected and logged"
    }
  ],

  "evidence_inventory": [
    {
      "item": "Digital Log File",
      "source": "Server Database",
      "tag": "001-A"
    }
  ],

  "interviews": [
    {
      "person": "Witness Name",
      "role": "Witness",
      "statement": "Summary of statement"
    }
  ],

  "investigative_analysis": "Detailed investigative analysis explaining links between evidence, events and findings.",

  "findings_summary": "Final findings and recommendations summary.",

  "case_report_html": "Full investigation report formatted in HTML using <h3>, <p>, <ul>, <li>, and <div class='rec-item'> tags."
}

REQUIREMENTS:
- findings: exactly 6 items
- dashboard_stats: exactly 3 items
- bars: 4-6 items
- chronological_narrative: minimum 5 entries
- evidence_inventory: minimum 5 entries
- interviews: minimum 3 entries
- case_report_html must follow this structure:

  I. Case Information
  II. Involved Parties
  III. Executive Summary
  IV. Chronological Narrative
  V. Evidence & Property Inventory
  VI. Interview Summaries
  VII. Investigative Analysis
  VIII. Conclusions & Recommendations

- case_report_html must be minimum 800 words
- All statistics must be realistic and plausible
- Policy brief must contain genuine analytical insight
- Investigation report must read like a professional law-enforcement/intelligence case file
- Bahasa Malaysia sections must read as written by a Malaysian government official, not translated
`;


try {

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 8000,

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "system",
        content: SYSTEM
      },
      {
        role: "user",
        content: `Generate a comprehensive AI Research Pipeline output for this topic:

${topic.trim()}`
      }
    ]
  });

  const rawText = response.choices[0].message.content;

  console.log('\nRAW GROQ RESPONSE:\n');
  console.log(rawText);

  let parsed;

  try {
    parsed = JSON.parse(rawText);

    console.log("✅ JSON parsed successfully");

  } catch (err) {

    console.error("JSON PARSE ERROR:", err);

    console.log("\n========== RAW RESPONSE ==========\n");
    console.log(rawText);

    return res.status(500).json({
      error: "Invalid JSON returned by Groq",
      details: err.message,
      raw: rawText
    });
  }

  return res.json({
    success: true,
    data: parsed
  });

} catch (err) {

  console.error('GROQ API error:', err);

  return res.status(500).json({
    error: err.message
  });

}

});

// ── Serve frontend for all other routes ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Pipeline Demo running at http://localhost:${PORT}`);
  console.log(`API key: ${process.env.GROQ_API_KEY ? '✓ Set' : '✗ NOT SET'}`
);
});
