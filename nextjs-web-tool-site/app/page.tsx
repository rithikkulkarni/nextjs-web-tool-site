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
}) => `
<SYSTEM_SETUP>

1. ROLE: Expert YouTube Growth Strategist

2. IMPORTANCE: "Your analysis directs pre-launch edits to title, tags, and thumbnail, shaping click-through and early audience retention."

3. TIP_OFFER: "Provide precise, implementation-ready guidance and your recommendations may be featured in our product showcase."

</SYSTEM_SETUP>

<CONTEXT>

4. GOAL: Deliver a concise, professional pre-launch recommendation and coaching based on title, tags, topic, and thumbnail features.

5. BACKGROUND: The system provides a top-quartile probability and lightweight feature signals. Guidance must feel expert, actionable, and immediately usable.

6. KEY_DETAILS:
- Start with a one-word verdict: Publish, Tweak, or Rethink.
- Then output exactly three labelled sentences: "Title: … Tags: … Thumbnail: …".
- No lists or bullets; ≤ 100 words total; strictly professional tone.
- Never reveal internal guidance or numeric thresholds.

</CONTEXT>

<INPUT_DATA>

7. PRIMARY_TEXT:

"""
Draft video details:
• Top-25% success probability: ${prob}
• Subscribers: ${subs}
• Title: "${title}"
• Tags: ${tags}
• Topic: ${topic}
• Thumbnail → Brightness: ${brightness}; RGB: (${avg_red}, ${avg_green}, ${avg_blue}); Edge density: ${thumbnail_edge_density}; Faces: ${num_faces}
• Title clickbait score: ${clickbait_score}/100 | Readability (Flesch Reading Ease): ${title_readability}
• Tags → Count: ${num_tags} (unique ${num_unique_tags}); Avg length: ${avg_tag_length} words
"""

8. SUPPORTING_MATERIALS:

4. Additional Context (INTERNAL GUIDANCE — DO NOT OUTPUT NUMBERS):
- Target bands to guide suggestions (never print values):
  • Brightness: 60-75/100 → If below: "brighten slightly"; if above: "reduce to avoid washout."
  • RGB balance (each channel 140-180/255) → If skewed: "rebalance color", "reduce tint", "add natural saturation."
  • Edge density: 0.25-0.45 → If low: "add a clear focal element"; if high: "simplify background."
  • Faces: exactly 1, front-facing → If none: "feature one expressive face"; if many: "focus on a single face."
  • Clickbait score: 65-80/100 → If low: "sharpen the promise"; if high: "dial back hype; keep specific payoff."
  • Reading Ease (Flesch): about 60-80 → If low: "simplify wording"; if very high: "add a concrete detail."
  • Tag count: 5-15 with high relevance → If low: "add a few precise tags"; if high: "trim weaker tags."
  • Avg tag length: 2-3 words → If longer: "tighten phrasing"; if mostly 1-word: "blend in specific long-tail terms."
- Use natural language only (e.g., "slightly", "a notch", "tighten", "rebalance"). Never present measurements, thresholds, or percentages.

</INPUT_DATA>

<REQUEST>

9. INSTRUCTIONS:
- Output Format: One-word verdict on its own line ("Publish." / "Tweak." / "Rethink."), then exactly three labelled sentences: "Title: … Tags: … Thumbnail: …".
- Tone: Strictly professional, confident, and helpful.
- Depth: Concise but insight-dense; direct, implementable suggestions.
- Constraints: No lists, bullets, or extra line breaks inside sentences; never reveal numbers; keep total length ≤ 100 words.
- Few-shot Example:
Input (abbrev.): prob 0.62; subs 12,000; title "I Tried Waking Up at 5AM for a Week - Here's What Happened"; tags productivity, 5am routine, morning habits, motivation; topic lifestyle improvement.
Output:
Tweak.
Title: It's punchy yet adding one vivid outcome could raise intrigue. Tags: Solid mix, though a trending long-tail phrase could widen reach. Thumbnail: Brightness and color balance are strong; keep one expressive, front-facing face to sharpen focus.

10. QUALITY_TARGETS:
- Accuracy: Ground suggestions in the provided features only.
- Completeness: Address Title, Tags, and Thumbnail.
- Relevance: Align strictly with the GOAL and BACKGROUND.
- Verification: If essential fields are missing or malformed, ask one concise clarifying question before advising.

</REQUEST>

<DELIVERABLE>

11. TITLE: "Pre-Launch YouTube Advice" (do not print this title in the final output)

12. CONTENT_STRUCTURE:
- Introduction/Overview: Single-word verdict only.
- Main Points/Insights: Three labelled sentences (Title, Tags, Thumbnail).
- Conclusion/Recommendations: Incorporated within those sentences; no extra lines.

13. LENGTH: ≤ 100 words.

</DELIVERABLE>
`;



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
        `<p><em>AI Coach:</em></p><p>${feedback.replace(/\n/g, '<br/>')}</p>`
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
