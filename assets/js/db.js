/**
 * STRIDE MB — Unified Backend & Database Controller
 * Works seamlessly with Supabase REST API or Local Storage fallback
 */

const StrideDB = {
  // Supabase Config (Users can set via Admin Settings or Window variables)
  supabaseUrl: localStorage.getItem('stridemb_supabase_url') || '',
  supabaseKey: localStorage.getItem('stridemb_supabase_anon_key') || '',

  isSupabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseKey);
  },

  async query(table, options = {}) {
    if (this.isSupabaseConfigured()) {
      try {
        const url = `${this.supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
        const headers = {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': options.prefer || 'return=representation'
        };

        const res = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local state:', err);
      }
    }

    // Local Storage Mock Engine
    return this.mockEngine(table, options);
  },

  mockEngine(table, options) {
    const key = `stridemb_db_${table}`;
    let data = JSON.parse(localStorage.getItem(key) || 'null');

    // Default Seed Data if fresh
    if (!data) {
      if (table === 'vip_bookings') {
        data = [
          { id: '1', first_name: 'Julian', last_name: 'Vance', email: 'julian.vance@beverlyhills.co', phone: '+1 (310) 902-4411', requested_silhouettes: 'Aura Runner Pacific Dune US 10.5', preferred_date: '2026-09-24', preferred_time: '10:00 AM PST', status: 'confirmed', created_at: new Date().toISOString() },
          { id: '2', first_name: 'Elena', last_name: 'Rostova', email: 'elena@rostovacurates.com', phone: '+1 (310) 554-8920', requested_silhouettes: 'Midnight Strider 01 US 8.5', preferred_date: '2026-09-25', preferred_time: '2:30 PM PST', status: 'pending', created_at: new Date().toISOString() },
          { id: '3', first_name: 'Marcus', last_name: 'Chen', email: 'mchen@coastalcapital.vc', phone: '+1 (415) 322-9014', requested_silhouettes: 'All collaborative runners US 11.0', preferred_date: '2026-09-26', preferred_time: '11:15 AM PST', status: 'confirmed', created_at: new Date().toISOString() }
        ];
      } else if (table === 'raffle_entries') {
        data = [
          { id: '1', full_name: 'David Kim', email: 'dkim@southbaysurf.com', phone: '+1 (310) 412-8819', shoe_size: 'US 10.5', status: 'registered', created_at: new Date().toISOString() },
          { id: '2', full_name: 'Samantha Hayes', email: 'sam.hayes@lagunadesign.io', phone: '+1 (949) 715-3004', shoe_size: 'US 8.5', status: 'registered', created_at: new Date().toISOString() },
          { id: '3', full_name: 'Andre Thorne', email: 'andre.t@veniceheat.net', phone: '+1 (310) 821-4990', shoe_size: 'US 11.0', status: 'drawn_winner', created_at: new Date().toISOString() },
          { id: '4', full_name: 'Kaitlyn Meyer', email: 'kmeyer@hermosa.org', phone: '+1 (310) 374-1290', shoe_size: 'US 9.0', status: 'registered', created_at: new Date().toISOString() },
          { id: '5', full_name: 'Tyler Sterling', email: 'tster@pacificcoastal.com', phone: '+1 (310) 545-7721', shoe_size: 'US 12.0', status: 'registered', created_at: new Date().toISOString() }
        ];
      } else if (table === 'orders') {
        data = [
          { id: '1', order_number: 'SMB-2026-9021', customer_name: 'Julian Vance', total_amount: 450.00, items_count: 2, status: 'authenticated', created_at: new Date().toISOString() },
          { id: '2', order_number: 'SMB-2026-9022', customer_name: 'Chloe Miller', total_amount: 285.00, items_count: 1, status: 'dispatched', created_at: new Date().toISOString() }
        ];
      } else {
        data = [];
      }
      localStorage.setItem(key, JSON.stringify(data));
    }

    if (options.method === 'POST') {
      const record = { id: String(Date.now()), created_at: new Date().toISOString(), ...options.body };
      data.unshift(record);
      localStorage.setItem(key, JSON.stringify(data));
      return [record];
    }

    if (options.method === 'PATCH' && options.id) {
      data = data.map(item => item.id === options.id ? { ...item, ...options.body } : item);
      localStorage.setItem(key, JSON.stringify(data));
      return data.filter(item => item.id === options.id);
    }

    return data;
  },

  // Public Actions
  async createVIPBooking(booking) {
    return this.query('vip_bookings', { method: 'POST', body: booking });
  },

  async getVIPBookings() {
    return this.query('vip_bookings');
  },

  async updateBookingStatus(id, status) {
    return this.query('vip_bookings', { method: 'PATCH', id, body: { status } });
  },

  async createRaffleEntry(entry) {
    return this.query('raffle_entries', { method: 'POST', body: entry });
  },

  async getRaffleEntries() {
    return this.query('raffle_entries');
  },

  async drawRaffleWinner() {
    const entries = await this.getRaffleEntries();
    const eligible = entries.filter(e => e.status === 'registered');
    if (eligible.length === 0) return null;
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    await this.query('raffle_entries', { method: 'PATCH', id: winner.id, body: { status: 'drawn_winner' } });
    winner.status = 'drawn_winner';
    return winner;
  },

  async createOrder(order) {
    return this.query('orders', { method: 'POST', body: order });
  },

  async getOrders() {
    return this.query('orders');
  }
};

window.StrideDB = StrideDB;
