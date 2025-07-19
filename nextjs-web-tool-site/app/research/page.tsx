import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';

export const metadata = {
  title: 'Research | YouTube Classifier',
};

export default function Research() {
  return (
    <>
      {/* Helper scripts from the original template (keep only if still used) */}
      <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/jquery.scrollex.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/browser.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/breakpoints.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/util.js" strategy="afterInteractive" />
      <Script src="/assets/js/main.js" strategy="afterInteractive" />

      <div id="page-wrapper" className="is-preload">
        {/* ---------- Header ---------- */}
        <header id="header">
          <h1>
            <Link href="/">Back to Home</Link>
          </h1>
        </header>

        {/* ---------- Wrapper ---------- */}
        <section id="wrapper">
          <header>
            <div className="inner">
              <h2>Research</h2>
              <p>How does this tool work?</p>
            </div>
          </header>

          {/* ---------- Content ---------- */}
          <div className="wrapper">
            <div className="inner">
              {/* --- Psychological Background --- */}
              <section>
                <h3 className="major">Psychological Background</h3>
                <p>
                  The psychological impact of thumbnails and titles plays a
                  critical role in shaping viewer behavior on YouTube.
                  Visual features like brightness, edge density, and color
                  contrast capture attention by leveraging principles of visual
                  saliency—our brains are hard-wired to notice high-contrast or
                  detailed areas quickly. Titles, meanwhile, trigger cognitive
                  biases through emotional language, urgency, or curiosity—such
                  as in the use of clickbait phrasing or questions—which tap
                  into the psychological phenomenon known as the “curiosity
                  gap.” These elements influence not only whether users notice a
                  video but whether they feel compelled to click, making them
                  central to predicting virality and optimizing content
                  performance before a video is even published.
                </p>
                <blockquote>
                  <strong>
                    The visual complexity of an image, as perceived by edge
                    density and local color contrast, increases the likelihood
                    of gaze fixation in the first few milliseconds.
                  </strong>
                  <br />- Nuthmann & Henderson, 2010
                </blockquote>
              </section>

              {/* --- Important Feature Genres --- */}
              <section>
                <h3 className="major">Important Feature Genres</h3>
                <div className="row">
                  <div className="col-4 col-12-medium">
                    <h4>Visual Features</h4>
                    <ul>
                      <li>RGB</li>
                      <li>Brightness</li>
                      <li>Contrast</li>
                      <li>Dominant Color Hue</li>
                      <li>Thumbnail Edge Density</li>
                    </ul>
                  </div>
                  <div className="col-4 col-12-medium">
                    <h4>Text Features</h4>
                    <ul>
                      <li>Sentiment</li>
                      <li>Length</li>
                      <li>Capitalization / Punctuation</li>
                      <li>Clickbait Score</li>
                      <li>Readability</li>
                    </ul>
                  </div>
                </div>

                <h4>Clickbait Score Calculation</h4>
                <pre>
                  <code>{`def compute_clickbait_score(text: str) -> float:
    clickbait_words = {
        "amazing", "shocking", "unbelievable", "top", "ultimate", "must",
        "insane", "you won't believe", "secret", "revealed", "hack"
    }
    words = text.split()
    clickbait_score = sum(word.lower() in clickbait_words for word in words)
    return clickbait_score`}</code>
                </pre>
                <p>
                  The clickbait score is a simple metric that counts the number
                  of clickbait words in a given text. It can be useful for
                  identifying potentially misleading or sensational content.
                </p>

                <h4>Readability Score Calculation</h4>
                <pre>
                  <code>{`def flesch_reading_ease(text):
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    words = re.findall(r'\\w+', text)
    num_sentences = max(1, len(sentences))
    num_words = max(1, len(words))
    num_syllables = sum(count_syllables(word) for word in words)

    asl = num_words / num_sentences  # Average sentence length
    asw = num_syllables / num_words  # Average syllables per word

    # Flesch Reading Ease formula
    score = 206.835 - (1.015 * asl) - (84.6 * asw)
    return round(score, 2)`}</code>
                </pre>
                <p>
                  The Flesch Reading Ease score is a widely used readability
                  test that evaluates the complexity of English texts. It
                  considers the average sentence length and the average number
                  of syllables per word to produce a score between 0 and 100,
                  where higher scores indicate easier readability.
                </p>
              </section>

              {/* --- Training Data --- */}
              <section>
                <h3 className="major">Training Data</h3>
                <p>
                  The training data consists of over 100,000 YouTube videos
                  taken from channels serving a broad variety of genres in each
                  significant subscriber range that have been
                  judged by human experts to be “reliant on the YouTube
                  algorithm.” This ensures the model learns from content aiming
                  to optimize for virality and engagement rather than content
                  that performs purely due to an already-established audience or
                  brand.
                </p>

                {/* <h4 style={{ textAlign: 'center', width: '100%' }}>
                  Training Channels
                </h4>

                <div
                  className="row"
                  style={{ display: 'flex', flexWrap: 'wrap' }}
                >
                  <div
                    className="col-3 col-12-medium"
                    style={{ flex: '1 1 0' }}
                  >
                    <ul>
                      <li>French Cooking Academy</li>
                      <li>Cooking Buddies</li>
                      <li>Glock9</li>
                      <li>Phisnom</li>
                      <li>BrainCraft</li>
                      <li>Jordan Harrod</li>
                    </ul>
                  </div>
                  <div
                    className="col-3 col-12-medium"
                    style={{ flex: '1 1 0' }}
                  >
                    <ul>
                      <li>Nostalgia Nerd</li>
                      <li>EEVblog</li>
                      <li>Lainey Ostrom</li>
                      <li>Kristin Johns</li>
                      <li>iGoBart</li>
                      <li>Ghib Ojisan</li>
                    </ul>
                  </div>
                  <div
                    className="col-3 col-12-medium"
                    style={{ flex: '1 1 0' }}
                  >
                    <ul>
                      <li>Vo2maxProductions</li>
                      <li>Heather Robertson</li>
                      <li>Alexrainbirdmusic</li>
                      <li>Megan Davies</li>
                      <li>The Valleyfolk</li>
                      <li>Chris Fleming</li>
                    </ul>
                  </div>
                  <div
                    className="col-3 col-12-medium"
                    style={{ flex: '1 1 0' }}
                  >
                    <ul>
                      <li>Xyla Foxlin</li>
                      <li>Potholer54</li>
                      <li>Rule1Investing</li>
                      <li>Ben Felix</li>
                      <li>Griffon Ramsey</li>
                      <li>Proko</li>
                    </ul>
                  </div>
                </div> */}
              </section>

              {/* --- Model Architecture --- */}
              <section>
                <h3 className="major">Model Architecture</h3>
                <p>
                  The model supporting this tool's insights is trained to
                  recognize patterns in pre-publication metadata that correlate
                  with higher likelihoods of content performance. It leverages a
                  Random Forest classifier enhanced with SMOTE (Synthetic
                  Minority Oversampling Technique) to address class imbalance
                  while focusing on psychologically and behaviorally relevant
                  features.
                </p>

                <div
                  className="row"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    className="col-6 col-12-medium"
                    style={{
                      flex: '1 1 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <h4 style={{ textAlign: 'center' }}>
                      Random Forest Classifier
                    </h4>
                    <Image
                      src="/images/randomforestdiagram.jpg"
                      alt="Random Forest Diagram"
                      width={800}
                      height={450}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                  <div
                    className="col-6 col-12-medium"
                    style={{
                      flex: '1 1 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <h4 style={{ textAlign: 'center' }}>SMOTE</h4>
                    <Image
                      src="/images/smotevisual.JPG"
                      alt="SMOTE Diagram"
                      width={800}
                      height={450}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
