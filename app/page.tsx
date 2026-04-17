import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#e53935', fontSize: '2rem', margin: 0 }}>
          🩸 RedReach
        </h1>
        <Link href="/login" style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2196f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Login
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
          Connect Blood Donors with Those in Need
        </p>
        <p style={{ fontSize: '1.1rem', color: '#888' }}>
          Save lives by donating blood or finding donors near you
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            border: '2px solid #e53935',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ color: '#e53935', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Register as Donor
            </h2>
            <p style={{ color: '#666' }}>
              Sign up as a blood donor and save lives
            </p>
          </div>
        </Link>

        <Link href="/request" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            border: '2px solid #ff9800',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
            <h2 style={{ color: '#ff9800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Request Blood
            </h2>
            <p style={{ color: '#666' }}>
              Submit urgent blood requests
            </p>
          </div>
        </Link>

        <Link href="/donors" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            border: '2px solid #4caf50',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ color: '#4caf50', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Find Donors
            </h2>
            <p style={{ color: '#666' }}>
              Search for blood donors near you
            </p>
          </div>
        </Link>

        <Link href="/eligibility" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            border: '2px solid #2196f3',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>
            <h2 style={{ color: '#2196f3', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Check Eligibility
            </h2>
            <p style={{ color: '#666' }}>
              Check if you're eligible to donate
            </p>
          </div>
        </Link>
      </div>

      <div style={{
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>About RedReach</h2>
        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
          RedReach is a blood donation management system that connects blood donors with those in need.
          Our platform makes it easy to register as a donor, request blood in emergencies, find donors
          near you, and check your donation eligibility. Together, we can save lives.
        </p>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        borderLeft: '4px solid #2196f3'
      }}>
        <h3 style={{ color: '#1565c0', marginBottom: '0.5rem' }}>📱 PWA Features</h3>
        <p style={{ color: '#666', margin: 0 }}>
          RedReach works offline and can be installed on your device for quick access.
        </p>
      </div>
    </main>
  );
}
