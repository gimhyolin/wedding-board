import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, WifiOff, RefreshCw } from 'lucide-react';
import AppSidebar from './AppSidebar';
import GuestInputModal from './GuestInputModal';
import { useGuests } from '@/lib/useStore';
import { store } from '@/lib/store';
import WeddingBoardLogo from './WeddingBoardLogo';

const tabs = [
  { label: '대시보드', path: '/' },
  { label: '하객 명부', path: '/guests' },
  { label: '정산 관리', path: '/settlement' },
  { label: 'Thank You ✨', path: '/thankyou' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { online, pendingSync } = useGuests();

  const searchResults = searchQuery.trim().length >= 1 ? store.search(searchQuery) : [];

  // 검색 결과 클릭 → 하객 명부로 이동하며 해당 이름 검색 상태 전달
  function handleSelectGuest(name: string) {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/guests?search=${encodeURIComponent(name)}`);
  }

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 오프라인 배너 */}
        {!online && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-700">오프라인 상태입니다. 네트워크 복구 시 자동 동기화됩니다.</span>
          </div>
        )}
        {online && pendingSync > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            <span className="text-xs font-medium text-primary">미동기화 {pendingSync}건 동기화 중...</span>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <WeddingBoardLogo />
            <div className="w-px h-4 bg-border mx-1 hidden md:block" />

            {/* 전역 검색 */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="하객 검색..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                className="pl-9 pr-4 py-2 rounded-lg bg-[#F5F6F8] text-xs text-foreground placeholder:text-muted-foreground w-44 lg:w-52 outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20"
              />
              {/* 검색 드롭다운 */}
              {showResults && searchQuery.trim().length >= 1 && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">검색 결과가 없습니다.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.slice(0, 8).map(g => (
                        <button key={g.id} onMouseDown={() => handleSelectGuest(g.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F9FB] transition-colors text-left">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${g.side === 'groom' ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>
                            {g.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{g.name}</p>
                            <p className="text-[10px] text-muted-foreground">{g.phone} · {g.group}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold tabular-nums">₩{g.amount.toLocaleString()}</p>
                            <p className={`text-[10px] font-medium ${g.side === 'groom' ? 'text-primary' : 'text-bride'}`}>
                              {g.side === 'groom' ? '신랑측' : '신부측'}
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 8 && (
                        <div className="px-4 py-2 text-[10px] text-muted-foreground border-t border-gray-50 text-center">
                          +{searchResults.length - 8}명 더 있습니다 — 하객 명부에서 확인하세요
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-0.5">
            {tabs.map(tab => {
              const isActive = location.pathname === tab.path ||
                (tab.path !== '/' && location.pathname.startsWith(tab.path));
              return (
                <Link key={tab.path} to={tab.path}
                  className={`px-2.5 lg:px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive ? 'bg-[#EBF3FE] text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                  }`}>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 pb-24 overflow-auto">
          {children}
        </main>
      </div>

      {/* FAB — "하객 접수" */}
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 lg:px-5 py-2.5 lg:py-3 rounded-full bg-primary text-white text-xs lg:text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-50">
        <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        <span>하객 접수</span>
      </button>

      <GuestInputModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
