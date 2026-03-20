import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Pencil, Trash2, Users, X, Smartphone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useGuests } from '@/lib/useStore';
import { store, formatTime } from '@/lib/store';
import type { Guest } from '@/lib/store';
import GuestInputModal from '@/components/GuestInputModal';
import { downloadExcel } from '@/lib/download';

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Badge({ type, label }: { type: 'groom' | 'bride' | 'info'; label: string }) {
  const styles = {
    groom: 'bg-[#EBF3FE] text-primary border border-primary/10',
    bride: 'bg-[#FEE9F0] text-bride border border-bride/10',
    info:  'bg-[#F0F9F4] text-emerald-600 border border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${styles[type]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

// ── 온라인 송금 내역 모달 ────────────────────────────────────
function OnlineModal({ guests, onClose }: { guests: Guest[]; onClose: () => void }) {
  const onlineGuests = guests.filter(g => g.isOnline);
  const groomOnline  = onlineGuests.filter(g => g.side === 'groom');
  const brideOnline  = onlineGuests.filter(g => g.side === 'bride');
  const totalAmount  = onlineGuests.reduce((s, g) => s + g.amount, 0);
  const groomAmount  = groomOnline.reduce((s, g) => s + g.amount, 0);
  const brideAmount  = brideOnline.reduce((s, g) => s + g.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">온라인 송금 내역</h2>
              <p className="text-[10px] text-muted-foreground">총 {onlineGuests.length}건 · ₩{totalAmount.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 shrink-0">
          {[
            { label: '신랑측', count: groomOnline.length, amount: groomAmount, color: 'text-primary', bg: 'bg-[#EBF3FE]' },
            { label: '신부측', count: brideOnline.length, amount: brideAmount, color: 'text-bride',   bg: 'bg-[#FEE9F0]' },
          ].map(({ label, count, amount, color, bg }) => (
            <div key={label} className={`px-5 py-3 ${bg}/30`}>
              <p className="text-[10px] text-muted-foreground">{label} ({count}건)</p>
              <p className={`text-base font-bold tabular-nums ${color}`}>₩{amount.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* 목록 */}
        <div className="overflow-y-auto flex-1">
          {onlineGuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Smartphone className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">온라인 송금 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {onlineGuests.map(g => {
                const isGroom = g.side === 'groom';
                return (
                  <div key={g.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>
                      {g.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-foreground">{g.name}</p>
                        <Badge type={isGroom ? 'groom' : 'bride'} label={isGroom ? '신랑측' : '신부측'} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{g.phone} · {formatTime(g.receivedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">₩{g.amount.toLocaleString()}</p>
                      {g.envelopeNumber && (
                        <p className="text-[10px] text-muted-foreground">{g.envelopeNumber}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 합계 */}
        {onlineGuests.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F8F9FB] flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground">온라인 송금 합계</span>
            <span className="text-sm font-bold text-emerald-600 tabular-nums">₩{totalAmount.toLocaleString()}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

type Filter = 'all' | 'groom' | 'bride';
type SortKey = 'date' | 'amount' | 'name';

export default function GuestListPage() {
  const location = useLocation();
  const { guests } = useGuests();

  // URL 쿼리파라미터로 검색어 초기화 (헤더 검색에서 넘어올 때)
  const urlSearch = new URLSearchParams(location.search).get('search') || '';
  const [search, setSearch] = useState(urlSearch);
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  // URL search 바뀔 때 동기화
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const groomGuests = guests.filter(g => g.side === 'groom');
  const brideGuests = guests.filter(g => g.side === 'bride');
  const groomAmount = groomGuests.reduce((s, g) => s + g.amount, 0);
  const brideAmount = brideGuests.reduce((s, g) => s + g.amount, 0);

  const filtered = guests
    .filter(g => {
      if (filter === 'groom' && g.side !== 'groom') return false;
      if (filter === 'bride' && g.side !== 'bride') return false;
      if (search && !g.name.includes(search) && !g.phone.includes(search)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'name')   return a.name.localeCompare(b.name, 'ko');
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });

  const counts: Record<Filter, number> = { all: guests.length, groom: groomGuests.length, bride: brideGuests.length };

  function handleEdit(g: Guest) {
    setEditGuest(g);
    setShowEditModal(true);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`${name}님의 기록을 삭제하시겠습니까?`)) await store.deleteGuest(id);
  }

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-4 lg:space-y-5 pb-28">
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground">하객 명부</h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">전체 하객 정보를 확인하고 관리하세요.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 온라인 송금 내역 버튼 */}
            <button
              onClick={() => setShowOnlineModal(true)}
              className="flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-600 hover:bg-emerald-100 transition-colors shrink-0">
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">온라인 송금</span>
              {guests.filter(g => g.isOnline).length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {guests.filter(g => g.isOnline).length}
                </span>
              )}
            </button>
            <button
              onClick={() => downloadExcel(guests)}
              className="flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-lg bg-white border border-gray-100 shadow-sm text-xs font-medium text-foreground hover:shadow-md transition-shadow shrink-0">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
            </button>
          </div>
        </motion.div>

        {/* 요약 카드 */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-2 lg:mb-3">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#EBF3FE] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
              </div>
              <Badge type="groom" label="신랑측" />
            </div>
            <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">{groomGuests.length}명</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">₩{groomAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-2 lg:mb-3">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#FEE9F0] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#DC97AC]" />
              </div>
              <Badge type="bride" label="신부측" />
            </div>
            <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">{brideGuests.length}명</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">₩{brideAmount.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* 필터 + 검색 */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1 bg-[#F5F6F8] rounded-xl p-1 shrink-0">
              {(['all', 'groom', 'bride'] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {f === 'all' ? '전체' : f === 'groom' ? '신랑측' : '신부측'}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-muted-foreground'
                  }`}>{counts[f]}</span>
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="이름 또는 전화번호..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F6F8] text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
              className="px-3 py-2 rounded-lg bg-[#F5F6F8] text-xs text-foreground outline-none border-none shrink-0">
              <option value="date">최신순</option>
              <option value="amount">금액순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </motion.div>

        {/* 테이블 */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground bg-[#F8F9FB] border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">구분</th>
                  <th className="text-left px-4 py-3 font-medium">하객 정보</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">그룹</th>
                  <th className="text-right px-4 py-3 font-medium">축의금</th>
                  <th className="text-center px-4 py-3 font-medium">식권</th>
                  <th className="text-center px-4 py-3 font-medium">답례품</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">봉투번호</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">접수시간</th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">송금</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">비고</th>
                  <th className="text-center px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      {search ? `'${search}' 검색 결과가 없습니다.` : '등록된 하객이 없습니다.'}
                    </td>
                  </tr>
                ) : filtered.map((g, i) => {
                  const isGroom = g.side === 'groom';
                  return (
                    <tr key={g.id} className="border-b border-gray-50 last:border-0 hover:bg-[#FAFBFC] transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Badge type={isGroom ? 'groom' : 'bride'} label={isGroom ? '신랑측' : '신부측'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>
                            {g.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{g.name}</p>
                            <p className="text-[10px] text-muted-foreground">{g.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded-lg bg-[#F5F6F8] text-[10px] font-medium text-muted-foreground">{g.group}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-foreground tabular-nums">{`₩${g.amount.toLocaleString()}`}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-bride'}`}>{g.mealTickets}매</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F0F9F4] text-emerald-600 text-[11px] font-semibold">{g.gift}개</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono hidden md:table-cell">{g.envelopeNumber || '-'}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground hidden md:table-cell">{formatTime(g.receivedAt)}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {g.isOnline && (
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-semibold">온라인</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{g.note || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(g)}
                            className="p-1.5 rounded-lg hover:bg-[#EBF3FE] transition-colors text-muted-foreground hover:text-primary">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDelete(g.id, g.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-[#F8F9FB]">
            <p className="text-xs text-muted-foreground">
              총 <span className="font-bold text-foreground">{filtered.length}</span>명
              <span className="ml-2 font-semibold text-foreground tabular-nums hidden sm:inline">
                합계: ₩{filtered.reduce((s, g) => s + g.amount, 0).toLocaleString()}
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* 수정 모달 */}
      <GuestInputModal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setEditGuest(null); }}
        editGuest={editGuest}
      />

      {/* 온라인 송금 모달 */}
      <AnimatePresence>
        {showOnlineModal && (
          <OnlineModal guests={guests} onClose={() => setShowOnlineModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
