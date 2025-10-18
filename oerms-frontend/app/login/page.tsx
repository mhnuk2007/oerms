"use client";

import { useState } from 'react';
import { saveToken } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      const token = res.data.token;
      saveToken(token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Login failed');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
