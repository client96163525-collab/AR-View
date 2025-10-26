
import React from 'react';
import { LockClosedIcon } from './icons';

interface PasswordProtectionProps {
  onCorrectPassword: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onCorrectPassword }) => {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0101') {
      onCorrectPassword();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl p-8 space-y-6">
          <div className="text-center">
             <LockClosedIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Access Required</h1>
            <p className="text-slate-400 mt-2">Please enter the password to continue.</p>
          </div>
          
          <div>
            <label htmlFor="password-input" className="sr-only">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-center text-lg tracking-widest focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="••••"
              autoFocus
            />
          </div>
          
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={!password}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;
