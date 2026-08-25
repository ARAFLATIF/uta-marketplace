'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!email.toLowerCase().endsWith('@mavs.uta.edu')) {
      setStatus('error');
      setErrorMsg('Only @mavs.uta.edu emails can log in to Mavs Marketplace.');
      return;
    }

    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="font-display text-2xl text-mavs-navy mb-2">Log in</h1>
      <p className="text-gray-600 mb-6 text-sm">
        We'll email you a magic link — no password needed. Only{' '}
        <span className="font-semibold">@mavs.uta.edu</span> addresses work.
      </p>

      {status === 'sent' ? (
        <div className="bg-white border border-mavs-blue/30 rounded p-4 text-sm">
          Check <strong>{email}</strong> for a login link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="yourname@mavs.uta.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mavs-blue"
          />
          {status === 'error' && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-mavs-blue text-white rounded py-2 font-semibold hover:bg-mavs-navy transition disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending link…' : 'Send magic link'}
          </button>
        </form>
      )}
    </div>
  );
}
