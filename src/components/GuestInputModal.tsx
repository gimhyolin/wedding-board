import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, AlertTriangle, Check } from 'lucide-react';
import { store, formatEnvelope, PRESET_GROUPS } from '@/lib/store';
import type { Guest, PreGuest } from '@/lib/store';

interface Props {
  open: boolean;
  onClose: () => void;
  editGuest?: Guest | null; // 수정 모드
}

const AMOUNTS = [50000, 100000, 200000, 300000];

type FormState = {
  name: string; phone: string; side: 'groom' | 'bride';
  group: string; groupCustom: string;
  amount: string; mealTickets: string; gift: string;
  envelopeNumber: string; note: string; isOnline: boolean;
};

function defaultForm(guest?: Guest | null): FormState {
  if (guest) {
    return {
      name: guest.name, phone: guest.phone, side: guest.side,
      group: PRESET_GROUPS.includes(guest.group) ? guest.group : '기타',
      groupCustom: PRESET_GROUPS.includes(guest.group) ? '' : guest.group,
      amount: String(guest.amount), mealTickets: String(guest.mealTickets),
      gift: String(guest.gift), envelopeNumber: guest.envelopeNumber, note: guest.note ?? '', isOnline: guest.isOnline ?? false, amountConfirmed: guest.amountConfirmed ?? false,
    };
  }
  return {
    name: '', phone: '', side: 'groom', group: '친구', groupCustom: '',
    amount: '', mealTickets: '1', gift: '1',
    envelopeNumber: store.getNextEnvelopeNumber(), note: '', isOnline: false, amountConfirmed: false,
  };
}

