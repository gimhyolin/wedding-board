import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import WeddingBoardLogo from '@/components/WeddingBoardLogo';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#F0F2F5]">

      {/* 배경 대시보드 미리보기 */}
      <div className="absolute inset-0 z-0 flex">
        {/* 사이드바 */}
        <div className="w-52 bg-white border-r border-gray-200 p-5 flex flex-col gap-3 shrink-0">
          <div className="h-5 w-32 bg-gray-800 rounded-md" />
          <div className="h-3 w-20 bg-gray-300 rounded-md mt-1" />
          <div className="mt-3 flex flex-col gap-1.5">
            {['현황 대시보드', '하객 명부', '정산 관리', 'Thank You'].map((label, i) => (
              <div key={i} className={`h-8 rounded-xl flex items-center px-3 gap-2 ${i === 0 ? 'bg-blue-50' : ''}`}>
                <div className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-blue-400' : 'bg-gray-300'}`} />
                <div className={`h-2.5 rounded-sm ${i === 0 ? 'bg-blue-400 w-20' : 'bg-gray-200'}`} style={{ width: `${[80,60,64,56][i]}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3">
            <div className="h-4 w-24 bg-gray-800 rounded-md" />
            <div className="w-px h-4 bg-gray-200" />
            <div className="h-8 w-44 bg-gray-100 rounded-lg" />
            <div className="ml-auto flex gap-2">
              {['대시보드','하객 명부','정산 관리'].map((t, i) => (
                <div key={i} className={`h-7 rounded-lg px-3 flex items-center`}>
                  <div className={`h-2.5 rounded-sm ${i === 0 ? 'bg-blue-400 w-16' : 'bg-gray-300 w-14'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* 대시보드 콘텐츠 */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            {/* 통계 카드 3개 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { bg: 'bg-white', accent: 'bg-emerald-400', w: 'w-24', label: '총 축의금', value: '₩12,400,000' },
                { bg: 'bg-white', accent: 'bg-blue-400', w: 'w-20', label: '전체 하객', value: '124명' },
                { bg: 'bg-white', accent: 'bg-pink-400', w: 'w-16', label: '전체 식권', value: '118매' },
              ].map((card, i) => (
                <div key={i} className={`${card.bg} rounded-2xl border border-gray-100 p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-xl ${i === 0 ? 'bg-emerald-50' : i === 1 ? 'bg-blue-50' : 'bg-pink-50'} flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded-sm ${card.accent}`} />
                    </div>
                    <div className="h-4 w-12 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-6 w-28 bg-gray-800 rounded-md mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded-md" />
                </div>
              ))}
            </div>

            {/* 신랑/신부 현황 */}
            <div className="grid grid-cols-2 gap-3">
              {['신랑측 현황', '신부측 현황'].map((title, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-5 w-16 rounded-md ${i === 0 ? 'bg-blue-100' : 'bg-pink-100'}`} />
                    <div className="h-5 w-20 bg-gray-200 rounded-md" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${i === 0 ? 'bg-blue-100' : 'bg-pink-100'}`} />
                          <div className="h-3 w-16 bg-gray-200 rounded-md" />
                        </div>
                        <div className="h-3 w-16 bg-gray-300 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 블러 오버레이 */}
      <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/50" />

      {/* 로그인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-xs"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-2xl p-8">
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
    </div>
  );
}
