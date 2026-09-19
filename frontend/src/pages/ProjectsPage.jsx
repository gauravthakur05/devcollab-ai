import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, CalendarClock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import ProjectModal from '../components/ProjectModal';
import Avatar from '../components/Avatar';
import { useProjects } from '../hooks/useProjects';
import { projectsApi } from '../api/projectsApi';
import { useToast } from '../context/ToastContext';
import { formatDate, STATUS_LABELS } from '../utils/formatters';

const STATUS_STYLES = {
  PLANNING: 'bg-info/10 text-info border-info/30',
  ACTIVE: 'bg-mint-soft text-mint border-mint/30',
  ON_HOLD: 'bg-warn/10 text-warn border-warn/30',
  COMPLETED: 'bg-surface2 text-muted border-border',
};

export default function ProjectsPage() {
  const { projects, loading, reload } = useProjects();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = async (payload) => {
    await projectsApi.create(payload);
    toast.success('Project created');
    reload();
  };

  return (
    <AppLayout title="Projects">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks, sprints, and your team."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> New Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`} className="card p-4 hover:border-accent/50 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}22` }}>
                  <FolderKanban size={17} style={{ color: p.color }} />
                </div>
                <span className={`badge border ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
              </div>
              <h3 className="font-semibold text-ink group-hover:text-accent transition-colors mb-1">{p.name}</h3>
              <p className="text-sm text-muted line-clamp-2 mb-4 min-h-[2.5rem]">{p.description || 'No description yet.'}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <Users size={13} />
                  <div className="flex -space-x-1.5">
                    {[p.owner, ...(p.members || []).map((m) => m.user)].slice(0, 4).map((u, i) => (
                      <Avatar key={u?._id || i} user={u} size={20} ring />
                    ))}
                  </div>
                </div>
                {p.deadline && (
                  <div className="flex items-center gap-1">
                    <CalendarClock size={13} /> {formatDate(p.deadline)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </AppLayout>
  );
}