export default function GuestInputModal({ open, onClose, editGuest }: Props) {
  const isEdit = !!editGuest;
  const [form, setForm] = useState<FormState>(() => defaultForm(editGuest));
  const [preResults, setPreResults] = useState<PreGuest[]>([]);
  const [showPreDropdown, setShowPreDropdown] = useState(false);
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [dupConfirmed, setDupConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // editGuest 변경 시 폼 초기화
  useEffect(() => {
    if (open) setForm(defaultForm(editGuest));
    setDupWarning(null); setDupConfirmed(false); setSubmitted(false);
  }, [open, editGuest]);

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleEnvelopeChange(raw: string) {
    // 숫자만 입력해도 # 자동 붙임
    const nums = raw.replace(/[^0-9]/g, '');
    set('envelopeNumber', nums ? `#${nums}` : '');
  }

  function checkDuplicate(): boolean {
    if (dupConfirmed) return true;
    const dup = store.findDuplicate(form.name, form.phone, editGuest?.id);
    if (dup) {
      setDupWarning(`'${dup.name}' (${dup.phone || '번호 없음'})님이 이미 등록되어 있습니다. 그래도 ${isEdit ? '수정' : '등록'}하시겠습니까?`);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkDuplicate()) return;

    const finalGroup = form.group === '기타' && form.groupCustom.trim()
      ? form.groupCustom.trim() : form.group;

    const data = {
      name: form.name.trim(), phone: form.phone.trim(), side: form.side,
      group: finalGroup, groupCustom: form.group === '기타' ? form.groupCustom.trim() : undefined,
      amount: Number(form.amount), mealTickets: Number(form.mealTickets),
      gift: Number(form.gift), envelopeNumber: form.envelopeNumber,
      note: form.note.trim(),
      isOnline: form.isOnline,
      amountConfirmed: form.amountConfirmed,
    };

    if (isEdit && editGuest) {
      await store.updateGuest(editGuest.id, data);
    } else {
      await store.addGuest(data);
    }
    setSubmitted(true);
    setTimeout(() => onClose(), 700);
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-[#F8F9FB] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        {/* 완료 화면 */}
        {submitted && (
          <div className="flex flex-col items-center justify-center py-14 px-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-foreground">{isEdit ? '수정 완료!' : '접수 완료!'}</p>
            <p className="text-xs text-muted-foreground mt-1">{form.name}님 정보가 {isEdit ? '수정' : '등록'}되었습니다.</p>
          </div>
        )}

        {/* 중복 경고 */}
        {!submitted && dupWarning && !dupConfirmed && (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">{dupWarning}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setDupWarning(null); setDupConfirmed(false); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-foreground hover:bg-gray-50 transition-colors">
                취소
              </button>
              <button onClick={() => { setDupConfirmed(true); setDupWarning(null); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
                그래도 {isEdit ? '수정' : '등록'}
              </button>
            </div>
          </div>
        )}

        {/* 입력 폼 */}
        {!submitted && (dupConfirmed || !dupWarning) && (
          <>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EBF3FE] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">{isEdit ? '하객 정보 수정' : '하객 접수'}</h2>
                  <p className="text-[10px] text-muted-foreground">{isEdit ? '정보를 수정하세요' : '새 하객 정보를 입력하세요'}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5 overflow-y-auto">
              {/* 신랑/신부 */}
              <div className="flex rounded-xl overflow-hidden border border-gray-100 p-1 gap-1 bg-[#F5F6F8]">
                {(['groom', 'bride'] as const).map(s => (
                  <button key={s} type="button" onClick={() => set('side', s)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      form.side === s
                        ? s === 'groom' ? 'bg-white shadow-sm text-primary' : 'bg-white shadow-sm text-bride'
                        : 'text-muted-foreground'
                    }`}>
                    {s === 'groom' ? '신랑측' : '신부측'}
                  </button>
                ))}
              </div>

              {/* 이름 / 전화번호 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">이름 *</label>
                  <div className="relative">
                    <input required value={form.name}
                      onChange={e => {
                        set('name', e.target.value);
                        if (!isEdit) {
                          const results = store.searchPreGuests(e.target.value);
                          setPreResults(results);
                          setShowPreDropdown(results.length > 0 && e.target.value.trim().length > 0);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowPreDropdown(false), 150)}
                      placeholder="홍길동" className={inputCls} />
                    {showPreDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-50 max-h-40 overflow-y-auto">
                        {preResults.map(pg => (
                          <button key={pg.id} type="button"
                            onMouseDown={() => {
                              set('name', pg.name);
                              set('side', pg.side);
                              set('group', PRESET_GROUPS.includes(pg.group) ? pg.group : '기타');
                              if (!PRESET_GROUPS.includes(pg.group)) set('groupCustom', pg.group);
                              setShowPreDropdown(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F8F9FB] transition-colors text-left">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${pg.side === 'groom' ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-[#DC97AC]'}`}>
                              {pg.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{pg.name}</p>
                              <p className="text-[10px] text-muted-foreground">{pg.group} · {pg.side === 'groom' ? '신랑측' : '신부측'}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">전화번호</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="010-0000-0000" className={inputCls} />
                </div>
              </div>

              {/* 그룹 */}
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">그룹</label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_GROUPS.map(g => (
                    <button key={g} type="button" onClick={() => set('group', g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        form.group === g
                          ? 'bg-primary text-white'
                          : 'bg-[#F5F6F8] text-muted-foreground hover:text-foreground'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
                {form.group === '기타' && (
                  <input value={form.groupCustom} onChange={e => set('groupCustom', e.target.value)}
                    placeholder="그룹명 직접 입력"
                    className={`${inputCls} mt-2`} />
                )}
              </div>

              {/* 축의금 */}
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">축의금 <span className="text-muted-foreground font-normal">(추후 입력 가능)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₩</span>
                  <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                    placeholder="100,000"
                    className={`${inputCls} pl-7`} />
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {AMOUNTS.map(amt => (
                    <button key={amt} type="button" onClick={() => set('amount', String(amt))}
                      className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                        form.amount === String(amt) ? 'bg-primary text-white' : 'bg-[#F5F6F8] text-muted-foreground hover:text-foreground'
                      }`}>
                      {amt / 10000}만
                    </button>
                  ))}
                </div>
              </div>

              {/* 식권 / 답례품 / 봉투번호 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">식권 수</label>
                  <input type="number" min="0" value={form.mealTickets} onChange={e => set('mealTickets', e.target.value)}
                    className={`${inputCls} text-center`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">답례품</label>
                  <input type="number" min="0" value={form.gift} onChange={e => set('gift', e.target.value)}
                    className={`${inputCls} text-center`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                    봉투번호
                    <span className="text-primary ml-1">자동</span>
                  </label>
                  <input
                    value={form.envelopeNumber}
                    onChange={e => handleEnvelopeChange(e.target.value)}
                    placeholder="#1"
                    className={`${inputCls} text-center`}
                  />
                </div>
              </div>

              {/* 온라인 송금 + 정산 완료 */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 온라인 송금 */}
                <button type="button" onClick={() => set('isOnline', !form.isOnline)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    form.isOnline ? 'border-primary bg-[#EBF3FE]' : 'border-gray-100 bg-[#F8F9FB]'
                  }`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                    form.isOnline ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                  }`}>
                    {form.isOnline && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">온라인 송금</p>
                    <p className="text-[10px] text-muted-foreground">계좌이체</p>
                  </div>
                </button>

                {/* 정산 완료 */}
                <button type="button" onClick={() => set('amountConfirmed', !form.amountConfirmed)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    form.amountConfirmed ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-[#F8F9FB]'
                  }`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                    form.amountConfirmed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'
                  }`}>
                    {form.amountConfirmed && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">정산 완료</p>
                    <p className="text-[10px] text-muted-foreground">금액 확인됨</p>
                  </div>
                </button>
              </div>

              {/* 비고 */}
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">비고</label>
                <textarea value={form.note} onChange={e => set('note', e.target.value)}
                  placeholder="특이사항, 메모 등 자유롭게 입력하세요"
                  rows={2}
                  className={`${inputCls} resize-none`} />
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                {isEdit ? '수정 완료' : '접수 완료'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
