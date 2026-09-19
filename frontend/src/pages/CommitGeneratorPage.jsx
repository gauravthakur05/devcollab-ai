import React, { useState } from 'react';
import { GitCommitHorizontal, Loader2, Trash2, Copy, Check } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { aiApi } from '../api/aiApi';
import { useToast } from '../context/ToastContext';

const TYPE_COLORS = {
  feat: 'bg-mint-soft text-mint border-mint/30',
  fix: 'bg-danger/10 text-danger border-danger/30',
  refactor: 'bg-info/10 text-info border-info/30',
  docs: 'bg-surface2 text-muted border-border',
  test: 'bg-warn/10 text-warn border-warn/30',
  chore: 'bg-surface2 text-muted border-border',
  perf: 'bg-accent-soft text-accent border-accent/30',
};

export default function CommitGeneratorPage() {
  const toast = useToast();
  const [changedFiles, setChangedFiles] = useState('');
  const [diff, setDiff] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const filesList = changedFiles.split('\n').map((f) => f.trim()).filter(Boolean);
    if (filesList.length === 0 && !diff.trim() && !description.trim()) {
      return toast.error('Provide changed files, a diff, or a description');
    }
    setLoading(true);
    try {
      const res = await aiApi.commitMessage({ changedFiles: filesList, diff, description });
      setResult(res.data.data.generation);
    } catch (err) {
      toast.error(err.normalizedMessage || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setChangedFiles(''); setDiff(''); setDescription(''); setResult(null); };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.commitMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppLayout title="Commit Message Generator">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <GitCommitHorizontal size={16} className="text-accent" />
            <span className="text-sm font-medium text-ink">Describe your changes</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Changed files (one per line)</label>
            <textarea className="input font-mono text-xs min-h-[80px] resize-none" placeholder="backend/routes/auth.js&#10;frontend/src/pages/Login.jsx" value={changedFiles} onChange={(e) => setChangedFiles(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Git diff (optional)</label>
            <textarea className="input font-mono text-xs min-h-[100px] resize-none" placeholder="Paste your git diff…" value={diff} onChange={(e) => setDiff(e.target.value)} spellCheck={false} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Short description</label>
            <input className="input" placeholder="e.g. fixed the login redirect bug for expired tokens" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleGenerate} disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <GitCommitHorizontal size={16} />}
              Generate Commit Message
            </button>
            <button onClick={handleClear} className="btn-secondary"><Trash2 size={15} /></button>
          </div>
        </div>

        <div className="card p-4">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-muted">
              <GitCommitHorizontal size={28} className="mb-3 opacity-40" />
              <p className="text-sm">Your generated commit message will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <span className={`badge border ${TYPE_COLORS[result.commitType]}`}>{result.commitType}</span>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-medium text-ink">Commit Message</h4>
                  <button onClick={handleCopy} className="text-xs text-accent hover:underline flex items-center gap-1">
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-surface2 border border-border rounded-lg p-3 text-sm font-mono text-ink overflow-x-auto">{result.commitMessage}</pre>
              </div>

              <div>
                <h4 className="text-xs font-medium text-ink mb-1">Summary</h4>
                <p className="text-sm text-muted">{result.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-ink mb-1">Detailed Explanation</h4>
                <p className="text-sm text-muted">{result.detailedExplanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
