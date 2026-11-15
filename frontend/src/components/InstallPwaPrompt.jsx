import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. If running as installed standalone app, never show install prompt
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. Capture 'beforeinstallprompt' event for Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Fallback: Always display floating prompt after 1.5 seconds if not in standalone
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIos(true);
    }

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Browser didn't fire beforeinstallprompt (e.g. desktop browser or already visited)
      alert("App install karne ke liye browser menu (3 dots ⋮ ya Share icon) par click karke 'Install App' ya 'Add to Home Screen' select karein.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Bottom Floating App Install Banner */}
      <aside 
        aria-label="App Installation" 
        className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-50 bg-[#172B4D] text-white p-4 rounded-sm shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Download & Install App
              </h4>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white p-1 -mr-1 -mt-1 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-white/80 mt-1 leading-snug">
              Apne phone ya laptop me <strong>KaamSetu App</strong> direct install karein fast attendance aur hisab ke liye.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#172B4D] hover:bg-slate-100 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 text-white/70 hover:text-white text-xs font-medium cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guidance Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white text-navy p-6 rounded-sm max-w-sm w-full space-y-4 border border-surface-border shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-navy">
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-surface-secondary">
              <div className="flex items-start gap-2">
                <span className="font-bold text-navy">1.</span>
                <span>Safari browser me neeche <strong>Share</strong> icon (square box with arrow) par tap karein.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-navy">2.</span>
                <span>List me scroll karke <strong>'Add to Home Screen'</strong> (होम स्क्रीन में जोड़ें) select karein.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-navy">3.</span>
                <span>Upar right corner me <strong>'Add'</strong> dabayein. App install ho jayega!</span>
              </div>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded-sm"
            >
              Theek Hai, Samajh Gaya
            </button>
          </div>
        </div>
      )}
    </>
  );
}
