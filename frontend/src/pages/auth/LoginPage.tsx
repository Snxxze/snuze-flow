import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/projects');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || t('auth.login_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded border border-surface-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Wave Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded bg-charcoal shadow-sm">
            <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
              <path
                d="M2 15C5 9 8 21 11 15C14 9 17 21 20 15C21.5 12 23.5 12 24 13"
                stroke="#1489b4"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h1 className="mt-4 font-display font-semibold text-2xl text-charcoal">{t('auth.login_welcome')}</h1>
          <p className="mt-1 text-sm text-charcoal-subtle">{t('auth.login_sub')}</p>
        </div>

        {error && (
          <div className="mt-4 rounded bg-status-danger/10 p-3 text-xs font-medium text-status-danger border border-status-danger/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">{t('auth.email_label')}</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">{t('auth.password_label')}</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 text-sm font-medium"
          >
            {isSubmitting ? t('auth.logging_in') : t('auth.login_btn')}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-subtle">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-medium text-ocean hover:underline">
            {t('auth.register_here')}
          </Link>
        </div>
      </div>
    </div>
  );
};
