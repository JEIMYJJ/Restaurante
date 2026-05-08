(function () {
  'use strict';

  function formatCOP(amount) {
    return '$' + Math.round(amount).toLocaleString('es-CO');
  }

  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function getOrdersFromStore(date) {
    if (typeof Orders !== 'undefined') {
      if (date) return Orders.getOrders({ date: date });
      return Orders.list || [];
    }
    var all = JSON.parse(localStorage.getItem('orders') || '[]');
    if (date) return all.filter(function (o) { return (o.createdAt || o.date || '').startsWith(date); });
    return all;
  }

  function getReservationsFromStore() {
    if (typeof Reservations !== 'undefined') {
      return Reservations.getReservations();
    }
    return JSON.parse(localStorage.getItem('reservations') || '[]');
  }

  function createReservation(data) {
    if (typeof Reservations !== 'undefined') {
      Reservations.create(data);
    } else {
      var list = JSON.parse(localStorage.getItem('reservations') || '[]');
      list.unshift({
        id: Date.now(),
        customer: data.customer,
        phone: data.phone || '',
        date: data.date,
        time: data.time,
        guests: data.guests,
        notes: data.notes || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('reservations', JSON.stringify(list));
    }
  }

  function closeCashStore(date, orderCount, totalSales) {
    if (typeof Reports !== 'undefined') {
      Reports.closeCash(date);
    } else {
      var closings = JSON.parse(localStorage.getItem('cashClosings') || '[]');
      closings.unshift({ date: date, orderCount: orderCount, totalSales: totalSales, closedAt: new Date().toISOString() });
      localStorage.setItem('cashClosings', JSON.stringify(closings));
    }
  }

  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // ===================== TRACKING MODULE =====================
  var Tracking = {
    intervalId: null,

    init: function () {
      var btn = document.getElementById('trackingFloatBtn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        Tracking.loadContent();
        openModal('trackingModal');
      });

      if (Tracking.intervalId) clearInterval(Tracking.intervalId);
      Tracking.intervalId = setInterval(function () {
        var activeOrders = getOrdersFromStore().filter(function (o) {
          return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready';
        });
        if (activeOrders.length === 0) return;

        var order = activeOrders[Math.floor(Math.random() * activeOrders.length)];
        var next = order.status === 'pending' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'delivered';

        if (typeof Orders !== 'undefined') {
          Orders.updateStatus(order.id, next);
        } else {
          var all = JSON.parse(localStorage.getItem('orders') || '[]');
          for (var i = 0; i < all.length; i++) {
            if (all[i].id === order.id) {
              all[i].status = next;
              if (!all[i].statusHistory) all[i].statusHistory = [];
              all[i].statusHistory.push({ status: next, timestamp: new Date().toISOString() });
              break;
            }
          }
          localStorage.setItem('orders', JSON.stringify(all));
          localStorage.setItem('lastOrderUpdate', JSON.stringify({ orderId: order.id, status: next, action: 'statusChange', timestamp: Date.now() }));
        }

        var modal = document.getElementById('trackingModal');
        if (modal && modal.classList.contains('open')) {
          Tracking.loadContent();
        }
      }, 5000);
    },

    loadContent: function () {
      var content = document.getElementById('trackingModalContent');
      if (!content) return;

      var searchEl = content.querySelector('#trackingSearchInput');
      var searchVal = searchEl ? searchEl.value : '';

      var allOrders = getOrdersFromStore();
      var filtered = searchVal
        ? allOrders.filter(function (o) { return String(o.id).indexOf(searchVal) !== -1 || (o.customer && o.customer.toLowerCase().indexOf(searchVal.toLowerCase()) !== -1); })
        : allOrders;

      var html = '<div class="tracking-search"><input type="text" id="trackingSearchInput" class="tracking-input" placeholder="Buscar por código o cliente..." value="' + searchVal.replace(/"/g, '&quot;') + '"></div><div class="tracking-results">';

      if (filtered.length === 0) {
        html += '<p class="modal-empty">No se encontraron pedidos</p>';
      } else {
        for (var i = 0; i < filtered.length; i++) {
          html += Tracking.renderCard(filtered[i]);
        }
      }

      html += '</div>';
      content.innerHTML = html;

      var input = content.querySelector('#trackingSearchInput');
      if (input) {
        input.addEventListener('input', function () {
          Tracking.loadContent();
        });
      }
    },

    renderCard: function (order) {
      var statuses = ['pending', 'preparing', 'ready', 'delivered'];
      var labels = { pending: 'Pedido recibido', preparing: 'En preparaci\u00f3n', ready: 'Listo para entregar', delivered: 'Entregado' };
      var currentIdx = statuses.indexOf(order.status);

      var stepsHtml = '';
      for (var i = 0; i < statuses.length; i++) {
        var cls = i < currentIdx ? 'track-step completed' : i === currentIdx ? 'track-step current' : 'track-step';
        stepsHtml += '<div class="' + cls + '"><div class="track-step-dot"></div><div class="track-step-label">' + labels[statuses[i]] + '</div></div>';
      }

      var itemsText = '';
      if (order.items) {
        var names = [];
        for (var j = 0; j < Math.min(order.items.length, 3); j++) {
          names.push(order.items[j].quantity + 'x ' + order.items[j].name);
        }
        itemsText = names.join(', ');
        if (order.items.length > 3) itemsText += ' y ' + (order.items.length - 3) + ' m\u00e1s';
      }

      return '<div class="tracking-card"><div class="tracking-card-hdr"><strong>Pedido #' + order.id + '</strong><span class="tracking-status-badge ' + order.status + '">' + (labels[order.status] || order.status) + '</span></div><div class="tracking-customer">' + (order.customer || 'Cliente') + ' - Mesa ' + (order.table || 'N/A') + '</div><div class="tracking-items">' + itemsText + '</div><div class="tracking-total">' + formatCOP(order.total || 0) + '</div>' + stepsHtml + '</div>';
    }
  };

  // ===================== RESERVATION MODULE =====================
  var ReservationMod = {
    init: function () {
      var btn = document.getElementById('reservationFloatBtn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        ReservationMod.loadContent();
        openModal('reservationModal');
      });
    },

    loadContent: function () {
      var content = document.getElementById('reservationModalContent');
      if (!content) return;

      var today = getTodayStr();
      var now = new Date();
      var hh = ('0' + now.getHours()).slice(-2);
      var mm = ('0' + now.getMinutes()).slice(-2);

      var html = '<form id="reservationForm" class="reservation-form"><div class="form-group"><label for="resName">Nombre</label><input type="text" id="resName" required placeholder="Tu nombre"></div><div class="form-group"><label for="resPhone">Tel\u00e9fono</label><input type="tel" id="resPhone" placeholder="Ej: 3124601898"></div><div class="form-row"><div class="form-group"><label for="resDate">Fecha</label><input type="date" id="resDate" required value="' + today + '"></div><div class="form-group"><label for="resTime">Hora</label><input type="time" id="resTime" required value="' + hh + ':' + mm + '"></div></div><div class="form-group"><label for="resGuests">Cantidad de personas</label><input type="number" id="resGuests" min="1" max="20" value="2" required></div><div class="form-group"><label for="resNotes">Notas</label><textarea id="resNotes" rows="2" placeholder="Alergias, ocasi\u00f3n especial..."></textarea></div><button type="submit" class="confirm-btn">Reservar</button></form><div id="reservationListContainer" class="reservation-list-container"></div>';

      content.innerHTML = html;

      ReservationMod.renderList();

      var form = document.getElementById('reservationForm');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          ReservationMod.submitForm();
        });
      }
    },

    submitForm: function () {
      var name = (document.getElementById('resName').value || '').trim();
      var phone = (document.getElementById('resPhone').value || '').trim();
      var date = document.getElementById('resDate').value;
      var time = document.getElementById('resTime').value;
      var guests = parseInt(document.getElementById('resGuests').value) || 2;
      var notes = (document.getElementById('resNotes').value || '').trim();

      if (!name || !date || !time) return;

      createReservation({ customer: name, phone: phone, date: date, time: time, guests: guests, notes: notes });

      ReservationMod.renderList();
      document.getElementById('reservationForm').reset();
      document.getElementById('resDate').value = getTodayStr();
      var now = new Date();
      document.getElementById('resTime').value = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

      var btn = document.querySelector('#reservationForm .confirm-btn');
      if (btn) {
        btn.textContent = '\u2713 Reservada';
        setTimeout(function () { btn.textContent = 'Reservar'; }, 2000);
      }
    },

    renderList: function () {
      var container = document.getElementById('reservationListContainer');
      if (!container) return;

      var list = getReservationsFromStore();
      if (list.length === 0) {
        container.innerHTML = '<p class="modal-empty">No hay reservas registradas</p>';
        return;
      }

      var html = '<h4 class="reservation-subtitle">Reservas registradas</h4>';
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        html += '<div class="reservation-card-item"><div class="reservation-card-hdr"><strong>' + r.customer + '</strong><span class="reservation-status ' + r.status + '">' + r.status + '</span></div><div class="reservation-card-info"><span>\uD83D\uDCC5 ' + r.date + '</span><span>\uD83D\uDD50 ' + r.time + '</span><span>\uD83D\uDC65 ' + r.guests + ' pers.</span>' + (r.phone ? '<span>\uD83D\uDCDE ' + r.phone + '</span>' : '') + (r.notes ? '<span>\uD83D\uDCDD ' + r.notes + '</span>' : '') + '</div></div>';
      }
      container.innerHTML = html;
    }
  };

  // ===================== CASH REPORT MODULE =====================
  var CashMod = {
    init: function () {
      var btn = document.getElementById('cashFloatBtn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        CashMod.loadContent();
        openModal('cashReportModal');
      });
    },

    loadContent: function () {
      var content = document.getElementById('cashReportModalContent');
      if (!content) return;

      var today = getTodayStr();
      var data = CashMod.getDailyData(today);
      var closings = JSON.parse(localStorage.getItem('cashClosings') || '[]');
      var todayClosed = false;
      for (var i = 0; i < closings.length; i++) {
        if (closings[i].date === today) { todayClosed = true; break; }
      }

      var html = '<div class="cash-summary"><div class="cash-date"><strong>Fecha:</strong> ' + today + '</div><div class="cash-stats"><div class="cash-stat-box"><span class="cash-stat-lbl">Total de pedidos</span><span class="cash-stat-num">' + data.orderCount + '</span></div><div class="cash-stat-box"><span class="cash-stat-lbl">Total vendido</span><span class="cash-stat-num cash-primary">' + formatCOP(data.totalSales) + '</span></div></div>' + (todayClosed ? '<div class="cash-closed-msg">Caja cerrada hoy</div>' : '') + '<div class="cash-actions"><button id="genReportBtn" class="confirm-btn" style="background:var(--dark-light)">Generar Reporte</button><button id="closeCashBtn" class="confirm-btn" style="background:var(--primary)"' + (todayClosed ? ' disabled' : '') + '>' + (todayClosed ? 'Caja Cerrada' : 'Cerrar Caja') + '</button></div></div><div id="cashReportDetail" class="cash-report-detail"></div>';

      content.innerHTML = html;

      document.getElementById('genReportBtn').addEventListener('click', function () { CashMod.generateReport(today); });

      var closeBtn = document.getElementById('closeCashBtn');
      if (closeBtn && !todayClosed) {
        closeBtn.addEventListener('click', function () {
          if (confirm('\u00bfEst\u00e1 seguro de cerrar la caja del d\u00eda ' + today + '?')) {
            closeCashStore(today, data.orderCount, data.totalSales);
            CashMod.loadContent();
          }
        });
      }
    },

    getDailyData: function (date) {
      var orders = getOrdersFromStore(date);
      var active = [];
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].status !== 'cancelled') active.push(orders[i]);
      }
      var total = 0;
      for (var j = 0; j < active.length; j++) {
        total += active[j].total || 0;
      }
      return { date: date, orderCount: active.length, totalSales: total, orders: active };
    },

    generateReport: function (date) {
      var data = CashMod.getDailyData(date);
      var detail = document.getElementById('cashReportDetail');

      var html = '<div class="report-section"><h4>Reporte Diario - ' + date + '</h4><div class="report-meta"><p><strong>Total de pedidos:</strong> ' + data.orderCount + '</p><p><strong>Total vendido:</strong> ' + formatCOP(data.totalSales) + '</p><p><strong>Generado:</strong> ' + new Date().toLocaleString('es-CO') + '</p></div><hr>';

      if (data.orders.length === 0) {
        html += '<p class="modal-empty">No hay pedidos este d\u00eda</p>';
      } else {
        html += '<h5>Pedidos del d\u00eda</h5>';
        for (var i = 0; i < data.orders.length; i++) {
          var o = data.orders[i];
          var itemsHtml = '';
          if (o.items) {
            for (var j = 0; j < o.items.length; j++) {
              itemsHtml += o.items[j].quantity + 'x ' + o.items[j].name + ', ';
            }
            itemsHtml = itemsHtml.slice(0, -2);
          }
          html += '<div class="report-order"><div class="report-order-hdr"><strong>#' + o.id + '</strong> ' + (o.customer || '') + ' - Mesa ' + (o.table || 'N/A') + ' <span class="report-order-total">' + formatCOP(o.total || 0) + '</span></div><div class="report-order-items">' + itemsHtml + '</div></div>';
        }
      }

      html += '</div>';
      detail.innerHTML = html;
    }
  };

  // ===================== INIT =====================
  function init() {
    Tracking.init();
    ReservationMod.init();
    CashMod.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
