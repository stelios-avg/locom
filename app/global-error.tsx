'use client'

/**
 * Catches errors in the root layout (e.g. missing Supabase env when creating the client).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const msg = error?.message ?? ''
  const missingSupabase =
    msg.includes('NEXT_PUBLIC_SUPABASE') ||
    msg.includes('required!') ||
    msg.includes('MISSING_SUPABASE_ENV') ||
    msg.includes('supabaseUrl')

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1 style={{ fontSize: 20 }}>Application error</h1>
        {missingSupabase ? (
          <div style={{ maxWidth: 560, lineHeight: 1.6 }}>
            <p>
              <strong>Supabase δεν είναι ρυθμισμένο στο Vercel.</strong>
            </p>
            <p>Στο Vercel → Project → Settings → Environment Variables (επίλεξε <strong>Production</strong>):</p>
            <ul>
              <li>
                <code>NEXT_PUBLIC_SUPABASE_URL</code> — Project URL από Supabase
              </li>
              <li>
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — μόνο το <strong>Publishable / anon</strong> κλειδί, όχι το secret
              </li>
            </ul>
            <p>Μετά κάνε <strong>Redeploy</strong> το deployment.</p>
          </div>
        ) : (
          <p style={{ color: '#444' }}>{msg || 'Unknown error'}</p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            padding: '10px 16px',
            cursor: 'pointer',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
