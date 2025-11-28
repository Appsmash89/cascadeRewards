'use client';

import { useSearchParams } from 'next/navigation';

export default function NotFoundPage() {
  const params = useSearchParams(); // safe: running on client only

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't seem to exist.</p>
      <button
        onClick={() => window.location.href = '/'}
        style={{ marginTop: '20px', padding: '10px 20px' }}
      >
        Go Home
      </button>
    </div>
  );
}
