import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(150deg, #faf5f0 0%, #fef5f5 45%, #fff9f5 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#dc2626',
          lineHeight: 1,
          marginBottom: '24px',
          textShadow: '0 4px 20px rgba(220,38,38,0.2)'
        }}>
          404
        </div>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1A0F0A',
          marginBottom: '16px',
          fontFamily: 'serif'
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#5c2a2a',
          lineHeight: 1.6,
          marginBottom: '40px',
          maxWidth: '400px',
          margin: '0 auto 40px'
        }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              background: '#dc2626',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '14px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}
          >
            Go to Home
          </Link>
          
          <Link
            href="/dashboard"
            style={{
              background: '#FDFAF4',
              color: '#dc2626',
              padding: '14px 32px',
              borderRadius: '14px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              border: '2px solid #dc2626',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}
          >
            Dashboard
          </Link>
        </div>

        <div style={{ marginTop: '48px' }}>
          <p style={{ fontSize: '14px', color: '#7a4040', marginBottom: '16px' }}>
            Or try these popular pages:
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/donor-search" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px' }}>
              Find Donors
            </Link>
            <Link href="/request" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px' }}>
              Request Blood
            </Link>
            <Link href="/eligibility" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px' }}>
              Check Eligibility
            </Link>
            <Link href="/register" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px' }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
