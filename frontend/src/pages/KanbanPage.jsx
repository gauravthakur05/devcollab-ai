import React, { useEffect, useState, useCallback } from 'react';
import { Columns3 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import KanbanBoard from '../components/KanbanBoard';
import ProjectPicker from '../components/ProjectPicker';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { useProjects } from '../hooks/useProjects';
import { tasksApi } from '../api/tasksApi';
import { useToast } from '../context/ToastContext';

export default function KanbanPage() {
  const { projects, loading: loadingProjects } = useProjects();
  const toast = useToast();
  const [projectId, setProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0]._id);
  }, [projects]);

  const loadTasks = useCallback(() => {
    if (!projectId) return;
    setLoadingTasks(true);
    tasksApi.list({ projectId })
      .then((res) => setTasks(res.data.data.tasks))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load tasks'))
      .finally(() => setLoadingTasks(false));
  }, [projectId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const currentProject = projects.find((p) => p._id === projectId);
  const members = currentProject ? [currentProject.owner, ...(currentProject.members || []).map((m) => m.user)] : [];

  return (
    <AppLayout title="Kanban Board">
      {loadingProjects ? (
        <div className="grid grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Columns3} title="No projects yet" description="Create a project first to start managing tasks on a board." />
      ) : (
        <div className="space-y-4">
          <ProjectPicker projects={projects} value={projectId} onChange={setProjectId} />
          {loadingTasks ? (
            <div className="grid grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
          ) : (
            <KanbanBoard projectId={projectId} tasks={tasks} members={members} onChange={loadTasks} />
          )}
        </div>
      )}
    </AppLayout>
  );
}
