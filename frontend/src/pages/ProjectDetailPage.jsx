import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, Columns3, CalendarRange, Activity as ActivityIcon, Sparkles, Pencil, Trash2, UserPlus, X, ArrowLeft,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Avatar from '../components/Avatar';
import KanbanBoard from '../components/KanbanBoard';
import ProjectModal from '../components/ProjectModal';
import AddMemberModal from '../components/AddMemberModal';
import ConfirmDialog from '../components/ConfirmDialog';
import SprintCard from '../components/SprintCard';
import SprintModal from '../components/SprintModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { projectsApi } from '../api/projectsApi';
import { tasksApi } from '../api/tasksApi';
import { sprintsApi } from '../api/sprintsApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, timeAgo, STATUS_LABELS } from '../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'sprints', label: 'Sprints', icon: CalendarRange },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
  { id: 'ai', label: 'AI Tools', icon: Sparkles },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState(null);

  const loadProject = useCallback(() => {
    setLoading(true);
    projectsApi.get(id)
      .then((res) => setProject(res.data.data.project))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const loadTasks = useCallback(() => {
    tasksApi.list({ projectId: id }).then((res) => setTasks(res.data.data.tasks));
  }, [id]);

  const loadSprints = useCallback(() => {
    sprintsApi.list(id).then((res) => setSprints(res.data.data.sprints));
  }, [id]);

  useEffect(() => {
    if (tab === 'kanban' || tab === 'overview') loadTasks();
    if (tab === 'sprints' || tab === 'overview') loadSprints();
  }, [tab, loadTasks, loadSprints]);

  if (loading) {
    return (
      <AppLayout title="Project">
        <div className="grid grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Project">
        <EmptyState icon={ActivityIcon} title="Project not found" description="It may have been deleted, or you don't have access." />
      </AppLayout>
    );
  }

  const members = [project.owner, ...(project.members || []).map((m) => m.user)];
  const currentUserRole = project.owner._id === user.id ? 'ADMIN' : project.members.find((m) => m.user._id === user.id)?.role;
  const canManage = ['ADMIN', 'PROJECT_MANAGER'].includes(currentUserRole);

  const handleUpdate = async (payload) => {
    await projectsApi.update(id, payload);
    toast.success('Project updated');
    loadProject();
  };

  const handleDelete = async () => {
    await projectsApi.remove(id);
    toast.success('Project deleted');
    navigate('/projects');
  };

  const handleAddMember = async ({ email, role }) => {
    await projectsApi.addMember(id, { email, role });
    toast.success('Member added');
    loadProject();
  };

  const handleRemoveMember = async () => {
    await projectsApi.removeMember(id, removeMemberId);
    toast.success('Member removed');
    setRemoveMemberId(null);
    loadProject();
  };

  const handleCreateSprint = async (payload) => {
    await sprintsApi.create({ ...payload, projectId: id });
    toast.success('Sprint created');
    loadSprints();
  };

  return (
    <AppLayout title={project.name}>
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color}22` }}>
              <Columns3 size={20} style={{ color: project.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-ink">{project.name}</h2>
                <span className="badge bg-surface2 text-muted border border-border">{STATUS_LABELS[project.status]}</span>
              </div>
              <p className="text-sm text-muted mt-1 max-w-xl">{project.description || 'No description yet.'}</p>
              {project.deadline && <p className="text-xs text-muted mt-2">Deadline: {formatDate(project.deadline)}</p>}
            </div>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <button onClick={() => setEditOpen(true)} className="btn-secondary text-xs"><Pencil size={13} /> Edit</button>
              <button onClick={() => setDeleteOpen(true)} className="btn-secondary text-xs text-danger hover:bg-danger/10"><Trash2 size={13} /> Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors ${tab === tabId ? 'border-accent text-ink font-medium' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {Icon && <Icon size={15} />} {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs text-muted mb-1">Total Tasks</p>
            <p className="text-2xl font-semibold text-ink">{tasks.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted mb-1">Completed</p>
            <p className="text-2xl font-semibold text-mint">{tasks.filter((t) => t.status === 'DONE').length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted mb-1">Team Size</p>
            <p className="text-2xl font-semibold text-ink">{members.length}</p>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div className="card divide-y divide-border overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-ink">{members.length} members</span>
            {canManage && <button onClick={() => setAddMemberOpen(true)} className="btn-secondary text-xs"><UserPlus size={13} /> Add Member</button>}
          </div>
          {members.map((m) => {
            const isOwner = m._id === project.owner._id;
            const memberRole = isOwner ? 'ADMIN (Owner)' : project.members.find((pm) => pm.user._id === m._id)?.role;
            return (
              <div key={m._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar user={m} size={36} />
                  <div>
                    <p className="text-sm text-ink font-medium">{m.fullName}</p>
                    <p className="text-xs text-muted">{m.title || m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-surface2 text-muted border border-border">{memberRole}</span>
                  {canManage && !isOwner && (
                    <button onClick={() => setRemoveMemberId(m._id)} className="text-muted hover:text-danger"><X size={16} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'kanban' && (
        <KanbanBoard projectId={id} tasks={tasks} members={members} onChange={loadTasks} />
      )}

      {tab === 'sprints' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setSprintModalOpen(true)} className="btn-primary text-sm">New Sprint</button>
          </div>
          {sprints.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No sprints yet" description="Plan your first sprint for this project." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sprints.map((s) => (
                <SprintCard
                  key={s._id}
                  sprint={s}
                  onStart={async (sp) => { await sprintsApi.update(sp._id, { status: 'ACTIVE' }); toast.success('Sprint started'); loadSprints(); }}
                  onComplete={async (sp) => { await sprintsApi.update(sp._id, { status: 'COMPLETED' }); toast.success('Sprint completed'); loadSprints(); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <EmptyState icon={ActivityIcon} title="Project activity" description="View recent activity for this project on the Dashboard's activity feed." />
      )}

      {tab === 'ai' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/ai/code-review')} className="card p-5 text-left hover:border-accent/50 transition-colors">
            <Sparkles size={20} className="text-accent mb-2" />
            <p className="font-medium text-ink text-sm mb-1">AI Code Review</p>
            <p className="text-xs text-muted">Get a structured review of any code snippet.</p>
          </button>
          <button onClick={() => navigate('/ai/bug-detection')} className="card p-5 text-left hover:border-accent/50 transition-colors">
            <Sparkles size={20} className="text-accent mb-2" />
            <p className="font-medium text-ink text-sm mb-1">AI Bug Detection</p>
            <p className="text-xs text-muted">Diagnose an error and get a suggested fix.</p>
          </button>
          <button onClick={() => navigate('/ai/commit-generator')} className="card p-5 text-left hover:border-accent/50 transition-colors">
            <Sparkles size={20} className="text-accent mb-2" />
            <p className="font-medium text-ink text-sm mb-1">Commit Generator</p>
            <p className="text-xs text-muted">Turn a diff or description into a commit message.</p>
          </button>
        </div>
      )}

      <ProjectModal open={editOpen} onClose={() => setEditOpen(false)} onSubmit={handleUpdate} initial={project} />
      <AddMemberModal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} onAdd={handleAddMember} />
      <SprintModal open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} onSubmit={handleCreateSprint} />
      <ConfirmDialog open={deleteOpen} title="Delete this project?" description="This will permanently delete the project and all its tasks." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
      <ConfirmDialog open={Boolean(removeMemberId)} title="Remove this member?" description="They will lose access to this project." confirmLabel="Remove" onConfirm={handleRemoveMember} onCancel={() => setRemoveMemberId(null)} />
    </AppLayout>
  );
}
