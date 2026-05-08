const Orders = {
  list: [],
  listeners: [],
  channel: null,
  pollInterval: null,

  init() {
    const saved = localStorage.getItem('orders');
    if (saved) {
      this.list = JSON.parse(saved);
    }
    this.setupRealtime();
  },

  setupRealtime() {
    try {
      this.channel = new BroadcastChannel('restaurant-orders');
      this.channel.onmessage = (e) => {
        if (e.data.type === 'orderUpdate') {
          this.syncFromStorage();
          this.notifyListeners(e.data);
        }
      };
    } catch (e) {
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'orders') {
        this.syncFromStorage();
        this.notifyListeners({ orderId: null, status: null });
      }
      if (e.key === 'lastOrderUpdate') {
        this.syncFromStorage();
        if (e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch (err) {}
        }
      }
    });

    this.pollInterval = setInterval(() => {
      this.syncFromStorage();
    }, 3000);
  },

  syncFromStorage() {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const fresh = JSON.parse(saved);
      if (JSON.stringify(fresh) !== JSON.stringify(this.list)) {
        this.list = fresh;
        this.notifyListeners({ orderId: null, status: null });
      }
    }
  },

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) {}
    });
  },

  create(orderData) {
    const order = {
      id: Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }]
    };
    this.list.unshift(order);
    this.save();
    this.broadcastUpdate(order.id, 'pending', 'new');
    return order;
  },

  updateStatus(orderId, newStatus) {
    const order = this.list.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = newStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status: newStatus, timestamp: new Date().toISOString() });
      this.save();
      this.broadcastUpdate(orderId, newStatus, 'statusChange', oldStatus);
    }
  },

  cancel(orderId) {
    const order = this.list.find(o => o.id === orderId);
    if (order) {
      this.updateStatus(orderId, 'cancelled');
    }
  },

  getOrders(filters = {}) {
    let result = [...this.list];

    if (filters.status && filters.status !== 'all') {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.date) {
      result = result.filter(o => o.createdAt.startsWith(filters.date));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o =>
        o.customer.toLowerCase().includes(q) ||
        String(o.table).includes(q) ||
        String(o.id).includes(q)
      );
    }

    return result;
  },

  getActiveOrders() {
    return this.list.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
  },

  getPendingCount() {
    return this.list.filter(o => o.status === 'pending').length;
  },

  getInProgressCount() {
    return this.list.filter(o => o.status === 'preparing').length;
  },

  getReadyCount() {
    return this.list.filter(o => o.status === 'ready').length;
  },

  getOrderById(orderId) {
    return this.list.find(o => o.id === orderId);
  },

  getDailySales(date) {
    const dayOrders = this.list.filter(o =>
      o.createdAt.startsWith(date) && o.status !== 'cancelled'
    );
    return dayOrders.reduce((sum, o) => sum + o.total, 0);
  },

  getSalesByDateRange(startDate, endDate) {
    const orders = this.list.filter(o => {
      if (o.status === 'cancelled') return false;
      const orderDate = o.createdAt.split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });

    const salesByDay = {};
    orders.forEach(o => {
      const date = o.createdAt.split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + o.total;
    });

    return { orders, salesByDay, total: orders.reduce((sum, o) => sum + o.total, 0) };
  },

  save() {
    localStorage.setItem('orders', JSON.stringify(this.list));
  },

  broadcastUpdate(orderId, status, action, oldStatus) {
    const data = { type: 'orderUpdate', orderId, status, action, oldStatus, timestamp: Date.now() };
    if (this.channel) {
      try { this.channel.postMessage(data); } catch (e) {}
    }
    localStorage.setItem('lastOrderUpdate', JSON.stringify(data));
    this.notifyListeners(data);
  }
};
