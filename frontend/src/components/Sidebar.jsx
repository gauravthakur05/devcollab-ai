import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Columns3,
  CalendarRange,
  Sparkles,
  Bug,
  GitCommitHorizontal,
  MessagesSquare,
  Bell,
  Settings,
  Boxes,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/my-tasks', label: 'My Tasks', icon: ListChecks },
      { to: '/kanban', label: 'Kanban Board', icon: Columns3 },
      { to: '/sprints', label: 'Sprints', icon: CalendarRange },
    ],
  },
  {
    heading: 'AI Tools',
    items: [
      { to: '/ai/code-review', label: 'AI Code Review', icon: Sparkles },
      { to: '/ai/bug-detection', label: 'AI Bug Detection', icon: Bug },
      { to: '/ai/commit-generator', label: 'Commit Generator', icon: GitCommitHorizontal },
    ],
  },
  {
    heading: 'Team',
    items: [
      { to: '/chat', label: 'Team Chat', icon: MessagesSquare },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-surface">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Boxes size={18} className="text-white" />
        </div>
        <span className="font-semibold text-ink tracking-tight">DevCollab <span className="text-accent">AI</span></span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="px-3 text-[11px] font-medium text-muted tracking-wide mb-1.5">{section.heading}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-accent-soft text-accent font-medium' : 'text-muted hover:text-ink hover:bg-surface2'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
