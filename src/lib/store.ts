import { supabase } from './supabase';

export type GuestGroup = '친구' | '회사' | '친척' | '기타' | string;

export interface Guest {
  id: string;
  name: string;
  phone: string;
  side: 'groom' | 'bride';
  group: GuestGroup;
  groupCustom?: string;
  amount: number;
  mealTickets: number;
  gift: number;
  envelopeNumber: string;
  note: string;
  receivedAt: string;
  thanksSent: boolean;
  isOnline: boolean;
  amountConfirmed: boolean;
}

export interface SettlementConfig {
  totalSeats: number;
  mealTicketPrice: number;
  giftPrice: number;
}

export interface EventConfig {
  totalMealTickets: number;
  expectedGuests: number;
  totalGifts: number;
  weddingDate: string;
  groomName: string;
  brideName: string;
  groomAccount: string;
  brideAccount: string;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  totalMealTickets: 0, expectedGuests: 0, totalGifts: 0,
  weddingDate: '', groomName: '', brideName: '',
  groomAccount: '', brideAccount: '',
};

export const DEFAULT_CONFIG: SettlementConfig = {
  totalSeats: 200, mealTicketPrice: 30000, giftPrice: 10000,
};

export const PRESET_GROUPS: GuestGroup[] = ['친구', '회사', '친척', '기타'];

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export function formatEnvelope(val: string): string {
  const num = val.replace(/[^0-9]/g, '');
  return num ? `#${num}` : '';
}

function rowToGuest(row: Record<string, unknown>): Guest {
  return {
    id:              String(row.id),
    name:            String(row.name),
    phone:           String(row.phone ?? ''),
    side:            row.side as 'groom' | 'bride',
    group:           String(row.group ?? '친구'),
    groupCustom:     row.group_custom ? String(row.group_custom) : undefined,
    amount:          Number(row.amount ?? 0),
    mealTickets:     Number(row.meal_tickets ?? 0),
    gift:            Number(row.gift ?? 0),
    envelopeNumber:  String(row.envelope_number ?? ''),
    note:            String(row.note ?? ''),
    receivedAt:      String(row.received_at ?? new Date().toISOString()),
    thanksSent:      Boolean(row.thanks_sent ?? false),
    isOnline:        Boolean(row.is_online ?? false),
    amountConfirmed: Boolean(row.amount_confirmed ?? false),
  };
}

function guestToRow(g: Omit<Guest, 'id' | 'receivedAt' | 'thanksSent'>, userId: string) {
  return {
    name: g.name, phone: g.phone, side: g.side,
    group: g.group, group_custom: g.groupCustom ?? '',
    amount: g.amount, meal_tickets: g.mealTickets,
    gift: g.gift, envelope_number: g.envelopeNumber,
    note: g.note, is_online: g.isOnline,
    amount_confirmed: g.amountConfirmed,
    user_id: userId,
  };
}

class WeddingStore {
  private guests: Guest[] = [];
  private config: SettlementConfig = { ...DEFAULT_CONFIG };
  private eventConfig: EventConfig = { ...DEFAULT_EVENT_CONFIG };
  private listeners = new Set<() => void>();
  private initialized = false;
  private userId: string | null = null;

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private notify() { this.listeners.forEach(fn => fn()); }

