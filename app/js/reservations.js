const Reservations = {
  list: [],

  init() {
    const saved = localStorage.getItem('reservations');
    if (saved) {
      this.list = JSON.parse(saved);
    }
  },

  create(reservationData) {
    const reservation = {
      id: Date.now(),
      ...reservationData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.list.unshift(reservation);
    this.save();
    return reservation;
  },

  updateStatus(reservationId, newStatus) {
    const reservation = this.list.find(r => r.id === reservationId);
    if (reservation) {
      reservation.status = newStatus;
      this.save();
    }
  },

  cancel(reservationId) {
    this.updateStatus(reservationId, 'cancelled');
  },

  getReservations(filters = {}) {
    let result = [...this.list];

    if (filters.status && filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }

    if (filters.date) {
      result = result.filter(r => r.date === filters.date);
    }

    return result.sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      return a.date.localeCompare(b.date);
    });
  },

  getById(reservationId) {
    return this.list.find(r => r.id === reservationId);
  },

  checkAvailability(date, time, duration = 1) {
    const conflicting = this.list.filter(r => {
      if (r.status === 'cancelled') return false;
      if (r.date !== date) return false;

      const resTime = parseInt(r.time.replace(':', ''));
      const reqTime = parseInt(time.replace(':', ''));
      return Math.abs(resTime - reqTime) < 100;
    });

    return conflicting.length === 0;
  },

  save() {
    localStorage.setItem('reservations', JSON.stringify(this.list));
  }
};
