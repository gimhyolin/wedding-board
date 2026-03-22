import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, Wallet, Ticket, ArrowUpRight, Settings, Gift, Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGuests, useSettlement, useEventConfig } from '@/lib/useStore';
import { store, formatTime } from '@/lib/store';
import type { EventConfig } from '@/lib/store';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Badge({ type, label }: { type: 'groom' | 'bride' | 'info' | 'warning'; label: string }) {
  const styles = {
    groom:   'bg-[#EBF3FE] text-primary border border-primary/10',
    bride:   'bg-[#FEE9F0] text-bride border border-bride/10',
    info:    'bg-[#F0F9F4] text-emerald-600 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${styles[type]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

// ── 행사 기본값 설정 패널 ─────────────────────────────────────
function EventConfigPanel({ config, onClose }: { config: EventConfig; onClose: () => void }) {
  const [form, setForm] = useState({
    groomName:         config.groomName,
    brideName:         config.brideName,
    weddingDate:       config.weddingDate,
    expectedGuests:    String(config.expectedGuests || ''),
    totalMealTickets:  String(config.totalMealTickets || ''),
    totalGifts:        String(config.totalGifts || ''),
    groomAccount:      config.groomAccount || '',
    brideAccount:      config.brideAccount || '',
  });
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await store.updateEventConfig({
      groomName:        form.groomName.trim(),
      brideName:        form.brideName.trim(),
      weddingDate:      form.weddingDate,
      expectedGuests:   Number(form.expectedGuests) || 0,
      totalMealTickets: Number(form.totalMealTickets) || 0,
      totalGifts:       Number(form.totalGifts) || 0,
      groomAccount:     form.groomAccount.trim(),
      brideAccount:     form.brideAccount.trim(),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-100 bg-[#F8F9FB] text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-primary/20 shadow-md overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#EBF3FE] border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">행사 기본값 설정</span>
          <span className="text-[10px] text-primary/60">— 접수 전 미리 입력해두세요</span>
        </div>
        <button onClick={onClose} className="text-[10px] text-primary/60 hover:text-primary transition-colors">닫기</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* 예식 정보 */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">예식 정보</p>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">신랑 이름</label>
              <input value={form.groomName} onChange={e => setForm(f => ({ ...f, groomName: e.target.value }))}
                placeholder="홍길동" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">신부 이름</label>
              <input value={form.brideName} onChange={e => setForm(f => ({ ...f, brideName: e.target.value }))}
                placeholder="김영희" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">예식일</label>
              <input type="date" value={form.weddingDate} onChange={e => setForm(f => ({ ...f, weddingDate: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">온라인 송금 계좌</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">신랑측 계좌</label>
              <input value={form.groomAccount} onChange={e => setForm(f => ({ ...f, groomAccount: e.target.value }))}
                placeholder="예) 카카오뱅크 1234-5678-9012"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">신부측 계좌</label>
              <input value={form.brideAccount} onChange={e => setForm(f => ({ ...f, brideAccount: e.target.value }))}
                placeholder="예) 국민은행 123456-78-901234"
                className={inputCls} />
            </div>
          </div>
        </div>

        {/* 수량 기본값 */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">수량 기본값</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: '하객 정원 (예상)', key: 'expectedGuests' as const, placeholder: '예) 200', icon: Users },
              { label: '전체 식권 수 (예상)', key: 'totalMealTickets' as const, placeholder: '예) 180', icon: Ticket },
              { label: '답례품 총 개수', key: 'totalGifts' as const, placeholder: '예) 200', icon: Gift },
            ].map(({ label, key, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input type="number" min="0" value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={`${inputCls} pl-7`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary/90'
          }`}>
          {saved ? <><Check className="w-3.5 h-3.5" />저장 완료!</> : '저장하기'}
        </button>
      </div>
    </motion.div>
  );
}

// ── 요약 카드 (예상 대비 현황 표시) ──────────────────────────
function SummaryCard({
  label, value, sub, badge, badgeType, icon: Icon, iconColor, expected, current,
}: {
  label: string; value: string; sub: string;
  badge: string; badgeType: 'groom' | 'bride' | 'info' | 'warning';
  icon: React.ElementType; iconColor: string;
  expected?: number; current?: number;
}) {
  const showBar = expected != null && expected > 0 && current != null;
  const pct = showBar ? Math.min(Math.round((current! / expected!) * 100), 100) : 0;

  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </div>
        <Badge type={badgeType} label={badge} />
      </div>
      <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {showBar ? (
        <div className="mt-2 pt-2 border-t border-gray-50">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{sub}</span>
            <span className="text-[10px] font-bold text-foreground">{pct}%</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
          </div>
        </div>
      ) : (
        <p className="text-[10px] lg:text-[11px] text-muted-foreground mt-2 pt-2 border-t border-gray-50">{sub}</p>
      )}
    </motion.div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function DashboardPage() {
  const { guests } = useGuests();
  const s = useSettlement();
  const evt = useEventConfig();
  const [showConfig, setShowConfig] = useState(false);

  const groomGuests = guests.filter(g => g.side === 'groom');
  const brideGuests = guests.filter(g => g.side === 'bride');
  const isConfigEmpty = !evt.expectedGuests && !evt.totalMealTickets && !evt.totalGifts && !evt.groomName;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4 lg:space-y-5 pb-28">

      {/* 헤더 */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-foreground">
            {evt.groomName && evt.brideName
              ? `${evt.groomName} ♥ ${evt.brideName} 접수 현황`
              : '접수 현황 대시보드'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            {evt.weddingDate
              ? `예식일: ${new Date(evt.weddingDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : '실시간으로 신랑/신부 측 축의 및 식권 현황을 확인하세요.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* 기본값 설정 버튼 */}
          <button
            onClick={() => setShowConfig(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              showConfig
                ? 'bg-primary text-white border-primary'
                : isConfigEmpty
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-foreground border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">기본값 설정</span>
            {isConfigEmpty && !showConfig && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </motion.div>

      {/* 기본값 설정 패널 */}
      <AnimatePresence>
        {showConfig && (
          <EventConfigPanel config={evt} onClose={() => setShowConfig(false)} />
        )}
      </AnimatePresence>

      {/* 기본값 미설정 안내 */}
      {isConfigEmpty && !showConfig && (
        <motion.div variants={fadeUp}
          className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="text-xs text-amber-700">
            접수 전 <button onClick={() => setShowConfig(true)} className="font-bold underline underline-offset-2">기본값 설정</button>에서 하객 정원, 식권 수, 답례품 수량을 먼저 입력해두세요.
          </p>
        </motion.div>
      )}

      {/* 통계 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <SummaryCard
          label="총합 누적 축의금"
          value={`₩${s.amounts.total.toLocaleString()}`}
          sub={`신랑 ₩${s.amounts.groom.toLocaleString()} · 신부 ₩${s.amounts.bride.toLocaleString()}`}
          badge="수입" badgeType="info"
          icon={Wallet} iconColor="bg-emerald-50 text-emerald-500"
        />
        <SummaryCard
          label="전체 하객 수"
          value={`${s.counts.total}명`}
          sub={evt.expectedGuests > 0 ? `정원 ${evt.expectedGuests}명 대비` : `신랑측 ${s.counts.groom}명 · 신부측 ${s.counts.bride}명`}
          badge={evt.expectedGuests > 0 ? `${s.guestPct}%` : '전체'}
          badgeType="groom"
          icon={Users} iconColor="bg-[#EBF3FE] text-primary"
          expected={evt.expectedGuests} current={s.counts.total}
        />
        <SummaryCard
          label="전체 식권 수"
          value={`${s.tickets.total}매`}
          sub={evt.totalMealTickets > 0 ? `예상 ${evt.totalMealTickets}매 대비` : '신랑측 · 신부측 합계'}
          badge={evt.totalMealTickets > 0 ? `${s.tickets.pct}%` : '식권'}
          badgeType="bride"
          icon={Ticket} iconColor="bg-[#FEE9F0] text-bride"
          expected={evt.totalMealTickets} current={s.tickets.total}
        />
      </div>

      {/* 온라인 송금 현황 */}
      {(s.online.total > 0 || evt.groomAccount || evt.brideAccount) && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 lg:px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <Badge type="info" label="온라인 송금" />
            <span className="text-sm font-bold text-foreground">온라인 송금 현황</span>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{s.online.total}건</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-50">
            {[
              { label: '신랑측', count: s.online.groom, amount: s.online.groomAmount, account: evt.groomAccount, color: 'text-primary' },
              { label: '신부측', count: s.online.bride, amount: s.online.brideAmount, account: evt.brideAccount, color: 'text-bride' },
            ].map(({ label, count, amount, account, color }) => (
              <div key={label} className="px-4 lg:px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                  <span className={`text-[10px] font-bold ${color}`}>{count}건</span>
                </div>
                <p className={`text-lg font-bold tabular-nums ${color}`}>{`₩${amount.toLocaleString()}`}</p>
                {account && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{account}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 신랑/신부 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
        {[
          { title: '신랑측 현황', type: 'groom' as const, guests: groomGuests, amount: s.amounts.groom, tickets: s.tickets.groom },
          { title: '신부측 현황', type: 'bride' as const, guests: brideGuests, amount: s.amounts.bride, tickets: s.tickets.bride },
        ].map(({ title, type, guests: sideGuests, amount, tickets }) => {
          const isGroom = type === 'groom';
          const gifts = sideGuests.reduce((sum, g) => sum + g.gift, 0);
          return (
            <motion.div key={type} variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 lg:px-5 pt-4 pb-3 border-b border-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <Badge type={type} label={title} />
                  <p className="text-sm font-bold text-foreground tabular-nums">{`₩${amount.toLocaleString()}`}</p>
                </div>
                {/* 하객수 / 식권 / 답례품 — 같은 라인 */}
                <div className="flex items-center divide-x divide-gray-100">
                  {[
                    { label: '하객 수', value: `${sideGuests.length}명`, color: 'text-foreground' },
                    { label: '식권', value: `${tickets}매`, color: isGroom ? 'text-primary' : 'text-bride' },
                    { label: '답례품', value: `${gifts}개`, color: 'text-foreground' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하객 리스트 */}
              <div className="px-4 lg:px-5 py-2">
                {sideGuests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">아직 등록된 하객이 없습니다.</p>
                ) : sideGuests.slice(0, 4).map(g => (
                  <div key={g.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 -mx-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>
                        {g.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{g.name}</p>
                        <p className="text-[10px] text-muted-foreground hidden sm:block">{formatTime(g.receivedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-foreground tabular-nums">{`₩${g.amount.toLocaleString()}`}</span>
                      {g.isOnline && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">온라인</span>
                      )}
                      {!g.amountConfirmed && (
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">미확인</span>
                      )}
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-medium ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>
                        <Ticket className="w-2.5 h-2.5" />{g.mealTickets}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 lg:px-5 pb-4">
                <Link to="/guests"
                  className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-colors ${isGroom ? 'bg-[#EBF3FE] text-primary hover:bg-[#dbeafe]' : 'bg-[#FEE9F0] text-bride hover:bg-[#fdd5e3]'}`}>
                  전체 명부 보기 <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
