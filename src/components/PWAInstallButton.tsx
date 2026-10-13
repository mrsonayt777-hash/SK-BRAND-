import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'sidebar' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Install <strong>SK BRAND</strong> App for instant mobile shopping & order tracking</span>
          </div>
          <button
            onClick={install}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3 py-1 rounded text-xs transition"
          >
            Install Now
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
        title="Install SK BRAND on Android / PC"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          title="Install on iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl text-slate-900 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">SK</div>
                <h3 className="text-base font-bold">Install SK BRAND on iOS</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Add SK BRAND to your iPhone or iPad home screen for an app-like experience:
              </p>
              <ol className="text-xs text-slate-700 space-y-2.5 mb-5 list-decimal pl-4">
                <li>Tap the <strong>Share</strong> icon at the bottom of Safari.</li>
                <li>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                <li>Tap <strong>&quot;Add&quot;</strong> at the top right.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — Showing cached catalogue</span>
    </div>
  );
};
