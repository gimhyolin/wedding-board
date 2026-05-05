import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, Users } from 'lucide-react';
import { store } from '@/lib/store';
import { usePreGuests } from '@/lib/useStore';
import type { PreGuest } from '@/lib/store';

const GROUPS = ['친구', '회사', '친척', '기타'];

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function PreGuestRow({ pg, onEdit, onDelete }: {
  pg: PreGuest;
  onEdit: (pg: PreGuest) => void;
  onDelete: (id: string) => void;
}) {
  const isGroom = pg.side === 'groom';
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFBFC] transition-colors border-b border-gray-50 last:border-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-[#DC97AC]'}`}>
        {pg.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{pg.name}</p>
        <p className="text-[10px] text-muted-foreground">{pg.group === '기타' && pg.groupCustom ? pg.groupCustom : pg.group} · {isGroom ? '신랑측' : '신부측'}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(pg)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(pg.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PreGuestForm({ initial, onSave, onCancel }: {
  initial?: PreGuest;
  onSave: (data: Omit<PreGuest, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [side, setSide] = useState<'groom' | 'bride'>(initial?.side ?? 'groom');
  const [group, setGroup] = useState(initial?.group ?? '친구');
  const [groupCustom, setGroupCustom] = useState(initial?.groupCustom ?? '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), side, group, groupCustom: group === '기타' ? groupCustom.trim() : '' });
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-100 bg-[#F8F9FB] text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="p-4 space-y-3 bg-[#F8FAFC] border-b border-gray-100">
      {/* 신랑/신부 토글 */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
        {(['groom', 'bride'] as const).map(s => (
          <button key={s} onClick={() => setSide(s)}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${side === s ? (s === 'groom' ? 'bg-white text-primary shadow-sm' : 'bg-white text-[#DC97AC] shadow-sm') : 'text-muted-foreground'}`}>
            {s === 'groom' ? '신랑측' : '신부측'}
          </button>
        ))}
      </div>
      {/* 이름 */}
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="이름 입력" className={inputCls}
        onKeyDown={e => e.key === 'Enter' && handleSave()} />
      {/* 그룹 */}
      <div className="flex gap-1.5 flex-wrap">
        {GROUPS.map(g => (
          <button key={g} onClick={() => setGroup(g)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${group === g ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-gray-200 hover:border-primary/40'}`}>
            {g}
          </button>
        ))}
      </div>
      {group === '기타' && (
        <input value={groupCustom} onChange={e => setGroupCustom(e.target.value)}
          placeholder="그룹명 직접 입력" className={inputCls} />
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-muted-foreground hover:bg-gray-50 transition-colors">
          <X className="w-3 h-3 inline mr-1" />취소
        </button>
        <button onClick={handleSave} disabled={!name.trim()}
          className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-40">
          <Check className="w-3 h-3 inline mr-1" />{initial ? '수정' : '추가'}
        </button>
      </div>
    </div>
  );
}

export default function PreGuestPage() {
  const { preGuests } = usePreGuests();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PreGuest | null>(null);
  const [filter, setFilter] = useState<'all' | 'groom' | 'bride'>('all');
  const [search, setSearch] = useState('');

  const filtered = preGuests
    .filter(g => filter === 'all' || g.side === filter)
    .filter(g => !search.trim() || g.name.includes(search.trim()));

  async function handleSave(data: Omit<PreGuest, 'id'>) {
    if (editTarget) {
      await store.updatePreGuest(editTarget.id, data);
      setEditTarget(null);
    } else {
      await store.addPreGuest(data);
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) await store.deletePreGuest(id);
  }

  const groomCount = preGuests.filter(g => g.side === 'groom').length;
  const brideCount = preGuests.filter(g => g.side === 'bride').length;

  return (
    <motion.div initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-4 lg:space-y-5 pb-28">

      {/* 헤더 */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-foreground">사전 하객 등록</h1>
          <p className="text-xs text-muted-foreground mt-0.5">청첩장 전달 전, 이름과 그룹을 미리 등록해두세요. 당일 접수 시 자동으로 불러옵니다.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditTarget(null); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" />추가
        </button>
      </motion.div>

      {/* 요약 카드 */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: '전체', value: preGuests.length, color: 'text-foreground', bg: 'bg-white' },
          { label: '신랑측', value: groomCount, color: 'text-primary', bg: 'bg-[#EBF3FE]' },
          { label: '신부측', value: brideCount, color: 'text-[#DC97AC]', bg: 'bg-[#FEE9F0]' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 shadow-sm px-4 py-3 text-center`}>
            <p className={`text-xl font-bold ${color}`}>{value}명</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* 추가 폼 */}
      <AnimatePresence>
        {showForm && !editTarget && (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">새 하객 등록</span>
            </div>
            <PreGuestForm onSave={handleSave} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 목록 */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 필터 + 검색 */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <div className="flex gap-1">
            {([['all', '전체'], ['groom', '신랑측'], ['bride', '신부측']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${filter === val ? 'bg-[#EBF3FE] text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="이름 검색..."
            className="ml-auto px-3 py-1.5 rounded-lg bg-[#F5F6F8] text-xs text-foreground placeholder:text-muted-foreground outline-none w-36" />
        </div>

        {/* 리스트 */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">등록된 하객이 없습니다.</p>
            <p className="text-[10px] text-muted-foreground mt-1">상단 추가 버튼을 눌러 등록해주세요.</p>
          </div>
        ) : (
          filtered.map(pg => (
            <div key={pg.id}>
              {editTarget?.id === pg.id ? (
                <PreGuestForm initial={editTarget} onSave={handleSave} onCancel={() => setEditTarget(null)} />
              ) : (
                <PreGuestRow pg={pg} onEdit={setEditTarget} onDelete={handleDelete} />
              )}
            </div>
          ))
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-50 bg-[#F8FAFC]">
            <p className="text-[10px] text-muted-foreground">총 {filtered.length}명</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
