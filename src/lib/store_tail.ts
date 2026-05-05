  getPendingCount(): number { return 0; }
  syncPending() {}

  // ── 사전 등록 하객 ─────────────────────────────────────────
  private preGuests: PreGuest[] = [];

  async fetchPreGuests() {
    if (!this.userId) return;
    const { data, error } = await supabase
      .from('pre_guests').select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    this.preGuests = (data ?? []).map(row => ({
      id:         String(row.id),
      name:       String(row.name),
      side:       row.side as 'groom' | 'bride',
      group:      String(row.group ?? '친구'),
      groupCustom: row.group_custom ? String(row.group_custom) : undefined,
    }));
    this.notify();
  }

  getPreGuests(): PreGuest[] { return [...this.preGuests]; }

  async addPreGuest(data: Omit<PreGuest, 'id'>): Promise<PreGuest | null> {
    if (!this.userId) return null;
    const { data: row, error } = await supabase
      .from('pre_guests')
      .insert({
        name: data.name, side: data.side,
        group: data.group, group_custom: data.groupCustom ?? '',
        user_id: this.userId,
      })
      .select().single();
    if (error) { console.error(error); return null; }
    const preGuest: PreGuest = {
      id: String(row.id), name: row.name,
      side: row.side, group: row.group,
      groupCustom: row.group_custom || undefined,
    };
    this.preGuests.push(preGuest);
    this.notify();
    return preGuest;
  }

  async updatePreGuest(id: string, updates: Partial<Omit<PreGuest, 'id'>>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined)       dbUpdates.name         = updates.name;
    if (updates.side !== undefined)       dbUpdates.side         = updates.side;
    if (updates.group !== undefined)      dbUpdates.group        = updates.group;
    if (updates.groupCustom !== undefined) dbUpdates.group_custom = updates.groupCustom;
    const { error } = await supabase.from('pre_guests').update(dbUpdates)
      .eq('id', id).eq('user_id', this.userId!);
    if (error) { console.error(error); return; }
    const idx = this.preGuests.findIndex(g => g.id === id);
    if (idx !== -1) { this.preGuests[idx] = { ...this.preGuests[idx], ...updates }; this.notify(); }
  }

  async deletePreGuest(id: string) {
    const { error } = await supabase.from('pre_guests').delete()
      .eq('id', id).eq('user_id', this.userId!);
    if (error) { console.error(error); return; }
    this.preGuests = this.preGuests.filter(g => g.id !== id);
    this.notify();
  }

  searchPreGuests(query: string): PreGuest[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getPreGuests();
    return this.preGuests.filter(g => g.name.toLowerCase().includes(q));
  }
}

export const store = new WeddingStore();
