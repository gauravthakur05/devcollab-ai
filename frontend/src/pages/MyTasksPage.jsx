import React, { useEffect, useState } from 'react';
import { ListChecks } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { useProjects } from '../hooks/useProjects';
import { tasksApi } from '../api/tasksApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRIORITY_COLORS, STATUS_LABELS, formatDateShort } from '../utils/formatters';

export default function MyTasksPage() {
  const { projects, loading: loadingProjects } = useProjects();
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingProjects) return;
    if (projects.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(projects.map((p) => tasksApi.list({ projectId: p._id, assignedTo: user.id }).then((res) => res.data.data.tasks.map((t) => ({ ...t, projectName: p.name, projectColor: p.color })))))
      .then((results) => setTasks(results.flat()))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [projects, loadingProjects]);

  const grouped = tasks.reduce((acc, t) => {
    acc[t.status] = acc[t.status] || [];
    acc[t.status].push(t);
    return acc;
  }, {});

  return (
    <AppLayout title="My Tasks">
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks assigned to you" description="Tasks assigned to you across all projects will show up here." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([status, list]) => (
            <div key={status}>
              <h3 className="text-sm font-semibold text-ink mb-2">{STATUS_LABELS[status]} <span className="text-muted font-normal">({list.length})</span></h3>
              <div className="space-y-2">
                {list.map((t) => (
                  <div key={t._id} className="card p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.projectColor }} />
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted truncate">{t.projectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.dueDate && <span className="text-xs text-muted">{formatDateShort(t.dueDate)}</span>}
                      <span className={`badge border text-[10px] ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
