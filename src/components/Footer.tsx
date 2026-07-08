import { SrecLogo } from './SrecLogo';

interface FooterProps {
  srecUrl?: string;
  copyright?: string;
  sponsor?: string;
}

export default function Footer({ srecUrl, copyright, sponsor }: FooterProps) {
  const defaultCopyright = `© 2027  Sri Ramakrishna Engineering College. All rights reserved.`;
  const defaultSponsor = "Sponsored by SNR Sons Charitable Trust | Approved by AICTE | Affiliated to Anna University | Accredited by NBA & NAAC with 'A+' Grade";

  return (
    <footer style={{
      background: 'var(--bg-deep, #091d36)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '3rem 0',
      textAlign: 'center',
      position: 'relative',
      zIndex: 5,
      width: '100%'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <a 
          href={srecUrl || "https://srec.ac.in/"} 
          target="_blank" 
          rel="noopener noreferrer"
          title="Sri Ramakrishna Engineering College"
          style={{ display: 'inline-flex', textDecoration: 'none', margin: '0 auto 1.5rem', justifyContent: 'center' }}
        >
          <SrecLogo lightText={true} className="justify-center" style={{ justifyContent: 'center' }} />
        </a>
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginBottom: '0.5rem', marginInline: 'auto', fontWeight: 500 }}>
          {copyright || defaultCopyright}
        </p>
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem', marginInline: 'auto', opacity: 0.8 }}>
          {sponsor || defaultSponsor}
        </p>
      </div>
    </footer>
  );
}
