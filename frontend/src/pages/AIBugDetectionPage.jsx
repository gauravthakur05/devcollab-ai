import React, { useState } from 'react';
import { Bug, Loader2, Trash2, AlertOctagon } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { aiApi } from '../api/aiApi';
import { useToast } from '../context/ToastContext';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'c#', 'ruby', 'php'];
const SEVERITY_STYLES = {
  LOW: 'bg-surface2 text-muted border-border',
  MEDIUM: 'bg-info/10 text-info border-info/30',
  HIGH: 'bg-warn/10 text-warn border-warn/30',
  CRITICAL: 'bg-danger/10 text-danger border-danger/30',
};

export default function AIBugDetectionPage() {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return toast.error('Paste the relevant code first');
    setLoading(true);
    try {
      const res = await aiApi.bugDetection({ code, errorMessage, stackTrace, language });
      setReport(res.data.data.report);
    } catch (err) {
      toast.error(err.normalizedMessage || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setCode(''); setErrorMessage(''); setStackTrace(''); setReport(null); };

  return (
    <AppLayout title="AI Bug Detection">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug size={16} className="text-accent" />
              <span className="text-sm font-medium text-ink">Describe the bug</span>
            </div>
            <select className="input w-auto py-1.5 text-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Code</label>
            <textarea className="input font-mono text-xs min-h-[140px] resize-none" placeholder="Paste the relevant code…" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Error message</label>
            <input className="input" placeholder="e.g. TypeError: Cannot read properties of undefined" value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Stack trace (optional)</label>
            <textarea className="input font-mono text-xs min-h-[90px] resize-none" placeholder="Paste the stack trace…" value={stackTrace} onChange={(e) => setStackTrace(e.target.value)} spellCheck={false} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Bug size={16} />}
              Analyze Bug
            </button>
            <button onClick={handleClear} className="btn-secondary"><Trash2 size={15} /></button>
          </div>
        </div>

        <div className="card p-4">
          {!report ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-muted">
              <AlertOctagon size={28} className="mb-3 opacity-40" />
              <p className="text-sm">Your AI bug analysis will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`badge border ${SEVERITY_STYLES[report.severity]}`}>{report.severity} severity</span>
                <span className="text-xs text-muted">Confidence: <span className="text-ink font-medium">{report.confidence}%</span></span>
              </div>
              <div>
                <h4 className="text-xs font-medium text-ink mb-1">Possible Cause</h4>
                <p className="text-sm text-muted">{report.possibleCause}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-ink mb-1">Explanation</h4>
                <p className="text-sm text-muted">{report.explanation}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-ink mb-1">Suggested Fix</h4>
                <p className="text-sm text-muted">{report.suggestedFix}</p>
              </div>
              {report.fixedCode && (
                <div>
                  <h4 className="text-xs font-medium text-ink mb-1.5">Fixed Code</h4>
                  <pre className="bg-surface2 border border-border rounded-lg p-3 text-xs font-mono text-muted overflow-x-auto max-h-56">{report.fixedCode}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
