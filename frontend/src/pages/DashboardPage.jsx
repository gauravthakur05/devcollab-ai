import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Bug, Users, Activity as ActivityIcon, Rocket,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { dashboardApi } from '../api/dashboardApi';
import { useToast } from '../context/ToastContext';
import { timeAgo, STATUS_LABELS } from '../utils/formatters';

const STATUS_COLORS = {
  BACKLOG: '#4B5568',
  TODO: '#3B82F6',
  IN_PROGRESS: '#6E56CF',
  CODE_REVIEW: '#F59E0B',
  TESTING: '#EC4899',
  DONE: '#22D3AA',
};

export default function DashboardPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const distributionData = data
    ? Object.entries(data.taskDistribution).map(([status, count]) => ({ name: STATUS_LABELS[status] || status, value: count, status }))
    : [];

  return (
    <AppLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data ? (
        <EmptyState icon={ActivityIcon} title="Couldn't load dashboard" description="Check that the backend is running and try refreshing." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Projects" value={data.stats.totalProjects} icon={FolderKanban} accent="accent" />
            <StatCard label="Active Projects" value={data.stats.activeProjects} icon={Rocket} accent="info" />
            <StatCard label="Tasks Completed" value={data.stats.tasksCompleted} icon={CheckCircle2} accent="mint" />
            <StatCard label="Open Bugs" value={data.stats.openBugs} icon={Bug} accent="danger" />
            <StatCard label="Team Members" value={data.stats.teamMembers} icon={Users} accent="warn" />
            <StatCard label="Sprint Progress" value={data.stats.currentSprintProgress} suffix="%" icon={ActivityIcon} accent="accent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-4 lg:col-span-1">
              <h3 className="text-sm font-semibold text-ink mb-3">Task Distribution</h3>
              {distributionData.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No tasks yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {distributionData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6E56CF'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#171B24', border: '1px solid #232836', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {distributionData.map((d) => (
                  <span key={d.status} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-ink mb-3">Your Projects</h3>
              {data.projects.length === 0 ? (
                <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to get started." action={<Link to="/projects" className="btn-primary">New Project</Link>} />
              ) : (
                <div className="space-y-2">
                  {data.projects.map((p) => (
                    <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface2 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-sm text-ink font-medium">{p.name}</span>
                      </div>
                      <span className="badge bg-surface2 text-muted border border-border">{STATUS_LABELS[p.status]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink mb-3">Recent Activity</h3>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.recentActivity.map((a) => (
                    <li key={a._id} className="flex gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      <p className="text-muted"><span className="text-ink font-medium">{a.actorName}</span> {a.action}
                        <span className="block text-[11px] text-muted mt-0.5">{timeAgo(a.createdAt)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink mb-3">Recent Notifications</h3>
              {data.recentNotifications.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No notifications yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.recentNotifications.map((n) => (
                    <li key={n._id} className="text-sm">
                      <p className="text-ink font-medium">{n.title}</p>
                      <p className="text-muted text-xs mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
