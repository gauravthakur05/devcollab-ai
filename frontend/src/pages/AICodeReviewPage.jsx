import React, { useState } from 'react';
import { Sparkles, Loader2, Trash2, ShieldAlert, Bug as BugIcon, Gauge, Code2 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { aiApi } from '../api/aiApi';
import { useToast } from '../context/ToastContext';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'c#', 'ruby', 'php'];

function ScoreRing({ score }) {
  const color = score >= 80 ? '#22D3AA' : score >= 55 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#1F2430" strokeWidth="8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-ink">{score}</span>
        <span className="text-[10px] text-muted">/ 100</span>
      </div>
    </div>
  );
}

function FindingList({ title, icon: Icon, items, tone }) {
  const toneColors = { bug: 'text-danger', security: 'text-warn', perf: 'text-info', smell: 'text-muted' };
  return (
    <div>
      <h4 className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${toneColors[tone]}`}>
        <Icon size={13} /> {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted flex gap-1.5"><span className="text-border">—</span>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AICodeReviewPage() {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);

  const handleReview = async () => {
    if (!code.trim()) return toast.error('Paste some code to review first');
    setLoading(true);
    try {
      const res = await aiApi.codeReview({ code, language });
      setReview(res.data.data.review);
    } catch (err) {
      toast.error(err.normalizedMessage || 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setCode(''); setReview(null); };

  return (
    <AppLayout title="AI Code Review">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm font-medium text-ink">Paste your code</span>
            </div>
            <select className="input w-auto py-1.5 text-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <textarea
            className="input font-mono text-xs flex-1 min-h-[360px] resize-none"
            placeholder="// Paste code here to get an AI-style review…"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2 mt-3">
            <button onClick={handleReview} disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Review Code
            </button>
            <button onClick={handleClear} className="btn-secondary"><Trash2 size={15} /></button>
          </div>
        </div>

        <div className="card p-4">
          {!review ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-muted">
              <Sparkles size={28} className="mb-3 opacity-40" />
              <p className="text-sm">Your AI code review will appear here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <ScoreRing score={review.qualityScore} />
                <div className="space-y-1.5">
                  <p className="text-xs text-muted flex items-center gap-1.5"><Gauge size={13} /> Complexity: <span className="text-ink font-medium">{review.complexity}</span></p>
                  <p className="text-xs text-muted flex items-center gap-1.5"><Code2 size={13} /> Maintainability: <span className="text-ink font-medium">{review.maintainability}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FindingList title="Bugs" icon={BugIcon} items={review.findings.bugs} tone="bug" />
                <FindingList title="Security Issues" icon={ShieldAlert} items={review.findings.securityIssues} tone="security" />
                <FindingList title="Performance" icon={Gauge} items={review.findings.performanceIssues} tone="perf" />
                <FindingList title="Code Smells" icon={Code2} items={review.findings.codeSmells} tone="smell" />
              </div>

              <div>
                <h4 className="text-xs font-medium text-ink mb-1.5">Suggestions</h4>
                <ul className="space-y-1">
                  {review.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted flex gap-1.5"><span className="text-accent">✓</span>{s}</li>
                  ))}
                </ul>
              </div>

              {review.improvedCode && (
                <div>
                  <h4 className="text-xs font-medium text-ink mb-1.5">Suggested Improvements</h4>
                  <pre className="bg-surface2 border border-border rounded-lg p-3 text-xs font-mono text-muted overflow-x-auto max-h-56">{review.improvedCode}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
