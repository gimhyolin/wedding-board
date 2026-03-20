import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useSettlement, useGuests } from '@/lib/useStore';
import { store } from '@/lib/store';
import { downloadExcel } from '@/lib/download';

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function SettlementPage() {
  const s = useSettlement();
  const { guests } = useGuests();
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    totalSeats:      String(s.config.totalSeats),
    mealTicketPrice: String(s.config.mealTicketPrice),
  });

  async function saveConfig() {
    await store.updateConfig({
      totalSeats:      Number(configForm.totalSeats),
      mealTicketPrice: Number(configForm.mealTicketPrice),
    });
    setShowConfig(false);
  }

  const finalNet = s.amounts.total - s.costs.guaranteed;

  return (
    <motion.div initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-4 lg:space-y-5 pb-28">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-foreground">정산 관리</h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">축의금 수입, 식권 비용, 최종 정산 내역을 확인하세요.</p>
        </div>
        <button onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-100 shadow-sm text-xs font-medium text-foreground hover:shadow-md transition-shadow shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">단가 설정</span>
        </button>
      </motion.div>

      {/* 단가 설정 패널 */}
      {showConfig && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <p className="text-xs font-bold text-amber-700 mb-3">단가 설정 (변경 시 정산이 자동 반영됩니다)</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: '보증 인원 (석)', key: 'totalSeats' as const },
              { label: '식권 단가 (₩)', key: 'mealTicketPrice' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold text-amber-700 mb-1">{label}</label>
                <input type="number" value={configForm[key]}
                  onChange={e => setConfigForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs text-foreground outline-none focus:ring-2 focus:ring-amber-300 tabular-nums" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowConfig(false)}
              className="flex-1 py-2 rounded-xl border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">취소</button>
            <button onClick={saveConfig}
              className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">저장</button>
          </div>
        </motion.div>
      )}

      {/* 1. 보고서 내보내기 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5">
        <p className="text-sm font-bold text-foreground mb-3">보고서 내보내기</p>
        <button onClick={() => downloadExcel(guests)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#F5F6F8] hover:bg-gray-100 transition-colors text-left group w-full sm:w-auto">
          <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">전체 명부 (Excel)</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">모든 하객 정보 포함</p>
          </div>
          <Download className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
        </button>
      </motion.div>

      {/* 2. 축의금 현황 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 lg:px-5 py-3.5 border-b border-gray-50">
          <p className="text-sm font-bold text-foreground">축의금 현황</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
          {[
            { label: '신랑측', count: s.counts.groom, amount: s.amounts.groom, avg: s.amounts.groomAvg, bg: '', color: 'text-primary' },
            { label: '신부측', count: s.counts.bride, amount: s.amounts.bride, avg: s.amounts.brideAvg, bg: '', color: 'text-[#DC97AC]' },
            { label: '합계',   count: s.counts.total, amount: s.amounts.total, avg: s.amounts.avg,      bg: 'bg-[#F8FAFC]', color: 'text-foreground' },
          ].map(({ label, count, amount, avg, bg, color }) => (
            <div key={label} className={`px-5 py-4 ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold ${color}`}>{label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{count}명</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">₩{amount.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">평균 ₩{avg.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. 식권 현황 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 lg:px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">식권 현황</p>
          <span className="text-xs text-muted-foreground tabular-nums">단가 ₩{s.config.mealTicketPrice.toLocaleString()}</span>
        </div>
        <div className="px-4 lg:px-5 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">발권 현황</span>
              <span className="text-xs font-bold text-foreground tabular-nums">
                {s.tickets.total} / {s.config.totalSeats}석 ({s.tickets.pct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full"
                initial={{ width: 0 }} animate={{ width: `${s.tickets.pct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#EBF3FE] rounded-xl px-4 py-3.5">
              <p className="text-[10px] font-medium text-primary mb-1">실제 발권 비용</p>
              <p className="text-lg lg:text-xl font-bold text-foreground tabular-nums">₩{s.costs.ticket.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.tickets.total}매 × ₩{s.config.mealTicketPrice.toLocaleString()}</p>
            </div>
            <div className="bg-[#F5F6F8] rounded-xl px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">보증 식대 (전체)</p>
              <p className="text-lg lg:text-xl font-bold text-foreground tabular-nums">₩{s.costs.guaranteed.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.config.totalSeats}석 × ₩{s.config.mealTicketPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. 답례품 현황 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 lg:px-5 py-3.5 border-b border-gray-50">
          <p className="text-sm font-bold text-foreground">답례품 현황</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-50">
          {[
            { label: '신랑측', value: `${s.gifts.groom}개`, color: 'text-primary' },
            { label: '신부측', value: `${s.gifts.bride}개`, color: 'text-[#DC97AC]' },
            { label: '합계',   value: `${s.gifts.total}개`, color: 'text-foreground' },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
              <p className={`text-xl lg:text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5. 최종 정산 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 lg:px-5 py-3.5 border-b border-gray-50">
          <p className="text-sm font-bold text-foreground">최종 정산 내역</p>
        </div>
        <div className="px-4 lg:px-5 py-4 space-y-1">
          {[
            { label: '총 축의금 수입',                       value: `+₩${s.amounts.total.toLocaleString()}`,    color: 'text-emerald-600' },
            { label: `보증 식대 (${s.config.totalSeats}석)`, value: `-₩${s.costs.guaranteed.toLocaleString()}`, color: 'text-destructive' },
          ].map((row, i, arr) => (
            <div key={row.label} className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className={`text-xs font-bold tabular-nums ${row.color}`}>{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-100">
            <span className="text-sm font-bold text-foreground">최종 수익</span>
            <span className={`text-lg font-bold tabular-nums ${finalNet >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
              {finalNet >= 0 ? '+' : ''}₩{finalNet.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
