import { useEffect, useState } from 'react';
import { store } from './store';
import type { Guest, EventConfig } from './store';

// 앱 시작 시 Supabase에서 데이터 로드
export function useInitStore() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    store.init().then(() => setReady(true));
  }, []);
  return ready;
}

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>(() => store.getGuests());
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingSync] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => setGuests(store.getGuests()));
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      unsub();
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { guests, online, pendingSync };
}

export function useSettlement() {
  const [data, setData] = useState(() => store.getSettlement());
  useEffect(() => {
    return store.subscribe(() => setData(store.getSettlement()));
  }, []);
  return data;
}

export function useEventConfig() {
  const [data, setData] = useState<EventConfig>(() => store.getEventConfig());
  useEffect(() => {
    return store.subscribe(() => setData(store.getEventConfig()));
  }, []);
  return data;
}

export function usePreGuests() {
  const [preGuests, setPreGuests] = useState(() => store.getPreGuests());
  useEffect(() => {
    return store.subscribe(() => setPreGuests(store.getPreGuests()));
  }, []);
  return { preGuests };
}
