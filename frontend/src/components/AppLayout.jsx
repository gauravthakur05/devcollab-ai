import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
