'use client';

import { useRef, useState, FormEvent } from 'react';
import Link from 'next/link';
import Script from 'next/script';



export default function Home() {
  /* ---------------- state + refs ---------------- */
  const formRef = useRef<HTMLFormElement>(null);
  const [apiMsg, setApiMsg] = useState('');
  const [llmMsg, setLlmMsg] = useState('');

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
  }: {
    title: string;
    tags: string;
    topic: string;
    subs: number;
    prob: string;
  }) =>
    `You are a seasoned YouTube growth strategist.\n\n` +
    `Here is a prospective video a creator is about to publish.\n` +
    `• Predicted probability of performing in the top 25 %: ${prob}\n` +
    `• Channel subscriber count: ${subs}\n` +
    `• Video title: "${title}"\n` +
    `• Tags: ${tags}\n` +
    `• Topic: ${topic}\n\n` +
    `First, briefly say whether the probability should encourage them to publish as-is (high), tweak (medium), or rethink (low)…\n\n` +
    `Then give 3-5 concise, actionable suggestions…\n\n` +
    `Keep the total answer under 150 words.`;

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
      setApiMsg('Predicting…');
      setLlmMsg('');

      /* ---- 1) model prediction ---- */
      const mlRes = await fetch(
        `https://youtube-predictor-web-service.onrender.com/predict/${group}`,
        { method: 'POST', body: fd }
      );
      if (!mlRes.ok) throw new Error('Model API error ' + mlRes.status);
      const { probability } = await mlRes.json();
      const probDec = Number(probability).toFixed(2);
      setApiMsg(
        `Predicted viral potential: <strong>${(
          Number(probDec) * 100
        ).toFixed(1)} %</strong>`
      );

      /* ---- 2) Gemini feedback ---- */
      setLlmMsg('Generating advice…');
      const prompt = buildPrompt({ title, tags, topic, subs, prob: probDec });
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!gemRes.ok) throw new Error('Gemini API error ' + gemRes.status);
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
              Upload your pre-publication YouTube video metadata and leverage
              this free, content-tailored feedback model to analyze your video!
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
                  in natural language & image processing combined with a classic machine learning pipeline.
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
                    />
                  </label>
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
              <li>© Rithik Kulkarni. All rights reserved.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
