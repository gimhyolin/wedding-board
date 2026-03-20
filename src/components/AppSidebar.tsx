import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, MessageCircleHeart, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import WeddingBoardLogo from './WeddingBoardLogo';

const navSections = [
  { label: '현황 대시보드', icon: LayoutDashboard, path: '/' },
  { label: '하객 명부',     icon: Users,            path: '/guests' },
  { label: '정산 관리',     icon: BarChart2,         path: '/settlement' },
  { label: 'Thank You',    icon: MessageCircleHeart, path: '/thankyou' },
];

export default function AppSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-3 left-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-56 min-h-screen bg-white flex flex-col justify-between border-r border-gray-100
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          <div className="px-5 pt-6 pb-5">
            <WeddingBoardLogo />
            <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">실시간 접수 현황</p>
          </div>

          <nav className="px-3 space-y-0.5 pb-4">
            {navSections.map(section => {
              const isActive = location.pathname === section.path;
              const isThankYou = section.path === '/thankyou';
              return (
                <NavLink
                  key={section.path}
                  to={section.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? isThankYou
                        ? 'bg-purple-50 text-purple-600 font-semibold'
                        : 'bg-[#EBF3FE] text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-[#F5F6F8] hover:text-foreground'
                  }`}
                >
                  <section.icon className={`w-3.5 h-3.5 shrink-0 ${isActive && isThankYou ? 'text-purple-500' : ''}`} />
                  {section.label}
                  {isThankYou && (
                    <span className="ml-auto text-[9px] font-bold bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full">AI</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pb-6">
          <div className="bg-[#F5F6F8] rounded-xl px-4 py-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">실시간 연동</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-foreground font-semibold">정상 작동 중</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
