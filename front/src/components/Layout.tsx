import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Início', path: '/' },
    { name: 'Pacientes', path: '/pacientes' },
    { name: 'Médicos', path: '/medicos' },
    { name: 'Consultas', path: '/consultas' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f4f5]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#e4e4e7] flex flex-col shrink-0 border-r border-[rgba(0,0,0,0.08)]">
        <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
          <h1 className="text-xl font-bold text-[#09090b]">MedPro</h1>
          <p className="text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mt-1">The Clinical Monolith</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col px-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 text-[0.875rem] font-medium transition-colors ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'bg-[#000000] text-[#ffffff]'
                  : 'text-[#09090b] hover:bg-[rgba(0,0,0,0.04)]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#ffffff] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-8 shrink-0">
          <div className="text-[0.875rem] text-[#71717a]">
            Dashboard <span className="mx-2">/</span> <span className="text-[#09090b]">{navItems.find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || ''}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[0.875rem] font-semibold text-[#09090b]">Dr. Ricardo M.</p>
              <p className="text-[0.6875rem] text-[#71717a] uppercase tracking-widest">Diretor Clínico</p>
            </div>
            <div className="w-8 h-8 bg-[#e4e4e7] text-[#09090b] flex items-center justify-center font-bold text-xs">
              RM
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
