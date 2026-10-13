import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { Database, CheckCircle2, Info, X, ExternalLink, HelpCircle, Server } from 'lucide-react';

export const BackendSetupBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('skbrand_dismiss_setup') === 'true';
    } catch {
      return false;
    }
  });
  const [showModal, setShowModal] = useState<boolean>(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('skbrand_dismiss_setup', 'true');
    } catch {}
  };

  return (
    <>
      <aside
        aria-label="Backend status notice"
        className="bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px] px-4 py-2"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Connected to Supabase Cloud PostgreSQL.
              </span>
            ) : (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                  Active Backend: Local Persistent Database
                </span>
                <span className="text-slate-400">
                  Storefront & Admin are live with full product catalog, COD checkout, and order tracking.
                </span>
                <button
                  onClick={() => setShowModal(true)}
                  className="underline text-sky-400 hover:text-sky-300 cursor-pointer font-medium ml-1"
                >
                  Configure Cloud Supabase
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Cloud Supabase Setup Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 text-slate-800 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-base text-slate-900">SK BRAND Database Architecture</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Local Persistent Engine is Active
                </div>
                <p className="text-emerald-950">
                  The storefront is fully operational with real database tables in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">data/skbrand.sqlite</code>. Products, categories, COD orders, coupons, and the Admin Dashboard work immediately out of the box.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-sky-500" />
                  Optional: Connecting Cloud Supabase
                </h4>
                <p>
                  To sync with an external Cloud Supabase project instead of the local persistent engine, add these environment variables to your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
