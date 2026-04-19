import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import WeddingBoardLogo from '@/components/WeddingBoardLogo';
import { LayoutDashboard, Users, BarChart2, MessageCircleHeart } from 'lucide-react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // 1.5초 후 로그인 카드 올라오기
  useEffect(() => {
    const timer = setTimeout(() => setShowLogin(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F0F2F5]">

      {/* 실제 대시보드 UI 미리보기 */}
      <div className="flex h-screen">
        {/* 사이드바 */}
        <aside className="w-56 min-h-screen bg-white flex flex-col border-r border-gray-100">
          <div className="px-5 pt-6 pb-5">
            <WeddingBoardLogo />
            <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">실시간 접수 현황</p>
          </div>
          <nav className="px-3 space-y-0.5">
            {[
              { label: '현황 대시보드', icon: LayoutDashboard, active: true },
              { label: '하객 명부', icon: Users, active: false },
              { label: '정산 관리', icon: BarChart2, active: false },
              { label: 'Thank You', icon: MessageCircleHeart, active: false, ai: true },
            ].map(({ label, icon: Icon, active, ai }) => (
              <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${active ? 'bg-[#EBF3FE] text-primary font-semibold' : 'text-muted-foreground'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {ai && <span className="ml-auto text-[9px] font-bold bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full">AI</span>}
              </div>
            ))}
          </nav>
        </aside>

        {/* 메인 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 헤더 */}
          <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <WeddingBoardLogo />
              <div className="w-px h-4 bg-border mx-1" />
              <div className="pl-9 pr-4 py-2 rounded-lg bg-[#F5F6F8] text-xs text-muted-foreground w-52">하객 검색...</div>
            </div>
            <div className="flex items-center gap-1">
              {['대시보드', '하객 명부', '정산 관리', 'Thank You ✨'].map((t, i) => (
                <div key={t} className={`px-3 py-2 text-xs rounded-lg ${i === 0 ? 'bg-[#EBF3FE] text-primary font-semibold' : 'text-muted-foreground'}`}>{t}</div>
              ))}
            </div>
          </header>

          {/* 대시보드 콘텐츠 */}
          <main className="flex-1 px-8 py-6 space-y-4 overflow-hidden">
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '총합 누적 축의금', value: '₩24,800,000', sub: '신랑 ₩12,400,000 · 신부 ₩12,400,000', color: 'bg-emerald-50 text-emerald-500' },
                { label: '전체 하객 수', value: '248명', sub: '정원 300명 대비', color: 'bg-[#EBF3FE] text-primary' },
                { label: '전체 식권 수', value: '235매', sub: '예상 250매 대비', color: 'bg-[#FEE9F0] text-[#DC97AC]' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${card.color} bg-opacity-20 flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded-sm ${card.color}`} />
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 text-muted-foreground">수입</div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* 신랑/신부 현황 */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: '신랑측 현황', color: 'text-primary', bg: 'bg-[#EBF3FE]', guests: ['김철수', '이민준', '박지훈', '최현우'] },
                { title: '신부측 현황', color: 'text-[#DC97AC]', bg: 'bg-[#FEE9F0]', guests: ['김지은', '이수진', '박민지', '최유리'] },
              ].map(({ title, color, bg, guests }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${color}`}>{title}</span>
                      <span className="text-sm font-bold">₩12,400,000</span>
                    </div>
                  </div>
                  <div className="px-5 py-2">
                    {guests.map((name, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center text-xs font-bold ${color}`}>{name[0]}</div>
                          <span className="text-xs font-medium">{name}</span>
                        </div>
                        <span className="text-xs font-semibold">₩100,000</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* 로그인 카드 — 1.5초 후 아래서 올라옴 */}
      <AnimatePresence>
        {showLogin && (
          <>
            {/* 배경 딤처리 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10"
            />
            {/* 로그인 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 flex items-center justify-center px-4"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 w-full max-w-xs">
                <div className="text-center mb-7">
                  <div className="flex justify-center mb-3">
                    <WeddingBoardLogo />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">스마트 웨딩 하객 접수 & 정산</p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-semibold text-foreground shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? '연결 중...' : 'Google로 시작하기'}
                </button>

                {error && (
                  <p className="text-[11px] text-destructive bg-red-50 px-3 py-2 rounded-xl mt-3 text-center">{error}</p>
                )}

                <p className="text-center text-[10px] text-muted-foreground mt-5">
                  본인의 예식 데이터만 접근 가능합니다
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
