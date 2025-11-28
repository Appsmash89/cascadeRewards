'use client';
import { Suspense } from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <Suspense>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f7f8fa',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        404 — Page Not Found
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#555' }}>
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/">
        <button style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4a6cf7',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          Go Home
        </button>
      </Link>
    </div>
    </Suspense>
  );
}
