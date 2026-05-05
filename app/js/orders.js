const Orders = {
  list: [],

  init() {
    const saved = localStorage.getItem('orders');
    if (saved) {
      this.list = JSON.parse(saved);
    }
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
    this.notifyUpdate(order.id, 'pending');
    return order;
  },

  updateStatus(orderId, newStatus) {
    const order = this.list.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status: newStatus, timestamp: new Date().toISOString() });
      this.save();
      this.notifyUpdate(orderId, newStatus);
    }
  },

  cancel(orderId) {
    this.updateStatus(orderId, 'cancelled');
  },

  getOrders(filters = {}) {
    let result = [...this.list];

    if (filters.status && filters.status !== 'all') {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.date) {
      result = result.filter(o => o.createdAt.startsWith(filters.date));
    }

    return result;
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

  notifyUpdate(orderId, status) {
    const event = new CustomEvent('orderUpdate', { detail: { orderId, status } });
    window.dispatchEvent(event);
    localStorage.setItem('lastOrderUpdate', JSON.stringify({ orderId, status, timestamp: Date.now() }));
    setTimeout(() => localStorage.removeItem('lastOrderUpdate'), 2000);
  }
};
