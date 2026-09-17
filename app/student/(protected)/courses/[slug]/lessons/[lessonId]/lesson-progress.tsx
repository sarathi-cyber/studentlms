"use client";

import { useEffect, useState } from "react";

type LessonProgressProps = {
  lessonId: string;
  initialProgress: number;
  initialCompletedAt: string | null;
};

export default function LessonProgress({
  lessonId,
  initialProgress,
  initialCompletedAt,
}: LessonProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  /*
   * Completion is controlled by the administrator.
   *
   * The lesson page can therefore open with 100% without
   * treating that existing database state as a new completion.
   *
   * The celebration component remains available for a future
   * explicit completion event.
   */
  useEffect(() => {
    // Intentionally do not trigger the celebration from
    // initialProgress or initialCompletedAt.
    return undefined;
  }, [lessonId, initialProgress, initialCompletedAt]);

  const progress = Math.max(
    0,
    Math.min(100, initialProgress),
  );

  return (
    <>
      {showCelebration && (
        <CompletionCelebration
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className="mt-10 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">
              Your Progress
            </p>

            <p className="mt-2 text-2xl font-black">
              {progress}%
            </p>
          </div>

          {progress === 100 && initialCompletedAt && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs font-semibold text-emerald-300">
              ✓ Completed
            </span>
          )}
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label={`Lesson progress: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-[#d4af37] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-sm text-[#d4af37]">
            {progress === 100 ? "✓" : "i"}
          </span>

          <p className="text-xs leading-5 text-white/50">
            {progress === 100
              ? "This lesson has been completed."
              : "Your lesson progress is managed by your course administrator."}
          </p>
        </div>
      </div>
    </>
  );
}

type CompletionCelebrationProps = {
  onClose: () => void;
};

function CompletionCelebration({
  onClose,
}: CompletionCelebrationProps) {
  const particles = Array.from(
    { length: 28 },
    (_, index) => index,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/70 px-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-[#d4af37]"
            style={{
              animation:
                "techvora-confetti 1.8s ease-out forwards",
              transform: `rotate(${particle * 47}deg) translateY(-${
                90 + (particle % 7) * 28
              }px)`,
              animationDelay: `${(particle % 8) * 35}ms`,
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-md rounded-3xl border border-[#d4af37]/40 bg-black p-8 text-center shadow-2xl shadow-[#d4af37]/20"
        style={{
          animation:
            "techvora-celebration-pop 500ms cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10"
          style={{
            animation:
              "techvora-check-bounce 700ms 150ms cubic-bezier(.2,.8,.2,1) both",
          }}
        >
          <span className="text-4xl font-black text-[#d4af37]">
            ✓
          </span>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37]">
          Techvora Academy
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          Lesson Completed!
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/60">
          Great work! Keep learning, keep building, and keep
          moving forward.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Learn • Practice • Build • Succeed
        </p>
      </div>

      <style jsx>{`
        @keyframes techvora-celebration-pop {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(20px);
          }

          60% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes techvora-check-bounce {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-20deg);
          }

          60% {
            opacity: 1;
            transform: scale(1.15) rotate(5deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes techvora-confetti {
          0% {
            opacity: 1;
            transform: rotate(0deg) translateY(0) scale(1);
          }

          100% {
            opacity: 0;
            transform: rotate(720deg) translateY(-260px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
