import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';

interface ReplanBannerProps {
  title: string;
  message: string;
  diffSummary?: string;
  triggerEvent: string;
  onDismiss: () => void;
}

export const ReplanBanner: React.FC<ReplanBannerProps> = ({
  title,
  message,
  diffSummary,
  triggerEvent,
  onDismiss,
}) => {
  const [showDiffModal, setShowDiffModal] = useState(false);

  const isPoor = triggerEvent === 'ASSESSMENT_POOR';
  const isStrong = triggerEvent === 'ASSESSMENT_STRONG';

  const badgeColor = isPoor
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    : isStrong
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-violet-500/10 border-violet-500/30 text-violet-400';

  return (
    <>
      <div className={`p-4 rounded-2xl border ${badgeColor} backdrop-blur-md mb-6 relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {isPoor ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-violet-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">{title}</h4>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-background/50 border border-border">
                  Adaptive Re-Plan Active
                </span>
              </div>
              <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                {message}
              </p>
              {diffSummary && (
                <button
                  onClick={() => setShowDiffModal(true)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Inspect Roadmap Diff <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diff Modal */}
      {showDiffModal && diffSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold">Curriculum Evolution Diff</h3>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 text-xs font-mono bg-muted/30 p-4 rounded-xl border border-border/50 my-4 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed text-foreground/90">
              {diffSummary}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
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
