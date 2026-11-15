import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed it recently in this session/browser
    const dismissedAt = localStorage.getItem('shreedev_pwa_dismissed');
    if (dismissedAt) {
      const hoursPassed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        // Don't disturb user repeatedly within 24 hours
        return;
      }
    }

    // 3. Android / Chrome / Edge 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Safari Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Wait 3 seconds on first load to gently show the install hint
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert("To install, tap your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home Screen'.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('shreedev_pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIosGuide(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Bottom Floating App Install Banner */}
      <aside aria-label="App Installation" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-50 bg-[#172B4D] text-white p-4 rounded-sm shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Install Mobile App
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
              Install <strong>ShreeDev Paint SaaS</strong> on your phone for 1-tap offline access, fast attendance & notifications!
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
                className="px-2.5 py-1.5 text-white/70 hover:text-white text-xs font-medium"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Instructions Modal */}
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
                <span>Safari browser me neeche <strong>Share</strong> icon (box with upward arrow) par tap karein.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-navy">2.</span>
                <span>Scroll karke <strong>'Add to Home Screen'</strong> (होम स्क्रीन में जोड़ें) select karein.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-navy">3.</span>
                <span>Upar right side me <strong>'Add'</strong> par click karein. App aapke home screen par aa jayega!</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
