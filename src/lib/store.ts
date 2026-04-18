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
    envelopeNumber:  String(row.envelope_
