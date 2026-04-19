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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">

      {/* 배경 대시보드 미리보기 (블러 + 투명도) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[#F0F2F5]">
          {/* 대시보드 미리보기 레이아웃 */}
          <div className="flex h-full opacity-30">
            {/* 사이드바 */}
            <div className="w-48 bg-white border-r border-gray-100 p-4 flex flex-col gap-3">
              <div className="h-6 w-28 bg-gray-200 rounded-lg mt-2" />
              <div className="mt-4 flex flex-col gap-2">
                {[80, 64, 72, 60].map((w, i) => (
                  <div key={i} className="h-8 rounded-xl bg-gray-100" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            {/* 메인 */}
            <div className="flex-1 p-6 flex flex-col gap-4">
              {/* 헤더 */}
              <div className="h-12 bg-white rounded-2xl border border-gray-100" />
              {/* 통계 카드 */}
              <div className="grid grid-cols-3 gap-3">
                {['bg-blue-50', 'bg-pink-50', 'bg-emerald-50'].map((c, i) => (
                  <div key={i} className={`h-24 ${c} rounded-2xl border border-gray-100`} />
                ))}
              </div>
              {/* 테이블 */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-50 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* 블러 오버레이 */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/40" />
      </div>

      {/* 로그인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xs"
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
