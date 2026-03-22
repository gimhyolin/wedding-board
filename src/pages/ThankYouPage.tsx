import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useGuests, useEventConfig } from '@/lib/useStore';
import type { Guest } from '@/lib/store';

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

// ── 템플릿 기반 메시지 생성 (무료) ──────────────────────────
const templates: Record<string, Record<string, string[]>> = {
  groom: {
    친구: [
      "{name}님, 오랜 친구로서 함께해 주셔서 더욱 특별한 날이 되었습니다. 앞으로도 좋은 인연 이어가요, 감사합니다.",
      "{name}님, 바쁘신 중에도 먼 걸음 해주셔서 정말 감사드립니다. 덕분에 더욱 행복한 하루였습니다.",
      "{name}님, 함께해 주신 덕분에 더욱 빛나는 날이 되었습니다. 진심으로 감사드립니다.",
    ],
    회사: [
      "{name}님, 바쁘신 일정에도 불구하고 자리를 빛내주셔서 진심으로 감사드립니다. 앞으로도 잘 부탁드립니다.",
      "{name}님, 소중한 시간 내주셔서 감사합니다. 함께해 주신 덕분에 더욱 뜻깊은 날이 되었습니다.",
      "{name}님, 축하해 주셔서 감사합니다. 앞으로도 좋은 관계 이어나가겠습니다.",
    ],
    친척: [
      "{name}님, 가족으로서 함께해 주셔서 마음이 따뜻했습니다. 언제나 건강하시길 바랍니다.",
      "{name}님, 먼 길 와주셔서 진심으로 감사드립니다. 앞으로도 자주 뵙겠습니다.",
      "{name}님, 축하해 주셔서 감사합니다. 가족의 따뜻한 마음이 큰 힘이 되었습니다.",
    ],
    기타: [
      "{name}님, 소중한 자리에 함께해 주셔서 진심으로 감사드립니다. 늘 건강하고 행복하세요.",
      "{name}님, 축하해 주셔서 감사합니다. 덕분에 더욱 행복한 날이 되었습니다.",
    ],
  },
  bride: {
    친구: [
      "{name}님, 오랜 인연으로 함께해 주셔서 정말 기쁘고 감사했습니다. 앞으로도 늘 행복하세요.",
      "{name}님, 소중한 친구로서 함께해 주셔서 더욱 빛나는 날이 되었습니다. 진심으로 감사드립니다.",
      "{name}님, 바쁜 중에도 와주셔서 너무 감사해요. 덕분에 더욱 행복한 하루였습니다.",
    ],
    회사: [
      "{name}님, 귀한 시간 내주셔서 감사드립니다. 함께해 주신 덕분에 더욱 뜻깊은 날이 되었습니다.",
      "{name}님, 바쁘신 중에도 자리를 빛내주셔서 진심으로 감사드립니다.",
      "{name}님, 축하해 주셔서 감사합니다. 앞으로도 잘 부탁드리겠습니다.",
    ],
    친척: [
      "{name}님, 가족의 따뜻한 마음이 큰 힘이 되었습니다. 언제나 건강하시길 바랍니다.",
      "{name}님, 먼 걸음 해주셔서 진심으로 감사드립니다. 자주 뵐 수 있으면 좋겠습니다.",
      "{name}님, 함께해 주셔서 감사합니다. 앞으로도 가족의 사랑 잊지 않겠습니다.",
    ],
    기타: [
      "{name}님, 소중한 자리에 함께해 주셔서 진심으로 감사드립니다. 늘 건강하고 행복하세요.",
      "{name}님, 축하해 주셔서 감사합니다. 덕분에 더욱 행복한 날이 되었습니다.",
    ],
  },
};

function getTemplate(guest: Guest): string {
  const side = guest.side;
  const group = guest.group as string;
  const key = Object.keys(templates[side]).includes(group) ? group : '기타';
  const list = templates[side][key];
  const idx = Math.floor(Math.random() * list.length);
  return list[idx].replace('{name}', guest.name);
}

async function generateMessages(
  guests: Guest[],
  _groomName: string,
  _brideName: string
): Promise<Record<string, string>> {
  // 살짝 딜레이 줘서 생성 중 UX 체험
  await new Promise(res => setTimeout(res, 800 + Math.random() * 600));
  const result: Record<string, string> = {};
  guests.forEach(g => { result[g.id] = getTemplate(g); });
  return result;
}

