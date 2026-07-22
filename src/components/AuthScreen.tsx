import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  LineChart, 
  Lightbulb, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle,
  TrendingDown,
  Sun
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setShowSetupHelp(false);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !displayName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
        setInfoMessage('Account created successfully! Redirecting...');
        // Small delay to let updateProfile settle
        setTimeout(() => {
          onAuthSuccess(userCredential.user);
        }, 800);
      } else {
        // Sign in flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let friendlyMessage = 'An unexpected error occurred during authentication. Please try again.';
      if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Authentication is not yet enabled in your Firebase project. Please enable Email/Password provider in the Firebase Console.';
        setShowSetupHelp(true);
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email address is already in use by another user.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'The email address is formatted incorrectly.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'The password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Incorrect email address or password. Please verify your details.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setError(null);
    setShowSetupHelp(false);
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      // Give a dummy name
      await updateProfile(userCredential.user, {
        displayName: 'Guest Advisor'
      });
      onAuthSuccess(userCredential.user);
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Anonymous Authentication is currently disabled. Please enable Anonymous provider in the Firebase Console.');
        setShowSetupHelp(true);
      } else {
        setError('Failed to log in as Guest. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background soft gradients */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] rounded-full bg-emerald-50/60 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Editorial Landing & Info Panel */}
        <div className="md:col-span-7 space-y-6 pr-0 md:pr-6 text-left">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md relative overflow-hidden">
              <Zap className="h-6 w-6 text-amber-300 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 to-emerald-500 opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-neutral-900 tracking-tight">WattSmart Naija</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0">AI-Powered</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">Empowering Nigerian Homes & SMEs. Know your usage, save cost.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight">
              Conquer Nigerian Rate Hikes & Generator Fuel Bills
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-lg">
              With current petrol prices scaling and Band A electricity tariffs expanding, Wattsmart Nigeria models your real-world appliance matrix to unlock massive saving pathways.
            </p>
          </div>

          {/* High Value Features */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/60">
                <TrendingDown className="h-4.5 w-4.5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-800">Grid Tariff & Band Optimizers</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Model Band A, B, C, D, and E hourly schedules to optimize grid-vs-generator consumption balances.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/60">
                <Sun className="h-4.5 w-4.5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-800">Precision Solar & Inverter Hybrid Design</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Get mathematically sized solar arrays, lithium battery capacities, and calculated capital return schedules in Naira.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/60">
                <Sparkles className="h-4.5 w-4.5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-800">AI-Powered Audits & Smart Scenario Vault</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Generate tailored efficiency reports via Gemini AI, store distinct scenarios on Cloud Firestore, and consult our 24/7 Energy Advisory Chat.</p>
              </div>
            </div>

          </div>

          {/* Statistics highlight */}
          <div className="p-4 rounded-xl bg-white border border-neutral-100/80 flex items-center gap-4 shadow-sm max-w-md">
            <div>
              <span className="text-2xl font-black text-emerald-700 block">Up to 55%</span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Average Monthly Saving</span>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div>
              <span className="text-2xl font-black text-neutral-800 block">12-Month</span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Solar Payback Horizon</span>
            </div>
          </div>

        </div>

        {/* Right Side: Registration / Sign In Form */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl p-6 sm:p-8 relative">
            
            {/* Header / Tabs */}
            <div className="flex border-b border-neutral-100 pb-4 mb-6">
              <button
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  !isRegister 
                    ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  isRegister 
                    ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-neutral-800">
                {isRegister ? 'Set up your energy profile' : 'Welcome back to Advisor Console'}
              </h2>
              <p className="text-xs text-neutral-500 leading-normal">
                {isRegister 
                  ? 'Sign up to build appliance matrices, model generator cycles, and generate custom solar payback reports.'
                  : 'Log in to access your stored scenario audits and private energy savings profile.'
                }
              </p>
            </div>

            {/* Notifications / Alerts */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Real Authentication Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">Your Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="input-reg-name"
                      placeholder="e.g., Abubakar Otun"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="input-auth-email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    id="input-auth-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-400"
                  />
                </div>
                {!isRegister && (
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-neutral-400 hover:text-emerald-700 cursor-not-allowed">Forgot Password?</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>{isRegister ? 'Register & Get Started' : 'Sign In to Console'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Or Divider */}
            <div className="my-5 flex items-center justify-between">
              <span className="border-b border-neutral-100 flex-grow" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 shrink-0">OR</span>
              <span className="border-b border-neutral-100 flex-grow" />
            </div>

            {/* Quick Demo Mode */}
            <button
              type="button"
              id="btn-auth-guest"
              onClick={handleGuestAccess}
              disabled={loading}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all border border-neutral-200/50 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-neutral-500" />
              <span>Explore as Guest (No Password)</span>
            </button>

            {showSetupHelp && (
              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="p-1 rounded-full bg-amber-100 text-amber-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>How to fix this in your Firebase Console:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 leading-relaxed">
                  <li>Go to your <strong className="text-amber-950">Firebase Console</strong>.</li>
                  <li>In the left sidebar, click on <strong className="text-amber-950">Authentication</strong>.</li>
                  <li>Click on the <strong className="text-amber-950">Sign-in method</strong> tab.</li>
                  <li>Under <strong className="text-amber-950">Sign-in providers</strong>, enable:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-[10px]">
                      <li><strong className="text-amber-950">Email/Password</strong> (for normal registration)</li>
                      <li><strong className="text-amber-950">Anonymous</strong> (for Guest exploration)</li>
                    </ul>
                  </li>
                  <li>Save changes, refresh this browser tab, and try signing in again!</li>
                </ol>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-[10px] text-neutral-400 font-medium">
                Protected by secure 256-bit Firebase Authentication encryption.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
