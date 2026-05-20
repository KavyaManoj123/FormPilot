'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/auth-layout';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your account">
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={() => toast('Forgot password coming soon 🚀')}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Forgot Password?
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 p-3 font-semibold text-white transition hover:bg-cyan-400"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-cyan-400">
          Register
        </a>
      </p>
    </AuthLayout>
  );
}
