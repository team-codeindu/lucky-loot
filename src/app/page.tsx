"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader, Sparkles, X, ArrowLeft, RotateCcw } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  // --- State ---
  const [step, setStep] = useState<number>(0); // 0: details, 1: draw, 2: result
  const [name, setName] = useState<string>("");
  const [tries, setTries] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showGateModal, setShowGateModal] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- Derived ---
  const steps = ["Enter Details", "Verify & Draw", "Result"];
  const progressValue = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  const sessionId = useMemo(
    () => `RID-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    []
  );

  useEffect(() => {
    // Attempt auto focus on name input for better UX
    const el = document.getElementById("name-input") as HTMLInputElement | null;
    if (el) el.focus();
  }, [step]); // Rerun effect when step changes

  // --- Handlers ---
  const handleBegin = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleLuckDraw = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError("");

    // Simulate server verification latency
    await new Promise((r) => setTimeout(r, 1200));

    setIsProcessing(false);

    if (tries < 2) {
      setTries((t) => t + 1);
    } else {
      // Gate before reveal
      setShowGateModal(true);
    }
  };

  const handleReveal = async () => {
    // Close gate and show the video overlay
    setShowGateModal(false);
    setShowVideo(true);

    // Give React time to paint the video element
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = false; // Ensure sound is on
      // Attempt playback as a result of explicit click (gesture)
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Some browsers still need an additional tap on the video
          // We'll show a subtle tip via aria-live
          const tip = document.getElementById("tap-tip");
          if (tip) tip.textContent = "If the video didn't start, tap on it once.";
        });
      }
    });

    // Move to final step in background
    setStep(2);
  };

  const resetAll = () => {
    setStep(0);
    setName("");
    setTries(0);
    setIsProcessing(false);
    setShowGateModal(false);
    setShowVideo(false);
    setError("");
  };

  // --- UI helpers ---
  const TryBadge = () => (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <span className="inline-flex h-6 items-center rounded-full bg-zinc-700/50 px-3 font-medium text-zinc-300">
        Tries: <strong className="ml-1">{tries}/3</strong>
      </span>
      <span className="inline-flex h-6 items-center rounded-full bg-zinc-700/50 px-3 font-medium text-zinc-300">
        Session: <strong className="ml-1">{sessionId}</strong>
      </span>
    </div>
  );

  const StepIndicator = ({ label, index }: { label: string; index: number }) => (
    <div className="flex-1 text-center">
      <div className={`mx-auto h-2 w-full rounded-full transition-colors duration-500 ${index <= step ? "bg-purple-500" : "bg-zinc-700"}`} />
      <div className={`mt-2 text-sm font-medium ${index === step ? "text-white" : "text-zinc-500"}`}>{label}</div>
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white">
      {/* Top Bar / Brand */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-purple-400" />
            <span className="text-xl font-bold tracking-tight text-white">Reward Centre</span>
          </div>
          <div className="hidden text-xs text-zinc-500 sm:block">Secure • Real‑time • Beta</div>
        </div>
      </header>

      {/* Page Body */}
      <section className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        {/* Stepper */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((label, i) => (
              <StepIndicator key={label} label={label} index={i} />
            ))}
          </div>
          <Progress.Root value={progressValue} className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-700">
            <Progress.Indicator
              style={{ transform: `translateX(-${100 - progressValue}%)` }}
              className="h-full w-full rounded-full bg-purple-500 transition-transform duration-500 ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
            />
          </Progress.Root>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-[400px] flex flex-col justify-between rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 p-8 shadow-2xl"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Claim Your Reward</h1>
                  <p className="mt-2 text-base text-zinc-400">
                    Enter your full name to check for eligibility. No OTP required.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name-input" className="text-sm font-medium text-zinc-300">
                    Full Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {error && <p className="text-sm text-rose-400">{error}</p>}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <TryBadge />
                  <button
                    onClick={handleBegin}
                    className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-purple-500 active:scale-[.98]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Verify & Run Draw</h2>
                      <p className="mt-1 text-sm text-zinc-400">Applicant: <span className="font-medium text-white">{name}</span></p>
                    </div>
                    <TryBadge />
                  </div>
  
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 grid grid-cols-2 gap-3 text-sm text-zinc-300">
                    <div className="rounded-xl bg-zinc-800 p-3">
                      <div className="text-zinc-500">Eligibility</div>
                      <div>Pre-Qualified</div>
                    </div>
                    <div className="rounded-xl bg-zinc-800 p-3">
                      <div className="text-zinc-500">Ref ID</div>
                      <div>{sessionId}</div>
                    </div>
                    <div className="rounded-xl bg-zinc-800 p-3">
                      <div className="text-zinc-500">Queue Status</div>
                      <div>Live</div>
                    </div>
                    <div className="rounded-xl bg-zinc-800 p-3">
                      <div className="text-zinc-500">Draw Window</div>
                      <div>Immediate</div>
                    </div>
                  </div>
  
                  <div className="flex items-center justify-center py-6">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-zinc-600">
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader className="h-14 w-14 text-purple-500" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                        >
                          <Sparkles className="h-14 w-14 text-purple-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>
  
                  {tries > 0 && tries < 3 && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-orange-500 bg-orange-500/10 p-4 text-center text-sm text-orange-200"
                    >
                      <p>{name.split(" ")[0]}, unlucky this time. Please run again.</p>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(0)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-transparent px-5 py-3 text-zinc-300 transition-colors hover:bg-zinc-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleLuckDraw}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>{tries < 2 ? "Run Luck Draw" : "Finalize Result"}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Result</h2>
                      <p className="mt-1 text-sm text-zinc-400">Generated for <span className="font-medium text-white">{name}</span></p>
                    </div>
                    <TryBadge />
                  </div>
  
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <Check className="mx-auto mb-4 h-14 w-14 text-emerald-400" strokeWidth={1.5} />
                    <div className="text-xl font-bold text-white">Final step completed</div>
                    <p className="mt-2 text-sm text-zinc-400">If you didn&apos;t see the video, ensure sound is allowed and try again.</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 transition-colors hover:bg-zinc-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Gate Modal */}
      <AnimatePresence>
        {showGateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-800 p-8 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <Sparkles className="mt-1 h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Final Verification</h3>
                  <p className="mt-1 text-sm text-zinc-400">Enable sound to reveal your reward video. This helps us verify it&lsquo;s you.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowGateModal(false)}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReveal}
                  className="rounded-xl bg-purple-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-purple-500"
                >
                  Enable & Reveal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl"
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
              <video
                id="prankVideo"
                ref={videoRef}
                className="h-auto w-full rounded-2xl border border-zinc-800 shadow-2xl"
                controls
                playsInline
                preload="auto"
                src="/prank.mp4"
              />
              <div id="tap-tip" aria-live="polite" className="mt-4 text-center text-sm text-zinc-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}