// ── 복사 버튼 ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
        copied ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F5F6F8] text-muted-foreground hover:text-foreground'
      }`}>
      {copied ? <><Check className="w-3 h-3" />복사됨</> : <><Copy className="w-3 h-3" />복사</>}
    </button>
  );
}

// ── 하객 카드 ─────────────────────────────────────────────────
function GuestCard({ guest, message, onRegenerate, loading }: {
  guest: Guest;
  message: string;
  onRegenerate: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(true);
  const isGroom = guest.side === 'groom';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFBFC] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isGroom ? 'bg-[#EBF3FE] text-primary' : 'bg-[#FEE9F0] text-[#DC97AC]'
          }`}>
            {guest.name.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-foreground">{guest.name}</p>
            <p className="text-[10px] text-muted-foreground">{guest.group} · {isGroom ? '신랑측' : '신부측'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-50">
              {loading ? (
                <div className="flex items-center gap-2 py-3">
                  <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                  <span className="text-xs text-muted-foreground">메시지 생성 중...</span>
                </div>
              ) : message ? (
                <>
                  <p className="text-xs text-foreground leading-relaxed bg-[#F8F9FB] rounded-xl px-3 py-2.5 mt-1">{message}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <button onClick={() => onRegenerate(guest.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#F5F6F8] text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="w-3 h-3" />다시 생성
                    </button>
                    <CopyButton text={message} />
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-2">위의 메시지 생성하기 버튼을 눌러주세요.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function ThankYouPage() {
  const { guests } = useGuests();
  const evt = useEventConfig();
  const [messages, setMessagesState] = useState<Record<string, string>>(() => {
    try {
      const saved = sessionStorage.getItem('thankyou_messages');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'groom' | 'bride'>('all');
  const [generated, setGenerated] = useState(() => {
    try {
      return sessionStorage.getItem('thankyou_generated') === 'true';
    } catch { return false; }
  });
  const [error, setError] = useState<string | null>(null);

  // sessionStorage 동기화
  function setMessages(val: Record<string, string>) {
    setMessagesState(val);
    try { sessionStorage.setItem('thankyou_messages', JSON.stringify(val)); } catch {}
  }
  function setGeneratedAndSave(val: boolean) {
    setGenerated(val);
    try { sessionStorage.setItem('thankyou_generated', String(val)); } catch {}
  }

  const filtered = guests.filter(g => filter === 'all' || g.side === filter);
  const allCopied = filtered.map(g => messages[g.id] ? `[${g.name}]\n${messages[g.id]}` : '').filter(Boolean).join('\n\n');

  async function handleGenerateAll() {
    if (!guests.length) return;
    setLoadingAll(true);
    setError(null);
    try {
      const result = await generateMessages(guests, evt.groomName, evt.brideName);
      setMessages(result);
      setGeneratedAndSave(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setLoadingAll(false);
    }
  }

  async function handleRegenerate(id: string) {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;
    setLoadingId(id);
    setError(null);
    try {
      const result = await generateMessages([guest], evt.groomName, evt.brideName);
      setMessages({ ...messages, [id]: result[id] ?? messages[id] });
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-4 lg:space-y-5 pb-28">

      {/* 헤더 */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-bold text-foreground">Thank You</h1>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">하객별 관계와 그룹을 분석해 개인화된 감사 메시지를 자동 생성합니다.</p>
        </div>
      </motion.div>

      {/* 생성 카드 */}
      <motion.div variants={fadeUp} className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">감사 메시지 일괄 생성</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              총 <span className="font-semibold text-foreground">{guests.length}명</span>의 하객에게 각기 다른 개인화 메시지를 생성합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleGenerateAll} disabled={loadingAll || !guests.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingAll
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />생성 중...</>
              : <><Sparkles className="w-3.5 h-3.5" />{generated ? '다시 생성' : '메시지 생성하기'}</>
            }
          </button>
          {generated && allCopied && <CopyButton text={allCopied} />}
        </div>

        {error && (
          <p className="text-[11px] text-destructive mt-2 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {generated && !error && (
          <p className="text-[10px] text-purple-500 mt-2">✓ {Object.keys(messages).length}개 메시지 생성 완료</p>
        )}
      </motion.div>

      {/* 필터 */}
      {guests.length > 0 && (
        <motion.div variants={fadeUp} className="flex items-center gap-1 bg-[#F5F6F8] rounded-xl p-1 w-fit">
          {([['all', '전체'], ['groom', '신랑측'], ['bride', '신부측']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === val ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {label}
            </button>
          ))}
        </motion.div>
      )}

      {/* 하객 목록 */}
      {guests.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <Sparkles className="w-8 h-8 text-purple-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">등록된 하객이 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">하객 명부에서 먼저 하객을 등록해주세요.</p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(g => (
            <motion.div key={g.id} variants={fadeUp}>
              <GuestCard
                guest={g}
                message={messages[g.id] ?? ''}
                onRegenerate={handleRegenerate}
                loading={loadingId === g.id}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
