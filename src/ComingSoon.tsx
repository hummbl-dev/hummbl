import React from 'react';

/**
 * Coming Soon landing page - self-contained with inline styles
 * No external CSS dependencies
 */
const ComingSoon: React.FC = () => {
  const styles = {
    comingSoon: {
      minHeight: '100vh',
      background: '#ffffff',
      color: '#1f2937',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    },
    header: {
      textAlign: 'center' as const,
      padding: '4rem 0 3rem',
    },
    logo: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginBottom: '0.5rem',
      color: '#1f2937',
    },
    tagline: {
      fontSize: '1.25rem',
      color: '#6b7280',
      marginBottom: '2rem',
    },
    status: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#6b7280',
      marginBottom: '1rem',
    },
    section: {
      margin: '3rem 0',
      padding: '2rem 0',
      borderTop: '1px solid #e5e7eb',
    },
    h2: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      color: '#1f2937',
    },
    p: {
      marginBottom: '1rem',
      color: '#6b7280',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    highlight: {
      background: '#fef3c7',
      padding: '1.5rem',
      borderLeft: '3px solid #f59e0b',
      borderRadius: '0.25rem',
      margin: '1.5rem 0',
    },
    ctaButton: {
      display: 'inline-block',
      padding: '0.75rem 1.5rem',
      background: '#f9fafb',
      color: '#6b7280',
      textDecoration: 'none',
      borderRadius: '0.5rem',
      fontWeight: 500,
      border: '1px solid #e5e7eb',
      cursor: 'not-allowed',
      marginTop: '1rem',
    },
    links: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      marginTop: '1.5rem',
    },
    researchLink: {
      flex: '1',
      minWidth: '250px',
      padding: '1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: '#1f2937',
      transition: 'border-color 0.2s',
    },
    researchLinkH3: {
      fontSize: '1.125rem',
      marginBottom: '0.5rem',
      color: '#1f2937',
    },
    researchLinkP: {
      fontSize: '0.875rem',
      margin: 0,
      color: '#6b7280',
    },
    bio: {
      background: '#f9fafb',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginTop: '1.5rem',
    },
    bioH3: {
      fontSize: '1.25rem',
      marginBottom: '0.5rem',
      color: '#1f2937',
    },
    bioTitle: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    contactLinks: {
      display: 'flex',
      gap: '1.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap' as const,
    },
    contactLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '0.875rem',
    },
    location: {
      color: '#6b7280',
      fontSize: '0.875rem',
    },
    footer: {
      textAlign: 'center' as const,
      padding: '3rem 0 2rem',
      color: '#6b7280',
      fontSize: '0.875rem',
    },
    footerLinks: {
      marginTop: '0.5rem',
    },
    separator: {
      margin: '0 0.5rem',
      color: '#e5e7eb',
    },
  } as const;

  const handleWhitepaperClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Whitepaper coming soon! Check back in 24-48 hours.');
  };

  return (
    <div style={styles.comingSoon}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>HUMMBL</div>
          <div style={styles.tagline}>Executable Mental Models for Engineers</div>
          <div style={styles.status}>Coming Soon - Launch Q1 2026</div>
        </header>

        <section style={styles.section}>
          <h2 style={styles.h2}>What is HUMMBL?</h2>
          <p style={styles.p}>
            Engineering decisions are complex. Mental models help, but they're typically just
            descriptions of how to think—not tools you can actually run.
          </p>
          <p style={styles.p}>
            HUMMBL changes that. We're building algorithmic implementations of 120 mental models
            across six transformations (Perspective, Inversion, Composition, Decomposition,
            Recursion, Meta-Systems) that decompose problems, identify failure modes, and
            compose solutions systematically.
          </p>
          <p style={styles.p}>
            <strong>Not just ideas. Actual code that runs.</strong>
          </p>

          <div style={styles.highlight}>
            <strong>Research Progress:</strong> First operator validated at 9.2/10 utility score.
            Framework entering structured research and validation phase.
          </div>

          <a href="#" style={styles.ctaButton} onClick={handleWhitepaperClick}>
            Read the Whitepaper (Coming Soon)
          </a>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Research in Progress</h2>
          <p style={styles.p}>
            HUMMBL is currently in active research and validation phase. Follow along with
            our open research as we validate each transformation operator.
          </p>

          <div style={styles.links}>
            <a
              href="https://github.com/hummbl-dev/hummbl-research"
              style={styles.researchLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 style={styles.researchLinkH3}>📚 Framework Documentation</h3>
              <p style={styles.researchLinkP}>
                120 mental models, validation studies, case studies, and research portfolio
              </p>
            </a>

            <a
              href="https://github.com/hummbl-dev/hummbl-prototype"
              style={styles.researchLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 style={styles.researchLinkH3}>⚡ Prototype Implementation</h3>
              <p style={styles.researchLinkP}>
                Python research code with 98.2% test coverage and operational CI/CD
              </p>
            </a>
          </div>

          <div style={{ ...styles.links, marginTop: '1rem' }}>
            <a
              href="https://github.com/hummbl-dev/hummbl-research/blob/main/validation/decomposition-study-2025.md"
              style={styles.researchLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 style={styles.researchLinkH3}>✅ Latest Validation Study</h3>
              <p style={styles.researchLinkP}>
                Decomposition operator: 9.2/10 utility score (production-ready)
              </p>
            </a>

            <a
              href="https://github.com/hummbl-dev/hummbl-research/blob/main/validation/inversion-study-2025.md"
              style={styles.researchLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 style={styles.researchLinkH3}>⚠️ Baseline Implementation</h3>
              <p style={styles.researchLinkP}>
                Inversion operator: 3.6/10 baseline (refinements in progress)
              </p>
            </a>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>About</h2>

          <div style={styles.bio}>
            <h3 style={styles.bioH3}>Reuben Bowlby</h3>
            <div style={styles.bioTitle}>Chief Engineer, HUMMBL LLC</div>

            <p style={styles.p}>
              18+ months developing the HUMMBL framework through systematic research and validation.
              Background in systematic thinking, cognitive frameworks, and AI system coordination.
            </p>

            <p style={styles.p}>
              Currently serving as Dynamic Personal Trainer at Life Time, Inc. while building
              HUMMBL's commercialization infrastructure.
            </p>

            <div style={styles.contactLinks}>
              <a
                href="https://twitter.com/ReubenBowlby"
                style={styles.contactLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter/X
              </a>
              <a href="mailto:reuben@hummbl.io" style={styles.contactLink}>
                reuben@hummbl.io
              </a>
              <a
                href="https://github.com/hummbl-dev"
                style={styles.contactLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <span style={styles.location}>Atlanta, GA</span>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <p style={{ margin: 0 }}>© 2025 HUMMBL, LLC. All rights reserved.</p>
          <p style={styles.footerLinks}>
            <a
              href="https://github.com/hummbl-dev/hummbl-research"
              style={styles.contactLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Research Portfolio
            </a>
            <span style={styles.separator}>|</span>
            <a href="mailto:reuben@hummbl.io" style={styles.contactLink}>
              Contact
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ComingSoon;
