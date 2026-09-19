import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ConfirmDialog from './ConfirmDialog';
import { tasksApi } from '../api/tasksApi';
import { useToast } from '../context/ToastContext';
import { STATUS_LABELS } from '../utils/formatters';

const COLUMNS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'DONE'];

const COLUMN_ACCENTS = {
  BACKLOG: 'border-t-[#4B5568]',
  TODO: 'border-t-info',
  IN_PROGRESS: 'border-t-accent',
  CODE_REVIEW: 'border-t-warn',
  TESTING: 'border-t-[#EC4899]',
  DONE: 'border-t-mint',
};

/**
 * Fully functional drag-and-drop Kanban board. Reused by both the
 * standalone /kanban page and the project-detail Kanban tab.
 */
export default function KanbanBoard({ projectId, tasks, members, onChange }) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState('BACKLOG');
  const [dragOverCol, setDragOverCol] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col).sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const openNewTask = (status) => {
    setActiveTask(null);
    setNewTaskStatus(status);
    setModalOpen(true);
  };

  const openTask = (task) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (activeTask?._id) {
      await tasksApi.update(activeTask._id, payload);
      toast.success('Task updated');
    } else {
      await tasksApi.create({ ...payload, projectId, status: newTaskStatus });
      toast.success('Task created');
    }
    onChange();
  };

  const handleDelete = async (taskId) => {
    setConfirmDeleteId(taskId);
  };

  const confirmDelete = async () => {
    await tasksApi.remove(confirmDeleteId);
    toast.success('Task deleted');
    setConfirmDeleteId(null);
    setModalOpen(false);
    onChange();
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === status) return;
    try {
      // Persist immediately to MongoDB via the backend — this is not a
      // frontend-only reorder.
      await tasksApi.update(taskId, { status });
      onChange();
    } catch (err) {
      toast.error(err.normalizedMessage || 'Failed to move task');
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col)}
            className={`w-72 shrink-0 card border-t-2 ${COLUMN_ACCENTS[col]} ${dragOverCol === col ? 'ring-2 ring-accent/40' : ''}`}
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-sm font-medium text-ink">{STATUS_LABELS[col]}</span>
              <span className="text-xs text-muted bg-surface2 rounded-full px-2 py-0.5">{grouped[col].length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-260px)] overflow-y-auto">
              {grouped[col].map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => openTask(task)}
                />
              ))}
              <button onClick={() => openNewTask(col)} className="w-full flex items-center gap-1.5 text-xs text-muted hover:text-ink p-2 rounded-lg hover:bg-surface2 transition-colors">
                <Plus size={14} /> Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={activeTask}
        members={members}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
