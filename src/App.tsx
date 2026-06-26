import React, { useState, useEffect } from "react";
import { 
  Download, 
  Sparkles, 
  ArrowRight, 
  Info,
  Sliders,
  RefreshCw,
  Zap,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [downloadOpen, setDownloadOpen] = useState<boolean>(false);
  const [discordOpen, setDiscordOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const discordLink = "https://discord.gg/ng7zBJnsxb";

  const [path] = useState(() => window.location.pathname);
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<{ checkpoint1: boolean; checkpoint2: boolean } | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [generatingKey, setGeneratingKey] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(discordLink);
    showToast("Copied Discord invitation link!");
  };

  const handleOpenDiscordDirect = () => {
    window.open(discordLink, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!token) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status?token=${token}`);
        const data = await res.json();
        setTokenStatus(data);
      } catch (e) {
      } finally {
        setLoadingStatus(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const handleGenerateKey = async () => {
    if (!token) return;
    setGeneratingKey(true);
    try {
      const res = await fetch(`/api/genkey?token=${token}`);
      const data = await res.json();
      if (data.success && data.key) {
        setGeneratedKey(data.key);
      }
    } catch (e) {
    } finally {
      setGeneratingKey(false);
    }
  };

  if (path === "/getkey" || searchParams.get("page") === "getkey") {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_65%,transparent_100%)] opacity-40" />
        <div className="relative z-10 w-full max-w-lg">
          <div className="flex flex-col items-center gap-4 mb-8">
            <img src="https://i.ibb.co/Ndy2Wbcn/pearllogo-Photoroom.png" alt="Pearl" className="w-16 h-16 object-contain" />
            <h1 className="text-3xl font-extrabold tracking-tight">Pearl Key System</h1>
            <p className="text-zinc-400 text-xs text-center max-w-sm">Complete checkpoints to generate your 24-hour access key.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6">
            {!token ? (
              <div className="text-center py-4 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold">Invalid Request</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">No token detected. Please launch the Pearl application and click the "Get Key" button to get redirected correctly.</p>
              </div>
            ) : generatedKey ? (
              <div className="text-center py-4 flex flex-col gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Key Generated Successfully!</h2>
                  <p className="text-zinc-400 text-sm">Copy the key below and paste it into your Pearl client.</p>
                </div>
                <div className="p-4 rounded-2xl bg-black border border-zinc-900 flex items-center justify-between gap-4">
                  <span className="font-mono text-sm tracking-widest text-white select-all">{generatedKey}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      showToast("Key copied to clipboard!");
                    }}
                    className="text-xs bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-zinc-400 text-xs">Note: This key will expire in 24 hours. After expiration, you will need to generate a new key.</p>
              </div>
            ) : loadingStatus ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">Loading session status...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="border border-zinc-900 bg-black/45 rounded-2xl p-4 text-zinc-400 text-xs flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>These links contain advertisements. Completing them supports the development of Pearl.</span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className={`p-6 border rounded-2xl transition-all duration-300 ${tokenStatus?.checkpoint1 ? 'border-emerald-900/30 bg-emerald-950/5' : 'border-zinc-900 bg-black/20'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${tokenStatus?.checkpoint1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        Checkpoint 1
                      </h3>
                      <span className="text-xs text-zinc-500">{tokenStatus?.checkpoint1 ? 'Completed' : 'Pending'}</span>
                    </div>
                    {!tokenStatus?.checkpoint1 && (
                      <div className="grid grid-cols-3 gap-2">
                        <a href={`/api/link?checkpoint=1&provider=lootlabs&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">LootLabs</a>
                        <a href={`/api/link?checkpoint=1&provider=linkvertise&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">Linkvertise</a>
                        <a href={`/api/link?checkpoint=1&provider=workink&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">WorkInk</a>
                      </div>
                    )}
                  </div>

                  <div className={`p-6 border rounded-2xl transition-all duration-300 ${tokenStatus?.checkpoint2 ? 'border-emerald-900/30 bg-emerald-950/5' : tokenStatus?.checkpoint1 ? 'border-zinc-900 bg-black/20' : 'border-zinc-950 bg-black/5 opacity-50 pointer-events-none'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${tokenStatus?.checkpoint2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        Checkpoint 2
                      </h3>
                      <span className="text-xs text-zinc-500">{tokenStatus?.checkpoint2 ? 'Completed' : 'Pending'}</span>
                    </div>
                    {tokenStatus?.checkpoint1 && !tokenStatus?.checkpoint2 && (
                      <div className="grid grid-cols-3 gap-2">
                        <a href={`/api/link?checkpoint=2&provider=lootlabs&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">LootLabs</a>
                        <a href={`/api/link?checkpoint=2&provider=linkvertise&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">Linkvertise</a>
                        <a href={`/api/link?checkpoint=2&provider=workink&token=${token}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-center py-2.5 rounded-xl text-xs font-bold transition-colors">WorkInk</a>
                      </div>
                    )}
                  </div>
                </div>

                {tokenStatus?.checkpoint1 && tokenStatus?.checkpoint2 && (
                  <button 
                    onClick={handleGenerateKey}
                    disabled={generatingKey}
                    className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingKey ? 'Generating...' : 'Generate 24h Key'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="pearl-landing-page" className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-x-hidden antialiased">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="toast-notification"
            className="fixed top-8 left-1/2 -translate-x-1/2 z-52 bg-zinc-950 text-white text-xs px-6 py-4 rounded-full border border-zinc-900 shadow-2xl flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="font-semibold tracking-tight">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header id="main-navigation" className="fixed top-4 inset-x-0 z-40 transition-all duration-300 px-4">
        <div className={`max-w-5xl mx-auto rounded-full border transition-all duration-300 px-6 py-2.5 flex items-center justify-between ${scrolled ? "bg-black/90 backdrop-blur-md border-zinc-900 shadow-2xl" : "bg-black/45 backdrop-blur-sm border-zinc-900/60"}`}>
          <a href="#hero-section" id="brand-logo" className="flex items-center gap-3 group">
            <img 
              src="https://i.ibb.co/Ndy2Wbcn/pearllogo-Photoroom.png" 
              alt="Pearl Logo" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <span className="font-extrabold text-xl tracking-tight transition-colors">Pearl</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-neutral-400 font-semibold text-sm">
            <a href="#interface-section" className="hover:text-white transition-colors">Interface</a>
            <a href="#features-section" className="hover:text-white transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              id="top-action-download"
              onClick={() => setDownloadOpen(true)}
              className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm"
            >
              Get Pearl
            </button>
          </div>
        </div>
      </header>

      <section id="hero-section" className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_65%,transparent_100%)] opacity-40 animate-pulse duration-1000" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            id="hero-main-title"
            className="font-bold text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none text-center select-none"
          >
            Pearl
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            id="hero-subtext"
            className="mt-8 text-zinc-400 font-light text-base md:text-lg tracking-wide max-w-xl text-center leading-relaxed"
          >
            The premier high-performance, minimalist script execution utility. Designed with absolute precision, zero visual clutter, and lightning fast responsiveness.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            id="hero-actions"
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button 
              id="hero-btn-download"
              onClick={() => setDownloadOpen(true)}
              className="group w-full sm:w-48 bg-white hover:bg-neutral-200 text-black font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg"
            >
              Download 
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
            </button>
            
            <button 
              id="hero-btn-discord"
              onClick={() => setDiscordOpen(true)}
              className="w-full sm:w-48 border border-zinc-800 hover:border-zinc-500 bg-zinc-950/30 hover:bg-zinc-900/55 text-white font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
            >
              Join Discord
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold tracking-wide text-zinc-400 px-6 py-3 border border-zinc-900 rounded-full bg-zinc-950/40 shadow-sm"
          >
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              Status: unreleased
            </span>
            <span className="text-zinc-800 hidden sm:inline">|</span>
            <span className="text-zinc-400">ver: 0.0.1</span>
          </motion.div>
        </div>
      </section>

      <section id="interface-section" className="py-28 border-t border-zinc-900/85 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="relative group lg:col-span-2">
            <div className="absolute -inset-1 bg-gradient-to-tr from-white/5 to-transparent rounded-[2.5rem] blur-xl opacity-40 pointer-events-none" />
            <img 
              src="/image.png" 
              alt="Pearl User Interface mockup" 
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover rounded-[2rem] border border-zinc-800/80 shadow-2xl filter brightness-[0.75] transition-transform duration-500"
            />
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Interface Highlights</span>
            <h2 className="font-bold text-4xl sm:text-5xl tracking-tight leading-snug text-white">
              Clean, Powerful Interface Design
            </h2>
            <p className="text-zinc-400 font-light leading-relaxed text-sm sm:text-base font-sans">
              Say goodbye to complicated setups, cluttered menus, and aggressive ads. Pearl provides a completely stripped-back, high-contrast, pure dark command window designed to execute whatever script you throw at it in milliseconds.
            </p>

            <div className="p-6 border border-zinc-900 rounded-[2rem] bg-black/40 flex flex-col gap-2.5">
              <span className="text-white font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Customizable UI Layout
              </span>
              <span className="text-zinc-500 text-sm font-light leading-relaxed">
                Alter spacing parameters, load native presets, and hide window items for a unified atmosphere while using your computer.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features-section" className="py-28 border-t border-zinc-900 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-4">Specifications</span>
            <h2 className="font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Powerful Out Of The Box
            </h2>
            <p className="mt-4 text-zinc-400 font-light leading-relaxed text-sm sm:text-base font-sans">
              Pearl is crafted to bypass updates cleanly while running complex Roblox scripts smoothly. We offer a minimalist setup that doesn't compromise on raw power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-zinc-900 bg-zinc-950/40 p-8 rounded-[2rem] flex flex-col justify-between gap-8 hover:border-zinc-700 hover:bg-zinc-950/80 transition-all duration-300 group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-950 text-white transition-colors duration-300">
                  <RefreshCw className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" />
                </div>
                <h3 className="font-bold text-center sm:text-left text-lg text-white">Fast updates</h3>
                <p className="text-zinc-550 text-xs font-light leading-relaxed">
                  Engineered to bypass platform patches immediately. Whenever game security upgrades, we deploy automatic update patches within hours to minimize downtime.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/40 p-8 rounded-[2rem] flex flex-col justify-between gap-8 hover:border-zinc-700 hover:bg-zinc-950/80 transition-all duration-300 group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-950 text-white transition-colors duration-300">
                  <Zap className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-center sm:text-left text-lg text-white">Fast executor</h3>
                <p className="text-zinc-550 text-xs font-light leading-relaxed">
                  Proprietary injection architecture with dynamic thread mapping. Runs massive, resource-heavy Lua UI libraries smoothly at constant system FPS.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/40 p-8 rounded-[2rem] flex flex-col justify-between gap-8 hover:border-zinc-700 hover:bg-zinc-950/80 transition-all duration-300 group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-950 text-white transition-colors duration-300">
                  <Sliders className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-bold text-center sm:text-left text-lg text-white">Customizable UI</h3>
                <p className="text-zinc-550 text-xs font-light leading-relaxed">
                  A pure minimalist workspace. We have custom built-in themes to suit your personal aesthetic profile.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/40 p-8 rounded-[2rem] flex flex-col justify-between gap-8 hover:border-zinc-700 hover:bg-zinc-950/80 transition-all duration-300 group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-950 text-white transition-colors duration-300">
                  <Key className="w-5 h-5 transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-bold text-center sm:text-left text-lg text-white">Key System</h3>
                <p className="text-zinc-550 text-xs font-light leading-relaxed">
                  Key system that's very easy to do. Say goodbye to annoying, repetitive ad checkpoints that freeze your browser. Get authorized immediately within seconds.
                </p>
              </div>
            </div>
          </div>


        </div>
      </section>

      <footer id="main-footer" className="pb-16 pt-24 border-t border-zinc-900/60 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-zinc-900">
            <div className="flex items-center gap-3.5">
              <img 
                src="https://i.ibb.co/Ndy2Wbcn/pearllogo-Photoroom.png" 
                alt="Pearl Logo Footer" 
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain"
              />
              <span className="font-extrabold text-white text-xl">Pearl</span>
            </div>

            <p className="text-zinc-550 text-xs text-center md:text-right max-w-sm font-light">
              We do not promote, distribute or enable illegal activities. Pearl is a technical software built to analyze sandbox runtime scripts and game loop architecture in private development instances.
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <button onClick={() => setDownloadOpen(true)} className="text-white hover:underline">Install</button>
              <span className="text-zinc-800">|</span>
              <button onClick={() => setDiscordOpen(true)} className="text-white hover:underline">Discord</button>
              <span className="text-zinc-800">|</span>
              <a href="#hero-section" className="text-white hover:underline">Top ▲</a>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
            <span>© {new Date().getFullYear()} Pearl. All rights reserved.</span>
            <span className="text-zinc-700 text-center sm:text-right">made by saintdevzz ❤️</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {downloadOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="download-modal-backdrop"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              id="download-modal-content"
              className="bg-zinc-950 border border-zinc-900 rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl text-center"
            >
              <button 
                onClick={() => setDownloadOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white text-xs cursor-pointer p-1 font-mono"
              >
                [ Close ]
              </button>

              <div className="flex flex-col items-center gap-4 mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Info className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Pearl is unreleased</h3>
              </div>

              <div className="space-y-4 text-neutral-400 font-light text-sm leading-relaxed mb-6">
                <p>
                  Thanks for your interest in Pearl! Our exploit is currently in private testing stages and has not been launched to the public yet.
                </p>
                <p className="text-zinc-550 text-xs">
                  Join our official Discord community, where developers are posting devlogs, bypass announcements, and alpha slots.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setDownloadOpen(false);
                    setDiscordOpen(true);
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-bold py-4 rounded-full text-xs transition-colors shadow-md flex items-center justify-center gap-2 border border-zinc-800"
                >
                  Join Discord
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>
                <button 
                  onClick={() => setDownloadOpen(false)}
                  className="w-full bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white font-semibold py-3 rounded-full text-xs transition-colors border border-zinc-900"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {discordOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="discord-modal-backdrop"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              id="discord-modal-content"
              className="bg-zinc-950 border border-zinc-900 rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl text-center"
            >
              <button 
                onClick={() => setDiscordOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white text-xs cursor-pointer p-1 font-mono"
              >
                [ Close ]
              </button>

              <div className="flex flex-col items-center gap-4 mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Join Pearl Discord</h3>
              </div>

              <div className="space-y-4 text-neutral-400 font-light text-sm leading-relaxed mb-6">
                <p>
                  Connect with the community, learn about custom updates, and get direct notifications from saintdevzz.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 border-dashed text-center">
                  <span className="text-zinc-500 text-xs block mb-1">Direct Invitation Link:</span>
                  <a 
                    href={discordLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white select-all text-xs font-semibold underline hover:text-neutral-200"
                  >
                    {discordLink}
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleOpenDiscordDirect}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-bold py-4 rounded-full text-xs transition-colors shadow-md flex items-center justify-center gap-2 border border-zinc-800"
                >
                  Join Discord
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>
                <button 
                  onClick={handleCopyDiscord}
                  className="w-full bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white font-semibold py-3 rounded-full text-xs transition-colors border border-zinc-900"
                >
                  Copy Invitation Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
