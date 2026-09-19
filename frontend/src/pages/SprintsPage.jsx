import React, { useEffect, useState, useCallback } from 'react';
import { CalendarRange, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/AppLayout';
import ProjectPicker from '../components/ProjectPicker';
import SprintCard from '../components/SprintCard';
import SprintModal from '../components/SprintModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { useProjects } from '../hooks/useProjects';
import { sprintsApi } from '../api/sprintsApi';
import { useToast } from '../context/ToastContext';

export default function SprintsPage() {
  const { projects, loading: loadingProjects } = useProjects();
  const toast = useToast();
  const [projectId, setProjectId] = useState('');
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0]._id);
  }, [projects]);

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    sprintsApi.list(projectId)
      .then((res) => setSprints(res.data.data.sprints))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load sprints'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload) => {
    await sprintsApi.create({ ...payload, projectId });
    toast.success('Sprint created');
    load();
  };

  const handleStart = async (sprint) => {
    await sprintsApi.update(sprint._id, { status: 'ACTIVE' });
    toast.success('Sprint started');
    load();
  };

  const handleComplete = async (sprint) => {
    await sprintsApi.update(sprint._id, { status: 'COMPLETED' });
    toast.success('Sprint completed');
    load();
  };

  const chartData = sprints
    .slice()
    .reverse()
    .map((s) => ({ name: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name, completed: s.stats.completedTasks, remaining: s.stats.remainingTasks }));

  return (
    <AppLayout title="Sprints">
      {loadingProjects ? (
        <div className="grid grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : projects.length === 0 ? (
        <EmptyState icon={CalendarRange} title="No projects yet" description="Create a project first to start planning sprints." />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <ProjectPicker projects={projects} value={projectId} onChange={setProjectId} />
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> New Sprint</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
          ) : sprints.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No sprints yet" description="Plan your first sprint for this project." action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> New Sprint</button>} />
          ) : (
            <>
              {chartData.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-ink mb-3">Completed vs Remaining by Sprint</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232836" />
                      <XAxis dataKey="name" stroke="#8B93A7" fontSize={11} />
                      <YAxis stroke="#8B93A7" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#171B24', border: '1px solid #232836', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="completed" stackId="a" fill="#22D3AA" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="remaining" stackId="a" fill="#2A3040" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sprints.map((s) => (
                  <SprintCard key={s._id} sprint={s} onStart={handleStart} onComplete={handleComplete} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <SprintModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </AppLayout>
  );
}