  async init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (this.initialized && this.userId === user.id) return;
    this.userId = user.id;
    this.initialized = true;
    await Promise.all([this.fetchGuests(), this.fetchEventConfig()]);
  }

  reset() {
    this.guests = [];
    this.config = { ...DEFAULT_CONFIG };
    this.eventConfig = { ...DEFAULT_EVENT_CONFIG };
    this.initialized = false;
    this.userId = null;
    this.notify();
  }

  async fetchGuests() {
    if (!this.userId) return;
    const { data, error } = await supabase
      .from('guests').select('*')
      .eq('user_id', this.userId)
      .order('received_at', { ascending: false });
    if (error) { console.error(error); return; }
    this.guests = (data ?? []).map(rowToGuest);
    this.notify();
  }

  async fetchEventConfig() {
    if (!this.userId) return;
    const { data, error } = await supabase
      .from('user_event_config').select('*')
      .eq('user_id', this.userId).single();

    if (error && error.code === 'PGRST116') {
      // 유저 설정 없으면 새로 생성
      await supabase.from('user_event_config').insert({ user_id: this.userId });
      return;
    }
    if (error) { console.error(error); return; }
    if (data) {
      this.eventConfig = {
        groomName:        data.groom_name ?? '',
        brideName:        data.bride_name ?? '',
        weddingDate:      data.wedding_date ?? '',
        expectedGuests:   data.expected_guests ?? 0,
        totalMealTickets: data.total_meal_tickets ?? 0,
        totalGifts:       data.total_gifts ?? 0,
        groomAccount:     data.groom_account ?? '',
        brideAccount:     data.bride_account ?? '',
      };
      this.config = {
        totalSeats:      data.total_seats ?? 200,
        mealTicketPrice: data.meal_ticket_price ?? 30000,
        giftPrice:       10000,
      };
      this.notify();
    }
  }

  getGuests(): Guest[] { return [...this.guests]; }

  async addGuest(data: Omit<Guest, 'id' | 'receivedAt' | 'thanksSent'>): Promise<Guest | null> {
    if (!this.userId) return null;
    const { data: row, error } = await supabase
      .from('guests').insert(guestToRow(data, this.userId)).select().single();
    if (error) { console.error(error); return null; }
    const guest = rowToGuest(row);
    this.guests.unshift(guest);
    this.notify();
    return guest;
  }

  async updateGuest(id: string, updates: Partial<Guest>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined)           dbUpdates.name             = updates.name;
    if (updates.phone !== undefined)          dbUpdates.phone            = updates.phone;
    if (updates.side !== undefined)           dbUpdates.side             = updates.side;
    if (updates.group !== undefined)          dbUpdates.group            = updates.group;
    if (updates.groupCustom !== undefined)    dbUpdates.group_custom     = updates.groupCustom;
    if (updates.amount !== undefined)         dbUpdates.amount           = updates.amount;
    if (updates.mealTickets !== undefined)    dbUpdates.meal_tickets     = updates.mealTickets;
    if (updates.gift !== undefined)           dbUpdates.gift             = updates.gift;
    if (updates.envelopeNumber !== undefined) dbUpdates.envelope_number  = updates.envelopeNumber;
    if (updates.note !== undefined)           dbUpdates.note             = updates.note;
    if (updates.thanksSent !== undefined)     dbUpdates.thanks_sent      = updates.thanksSent;
    if (updates.isOnline !== undefined)       dbUpdates.is_online        = updates.isOnline;
    if (updates.amountConfirmed !== undefined) dbUpdates.amount_confirmed = updates.amountConfirmed;

    const { error } = await supabase.from('guests').update(dbUpdates)
      .eq('id', id).eq('user_id', this.userId!);
    if (error) { console.error(error); return; }
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx !== -1) { this.guests[idx] = { ...this.guests[idx], ...updates }; this.notify(); }
  }

  async deleteGuest(id: string) {
    const { error } = await supabase.from('guests').delete()
      .eq('id', id).eq('user_id', this.userId!);
    if (error) { console.error(error); return; }
    this.guests = this.guests.filter(g => g.id !== id);
    this.notify();
  }

  async deleteAllGuests() {
    const { error } = await supabase.from('guests').delete().eq('user_id', this.userId!);
    if (error) { console.error(error); return; }
    this.guests = [];
    this.notify();
  }

  findDuplicate(name: string, phone: string, excludeId?: string): Guest | undefined {
    return this.guests.find(g =>
      g.id !== excludeId &&
      (g.name === name.trim() || (phone.trim() && g.phone === phone.trim()))
    );
  }

  search(query: string): Guest[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getGuests();
    return this.guests.filter(g =>
      g.name.toLowerCase().includes(q) || g.phone.includes(q)
    );
  }

  getNextEnvelopeNumber(): string {
    const nums = this.guests
      .map(g => parseInt(g.envelopeNumber.replace('#', '')))
      .filter(n => !isNaN(n));
    return `#${nums.length > 0 ? Math.max(...nums) + 1 : 1}`;
  }

  getEventConfig(): EventConfig { return { ...this.eventConfig }; }

  async updateEventConfig(updates: Partial<EventConfig>) {
    if (!this.userId) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.groomName !== undefined)        dbUpdates.groom_name         = updates.groomName;
    if (updates.brideName !== undefined)        dbUpdates.bride_name         = updates.brideName;
    if (updates.weddingDate !== undefined)      dbUpdates.wedding_date       = updates.weddingDate || null;
    if (updates.expectedGuests !== undefined)   dbUpdates.expected_guests    = updates.expectedGuests;
    if (updates.totalMealTickets !== undefined) dbUpdates.total_meal_tickets = updates.totalMealTickets;
    if (updates.totalGifts !== undefined)       dbUpdates.total_gifts        = updates.totalGifts;
    if (updates.groomAccount !== undefined)     dbUpdates.groom_account      = updates.groomAccount;
    if (updates.brideAccount !== undefined)     dbUpdates.bride_account      = updates.brideAccount;

    const { error } = await supabase.from('user_event_config')
      .upsert({ ...dbUpdates, user_id: this.userId }, { onConflict: 'user_id' });
    if (error) { console.error(error); return; }
    this.eventConfig = { ...this.eventConfig, ...updates };
    this.notify();
  }

  getConfig(): SettlementConfig { return { ...this.config }; }

  async updateConfig(updates: Partial<SettlementConfig>) {
    if (!this.userId) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.totalSeats !== undefined)      dbUpdates.total_seats       = updates.totalSeats;
    if (updates.mealTicketPrice !== undefined) dbUpdates.meal_ticket_price = updates.mealTicketPrice;

    const { error } = await supabase.from('user_event_config')
      .upsert({ ...dbUpdates, user_id: this.userId }, { onConflict: 'user_id' });
    if (error) { console.error(error); return; }
    this.config = { ...this.config, ...updates };
    this.notify();
  }

  getSettlement() {
    const cfg = this.config;
    const evt = this.eventConfig;
    const all = this.guests;
    const groom = all.filter(g => g.side === 'groom');
    const bride = all.filter(g => g.side === 'bride');

    const totalAmount    = all.reduce((s, g) => s + g.amount, 0);
    const groomAmount    = groom.reduce((s, g) => s + g.amount, 0);
    const brideAmount    = bride.reduce((s, g) => s + g.amount, 0);
    const totalTickets   = all.reduce((s, g) => s + g.mealTickets, 0);
    const groomTickets   = groom.reduce((s, g) => s + g.mealTickets, 0);
    const brideTickets   = bride.reduce((s, g) => s + g.mealTickets, 0);
    const totalGifts     = all.reduce((s, g) => s + g.gift, 0);
    const groomGifts     = groom.reduce((s, g) => s + g.gift, 0);
    const brideGifts     = bride.reduce((s, g) => s + g.gift, 0);

    const onlineGuests      = all.filter(g => g.isOnline);
    const groomOnline       = groom.filter(g => g.isOnline);
    const brideOnline       = bride.filter(g => g.isOnline);
    const totalOnlineAmount = onlineGuests.reduce((s, g) => s + g.amount, 0);
    const groomOnlineAmount = groomOnline.reduce((s, g) => s + g.amount, 0);
    const brideOnlineAmount = brideOnline.reduce((s, g) => s + g.amount, 0);

    const ticketCost     = totalTickets * cfg.mealTicketPrice;
    const guaranteedCost = cfg.totalSeats * cfg.mealTicketPrice;
    const giftCost       = totalGifts * cfg.giftPrice;
    const netRevenue     = totalAmount - guaranteedCost - giftCost;

    const ticketPct = evt.totalMealTickets > 0
      ? Math.min(Math.round((totalTickets / evt.totalMealTickets) * 100), 100) : 0;
    const guestPct = evt.expectedGuests > 0
      ? Math.min(Math.round((all.length / evt.expectedGuests) * 100), 100) : 0;
    const avgAmount  = all.length > 0 ? Math.round(totalAmount / all.length) : 0;
    const groomAvg   = groom.length > 0 ? Math.round(groomAmount / groom.length) : 0;
    const brideAvg   = bride.length > 0 ? Math.round(brideAmount / bride.length) : 0;

    return {
      counts:  { total: all.length, groom: groom.length, bride: bride.length },
      amounts: { total: totalAmount, groom: groomAmount, bride: brideAmount, avg: avgAmount, groomAvg, brideAvg },
      tickets: { total: totalTickets, groom: groomTickets, bride: brideTickets, pct: ticketPct },
      gifts:   { total: totalGifts, groom: groomGifts, bride: brideGifts },
      online:  {
        total: onlineGuests.length, amount: totalOnlineAmount,
        groom: groomOnline.length,  groomAmount: groomOnlineAmount,
        bride: brideOnline.length,  brideAmount: brideOnlineAmount,
      },
      costs:   { ticket: ticketCost, guaranteed: guaranteedCost, gift: giftCost },
      net:     netRevenue, config: cfg, event: evt, guestPct,
    };
  }

  getPendingCount(): number { return 0; }
  syncPending() {}
}

export const store = new WeddingStore();
