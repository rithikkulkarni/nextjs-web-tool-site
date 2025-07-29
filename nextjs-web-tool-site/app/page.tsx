'use client';

import { useRef, useState, FormEvent } from 'react';
import Link from 'next/link';
import Script from 'next/script';



export default function Home() {
  /* ---------------- state + refs ---------------- */
  const formRef = useRef<HTMLFormElement>(null);
  const [apiMsg, setApiMsg] = useState('');
  const [llmMsg, setLlmMsg] = useState('');
  const [thumbnailName, setThumbnailName] = useState<string | null>(null);

  /* ---------------- helpers (unchanged) ---------------- */
  const getGroup = (subs: number) => {
    if (subs <= 1_000) return 'group1';
    if (subs <= 10_000) return 'group2';
    if (subs <= 50_000) return 'group3';
    if (subs <= 250_000) return 'group4';
    if (subs <= 1_000_000) return 'group5';
    return 'group6';
  };

  const buildPrompt = ({
  title,
  tags,
  topic,
  subs,
  prob,
  brightness,
  avg_red,
  avg_green,
  avg_blue,
  thumbnail_edge_density,
  num_faces,
  clickbait_score,
  title_readability,
  num_tags,
  num_unique_tags,
  avg_tag_length
}: {
  title: string;
  tags: string;
  topic: string;
  subs: number;
  prob: string;
  brightness: number;
  avg_red: number;
  avg_green: number;
  avg_blue: number;
  thumbnail_edge_density: number;
  num_faces: number;
  clickbait_score: number;
  title_readability: number;
  num_tags: number;
  num_unique_tags: number;
  avg_tag_length: number;
}) => {
  // ---- helpers to drop undefined/empty/NaN values ----
  const isDef = (v: any) =>
    !(v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v)));
  const isStr = (s: any) => typeof s === 'string' && s.trim().length > 0;

  // ---- build PRIMARY_TEXT lines conditionally ----
  const lines: string[] = [];
  lines.push('Draft video details:');
  if (isDef(prob)) lines.push(`• Top-25% success probability: ${prob}`);
  if (isDef(subs)) lines.push(`• Subscribers: ${subs}`);
  if (isStr(title)) lines.push(`• Title: "${title}"`);
  if (isStr(tags)) lines.push(`• Tags: ${tags}`);
  if (isStr(topic)) lines.push(`• Topic: ${topic}`);

  const thumbParts: string[] = [];
  if (isDef(brightness)) thumbParts.push(`Brightness: ${brightness}`);
  if (isDef(avg_red) && isDef(avg_green) && isDef(avg_blue))
    thumbParts.push(`RGB: (${avg_red}, ${avg_green}, ${avg_blue})`);
  if (isDef(thumbnail_edge_density)) thumbParts.push(`Edge density: ${thumbnail_edge_density}`);
  if (isDef(num_faces)) thumbParts.push(`Faces: ${num_faces}`);
  if (thumbParts.length) lines.push(`• Thumbnail → ${thumbParts.join('; ')}`);

  const titleParts: string[] = [];
  if (isDef(clickbait_score)) titleParts.push(`Title clickbait score: ${clickbait_score}/100`);
  if (isDef(title_readability)) titleParts.push(`Readability (Flesch Reading Ease): ${title_readability}`);
  if (titleParts.length) lines.push(`• ${titleParts.join(' | ')}`);

  const tagParts: string[] = [];
  if (isDef(num_tags) && isDef(num_unique_tags))
    tagParts.push(`Tags → Count: ${num_tags} (unique ${num_unique_tags})`);
  else if (isDef(num_tags)) tagParts.push(`Tags → Count: ${num_tags}`);
  if (isDef(avg_tag_length)) tagParts.push(`Avg length: ${avg_tag_length} words`);
  if (tagParts.length) lines.push(`• ${tagParts.join('; ')}`);

  const PRIMARY_TEXT = lines.join('\n');

  // ---- prompt template ----
  return `
<SYSTEM_SETUP>\n
1. ROLE: Expert YouTube Growth Strategist\n
2. IMPORTANCE: "Your analysis directs pre-launch edits to title, tags, and thumbnail, shaping click-through and early audience retention."\n
3. TIP_OFFER: "Provide precise, implementation-ready guidance and your recommendations may be featured in our product showcase."\n
</SYSTEM_SETUP>\n

<CONTEXT>\n
4. GOAL: Deliver professional pre-launch coaching based on title, tags, topic, and thumbnail features.\n
5. BACKGROUND: The system provides a top-quartile probability and lightweight feature signals. Guidance must be actionable, explanatory, and immediately usable by creators.\n
6. KEY_DETAILS:\n
- Provide only three labelled sections: "Title:", "Tags:", "Thumbnail:". Do not output a verdict.\n
- In each section, write 2–4 sentences that BOTH suggest changes AND briefly explain why they matter.\n
- Include at least one short example in quotes per section (e.g., a sample title rewrite, example tags, or a concrete thumbnail adjustment). Avoid numeric thresholds in user-facing text.\n
- Strictly professional tone; no bullets or numbered lists.\n
- If any field is missing, malformed, or appears as a placeholder (e.g., "undefined", "null", "NaN"), ignore it entirely and do not mention that it is missing.\n
</CONTEXT>\n

<INPUT_DATA>\n
7. PRIMARY_TEXT:\n
${PRIMARY_TEXT}\n

8. SUPPORTING_MATERIALS:\n
4. Additional Context (INTERNAL GUIDANCE — DO NOT OUTPUT NUMBERS):\n
- Target bands to guide suggestions (never print values):\n
  • Brightness: If low → "brighten slightly"; if high → "reduce to avoid washout."\n
  • RGB balance: If skewed → "rebalance color", "reduce tint", "add natural saturation."\n
  • Edge density: If low → "add a clear focal element"; if high → "simplify background."\n
  • Faces: Prefer a single, front-facing face → If none → "feature one expressive face"; if many → "focus on a single face."\n
  • Clickbait tone: If weak → "sharpen the promise with a specific outcome"; if extreme → "dial back hype; keep a concrete payoff."\n
  • Reading Ease: If low → "simplify wording"; if very high → "add a concrete detail for substance."\n
  • Tags: If sparse → "add a few precise, intent-matching tags"; if bloated → "trim weaker or redundant tags"; keep tags short and scannable; blend broad + long-tail.\n
- Use natural, non-numeric directives only.\n
</INPUT_DATA>\n

<REQUEST>\n
9. INSTRUCTIONS:\n
- Output Format: Three labelled sections only, in this order and on separate lines: "Title: …" then "Tags: …" then "Thumbnail: …". Each section should have 2–4 sentences, with at least one quoted example.\n
- Tone: Strictly professional, clear, and encouraging.\n
- Depth: Explanatory and example-driven; teach the user what to change and why.\n
- Constraints: No lists or bullets; never reveal numbers or thresholds; avoid jargon; keep total length between 130 and 220 words; ignore any missing inputs.\n
- Few-shot Example (style only):\n
Title: Clarify the payoff and lead with the outcome; try a version like "From Burnout to Deep Focus in One Week" to make the benefit explicit and easy to scan. Explain briefly why this change helps curiosity without overselling.\n
Tags: Replace vague terms with intent-matching phrases like "morning routine for beginners" or "focus habits that stick" to align with search language and surface relevance.\n
Thumbnail: Feature one expressive, front-facing face and increase subject-background separation; for instance, a close-up reaction on the right with simple text like "Week 1 Results" on the left keeps focus and narrative tension.\n

10. QUALITY_TARGETS:\n
- Accuracy: Ground suggestions in the provided features only.\n
- Completeness: Address Title, Tags, and Thumbnail with concrete examples and reasons.\n
- Relevance: Align strictly with the GOAL and BACKGROUND.\n
- Verification: If essential fields are missing or malformed, ask one concise clarifying question **only if** it blocks giving useful advice; otherwise proceed and ignore missing items.\n
</REQUEST>\n

<DELIVERABLE>\n
11. TITLE: "Pre-Launch YouTube Advice" (do not print this title in the final output)\n
12. CONTENT_STRUCTURE:\n
- Main Points/Insights: Three labelled sections (Title, Tags, Thumbnail) with examples and brief rationale.\n
- No introduction or conclusion.\n
13. LENGTH: 130–220 words total.\n
</DELIVERABLE>
`;
};




  /* ---------------- form submit ---------------- */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);
    const title = (fd.get('title') as string).trim();
    const tags = (fd.get('tags') as string).trim();
    const topic = (fd.get('topic') as string).trim();
    const subs = Number(fd.get('subscriber-count') || 0);
    const group = getGroup(subs);

    try {
      setApiMsg('Analyzing…');
      setLlmMsg('');

      /* ---- 1) model prediction ---- */
      const mlRes = await fetch(
        `https://youtube-predictor-web-service.onrender.com/predict/${group}`,
        { method: 'POST', body: fd }
      );
      if (!mlRes.ok) throw new Error('Model API error ' + mlRes.status);
      const {
        probability,
        brightness,
        avg_red,
        avg_green,
        avg_blue,
        thumbnail_edge_density,
        num_faces,
        clickbait_score,
        title_readability,
        num_tags,
        num_unique_tags,
        avg_tag_length,
      } = await mlRes.json();
      const probDec = Number(probability).toFixed(2);
      setApiMsg(
        `Probability of high performance: <strong>${(
          Number(probDec) * 100
        ).toFixed(1)} %</strong>`
      );

      /* ---- 2) Gemini feedback ---- */
      setLlmMsg('Generating advice…');
      const prompt = buildPrompt({
        title,
        tags,
        topic,
        subs,
        prob: probability.toFixed(2), 
        brightness,
        avg_red,
        avg_green,
        avg_blue,
        thumbnail_edge_density,
        num_faces,
        clickbait_score,
        title_readability,
        num_tags,
        num_unique_tags,
        avg_tag_length,
      });
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "contents": [
              {
                "parts": [
                  { "text": prompt }
                ]
              }
            ]
          }),
        }
      );
      if (!gemRes.ok) {
        const errorText = await gemRes.text();
        console.error('Gemini API error:', gemRes.status, errorText);
        throw new Error('Gemini API error ' + gemRes.status);
      }
      const json = await gemRes.json();
      const feedback =
        json.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No feedback generated.';
      setLlmMsg(
        `<p>${feedback.replace(/\n/g, '<br/>')}</p>`
      );
    } catch (err: any) {
      setApiMsg('Error: ' + err.message);
      setLlmMsg('');
    }
  }

  /* ---------------- markup ---------------- */
  return (
    <>
      {/* old helper scripts (keep if you still need scrolling/breakpoints logic) */}
      <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/jquery.scrollex.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/browser.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/breakpoints.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/util.js" strategy="afterInteractive" />
      <Script src="/assets/js/main.js" strategy="afterInteractive" />

      <div id="page-wrapper">
        {/* ---------- Header ---------- */}
        <header id="header" className="alt">
          <h1>
            <Link href="/">YT Video Insights Tool</Link>
          </h1>
        </header>

        {/* ---------- Banner ---------- */}
        <section id="banner">
          <div className="inner">
            <div
              className="logo"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span
                className="icon brands fa-youtube"
                style={{ fontSize: '4.5em' }}
              />
            </div>
            <h2 style={{ textAlign: 'center' }}>YouTube Video Insights Tool</h2>
            <p style={{ textAlign: 'center' }}>
              Leverage this free, content-tailored feedback model to analyze your video
            </p>
          </div>
        </section>

        {/* ---------- Wrapper ---------- */}
        <section id="wrapper">
          {/* Spotlight 1 */}
          <section id="one" className="wrapper spotlight style1">
            <div className="inner">
              <a href="#" className="image">
                <img
                  src="/images/mlicon.png"
                  alt=""
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
              </a>
              <div className="content">
                <h2 className="major">
                  Want to understand the research behind this tool?
                </h2>
                <p>
                  Trained on over 100,000 YouTube videos, this model is built on state-of-the-art techniques 
                  in natural language & image processing.
                </p>
                <Link href="/research" className="special">
                  Learn more
                </Link>
              </div>
            </div>
          </section>

          {/* Spotlight 2 */}
          <section id="two" className="wrapper alt spotlight style2">
            <div className="inner">
              <div className="content">
                <h2 className="major">Disclaimer</h2>
                <p>
                  This analysis is only a suggestion and may not always improve video performance. 
                  This tool is meant as a guideline to advise creators when promoting content, 
                  but it may not catch all potential hits.
                </p>
              </div>
            </div>
          </section>
        </section>

        {/* ---------- Footer / Form ---------- */}
        <section id="footer">
          <div className="inner">
            <h2 className="major">Analyze your video</h2>
            <p>
              Upload your thumbnail image and paste your video metadata below.
              Click 'Analyze' to see your video&apos;s potential and get tailored
              suggestions.
            </p>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              method="post"
              encType="multipart/form-data"
              id="predict-form"
            >
              <div className="fields">
                <div className="field">
                  <label htmlFor="thumbnail">Thumbnail Image</label>
                  <label
                    htmlFor="thumbnail"
                    className="file-upload-btn"
                    style={{
                      display: 'inline-block',
                      padding: '0.75em 1.5em',
                      background: '#eee',
                      color: '#222',
                      borderRadius: '6px',
                      border: '2px solid #ccc',
                      cursor: 'pointer',
                      fontWeight: 600,
                      marginTop: '0.5em',
                      marginBottom: '0.5em',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={e => (e.currentTarget.style.background = '#eee')}
                  >
                    <span>
                      <i className="fas fa-upload" style={{ marginRight: '0.5em' }} />
                      Browse...
                    </span>
                    <input
                      type="file"
                      name="thumbnail"
                      id="thumbnail"
                      accept="image/*"
                      required
                      style={{
                        display: 'none',
                      }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        setThumbnailName(file ? file.name : null);
                      }}
                    />
                  </label>
                  {thumbnailName && (
                    <span style={{ marginLeft: '1em', color: '#f8fafc', fontWeight: 500 }}>
                      {thumbnailName}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Title..."
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    placeholder="tag1, tag2, tag3"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="topic">Video Topic</label>
                  <input
                    type="text"
                    name="topic"
                    id="topic"
                    placeholder="e.g. Personal Finance, Clash Royale"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="subscriber-count">Subscriber Count</label>
                  <input
                    type="number"
                    name="subscriber-count"
                    id="subscriber-count"
                    min={0}
                    placeholder="Subscriber Count..."
                    required
                  />
                </div>
              </div>

              <ul className="actions">
                <li>
                  <button type="submit" className="primary">
                    Analyze
                  </button>
                </li>
              </ul>
            </form>

            {/* dynamic results */}
            {apiMsg && (
              <div
                id="api-response"
                dangerouslySetInnerHTML={{ __html: apiMsg }}
                style={{ marginTop: '1em', fontWeight: 'bold' }}
              />
            )}
            {llmMsg && (
              <div
                id="llm-feedback"
                dangerouslySetInnerHTML={{ __html: llmMsg }}
                style={{ marginTop: '1em' }}
              />
            )}

            <ul className="copyright">
              <li>© Rithik Kulkarni & Ethan Goodman. All rights reserved.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
