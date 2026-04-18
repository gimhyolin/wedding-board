import { useState } from 'react';import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import WeddingBoardLogo from '@/components/WeddingBoardLogo';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('가입 완료! 바로 로그인해주세요.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      if (msg.includes('Invalid login credentials')) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      else if (msg.includes('User already registered')) setError('이미 가입된 이메일입니다.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><WeddingBoardLogo /></div>
          <p className="text-xs text-muted-foreground">스마트 웨딩 하객 접수 & 정산 대시보드</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-foreground mb-5">{mode === 'login' ? '로그인' : '회원가입'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">이메일</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-[#F8F9FB] text-xs outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">비밀번호</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="6자리 이상" minLength={6} className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-[#F8F9FB] text-xs outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            {error && <p className="text-[11px] text-destructive bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-[11px] text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-4">본인의 예식 데이터만 접근 가능합니다</p>
      </motion.div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import WeddingBoardLogo from '@/components/WeddingBoardLogo';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('가입 완료! 바로 로그인해주세요.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      if (msg.includes('Invalid login credentials')) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      else if (msg.includes('User already registered')) setError('이미 가입된 이메일입니다.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><WeddingBoardLogo /></div>
          <p className="text-xs text-muted-foreground">스마트 웨딩 하객 접수 & 정산 대시보드</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-foreground mb-5">{mode === 'login' ? '로그인' : '회원가입'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">이메일</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-[#F8F9FB] text-xs outline-none focus:ring-2 focus:ring-primary/20" />
