const Reports = {
  generateDailyReport(date) {
    const orders = Orders.getOrders({ date });
    const sales = Orders.getDailySales(date);
    const orderCount = orders.filter(o => o.status !== 'cancelled').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    const salesByCategory = {};
    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      o.items.forEach(item => {
        const category = item.category || 'Sin categoría';
        salesByCategory[category] = (salesByCategory[category] || 0) + (item.price * item.quantity);
      });
    });

    return {
      date,
      orderCount,
      cancelledCount,
      totalSales: sales,
      salesByCategory,
      orders: orders.filter(o => o.status !== 'cancelled')
    };
  },

  generateRangeReport(startDate, endDate) {
    return Orders.getSalesByDateRange(startDate, endDate);
  },

  closeCash(date) {
    const report = this.generateDailyReport(date);
    const cashClosings = JSON.parse(localStorage.getItem('cashClosings') || '[]');
    cashClosings.unshift({
      date,
      ...report,
      closedAt: new Date().toISOString()
    });
    localStorage.setItem('cashClosings', JSON.stringify(cashClosings));
    return report;
  },

  getCashClosings() {
    return JSON.parse(localStorage.getItem('cashClosings') || '[]');
  },

  formatCurrency(amount) {
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
  }
};
