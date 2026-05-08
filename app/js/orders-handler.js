(function() {
  'use strict';

  let selectedDishes = [];
  let currentTrackingFilter = 'all';

  const formatCOP = (amount) => `$${Math.round(amount).toLocaleString('es-CO')}`;

  function init() {
    Menu.getMenu();
    Orders.init();

    setupTabs();
    loadMenuSelection();
    loadTrackingView();

    document.getElementById('createOrderBtn').addEventListener('click', createOrder);

    document.getElementById('closeOrderDetail').addEventListener('click', () => {
      document.getElementById('orderDetailModal').classList.remove('open');
    });

    document.getElementById('orderDetailModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('orderDetailModal').classList.remove('open');
      }
    });

    Orders.onChange((data) => {
      const activeTab = document.querySelector('.orders-tab.active');
      if (activeTab && activeTab.dataset.tab === 'tracking') {
        loadTrackingView();
      }
      updateTrackingBadge();
      if (data && data.action === 'new') {
        playNotificationSound();
      }
    });
  }

  function setupTabs() {
    document.querySelectorAll('.orders-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.orders-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabName = tab.dataset.tab;
        document.querySelectorAll('.orders-form').forEach(f => f.classList.remove('active'));

        if (tabName === 'new') {
          document.getElementById('newOrderForm').classList.add('active');
        } else {
          document.getElementById('trackingForm').classList.add('active');
          loadTrackingView();
        }
      });
    });
  }

  function loadMenuSelection() {
    const menu = Menu.getMenu().filter(d => d.available);
    const container = document.getElementById('menuSelection');

    container.innerHTML = menu.map(item => `
      <div class="menu-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="menu-item-img">
        <div class="menu-item-info">
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-price">${formatCOP(item.price)}</div>
        </div>
        <div class="menu-item-qty">
          <button class="menu-qty-btn" data-id="${item.id}" data-change="-1">-</button>
          <span class="menu-qty-value" id="qty-${item.id}">0</span>
          <button class="menu-qty-btn" data-id="${item.id}" data-change="1">+</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.menu-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const change = parseInt(btn.dataset.change);
        updateDishQuantity(id, change);
      });
    });
  }

  function updateDishQuantity(id, change) {
    const existing = selectedDishes.find(d => d.id === id);
    if (existing) {
      existing.quantity += change;
      if (existing.quantity <= 0) {
        selectedDishes = selectedDishes.filter(d => d.id !== id);
      }
    } else if (change > 0) {
      const dish = Menu.getMenu().find(d => d.id === id);
      if (dish) {
        selectedDishes.push({ ...dish, quantity: 1 });
      }
    }

    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) {
      const found = selectedDishes.find(d => d.id === id);
      qtyEl.textContent = found ? found.quantity : 0;
    }

    updateSelectedItems();
  }

  function updateSelectedItems() {
    const list = document.getElementById('selectedList');
    const totalEl = document.getElementById('orderTotal');
    const btn = document.getElementById('createOrderBtn');

    if (selectedDishes.length === 0) {
      list.innerHTML = '<div class="selected-empty">No hay platos seleccionados</div>';
      totalEl.textContent = '$0';
      btn.disabled = true;
      return;
    }

    const total = selectedDishes.reduce((s, d) => s + d.price * d.quantity, 0);
    list.innerHTML = selectedDishes.map(d => `
      <div class="selected-item">
        <span>${d.quantity}x ${d.name}</span>
        <span>${formatCOP(d.price * d.quantity)}</span>
      </div>
    `).join('');
    totalEl.textContent = formatCOP(total);
    btn.disabled = false;
  }

  function createOrder() {
    const customer = document.getElementById('customerName').value.trim();
    const table = parseInt(document.getElementById('tableNumber').value);
    const notes = document.getElementById('orderNotes').value.trim();
    const errorEl = document.getElementById('orderError');
    const successEl = document.getElementById('orderSuccess');

    errorEl.classList.remove('visible');
    successEl.classList.remove('visible');

    if (!customer) {
      errorEl.textContent = 'Ingrese el nombre del cliente';
      errorEl.classList.add('visible');
      return;
    }
    if (!table || table < 1) {
      errorEl.textContent = 'Ingrese un número de mesa válido';
      errorEl.classList.add('visible');
      return;
    }
    if (selectedDishes.length === 0) {
      errorEl.textContent = 'Seleccione al menos un plato';
      errorEl.classList.add('visible');
      return;
    }

    const order = Orders.create({
      customer,
      table,
      notes,
      items: selectedDishes.map(d => ({ id: d.id, name: d.name, price: d.price, category: d.category, image: d.image, quantity: d.quantity })),
      total: selectedDishes.reduce((s, d) => s + d.price * d.quantity, 0)
    });

    selectedDishes = [];
    document.getElementById('customerName').value = '';
    document.getElementById('tableNumber').value = '';
    document.getElementById('orderNotes').value = '';
    loadMenuSelection();
    updateSelectedItems();
    updateTrackingBadge();

    successEl.textContent = `Pedido #${order.id} creado exitosamente`;
    successEl.classList.add('visible');

    setTimeout(() => {
      successEl.classList.remove('visible');
      document.querySelector('.orders-tab[data-tab="tracking"]').click();
    }, 1500);
  }

  function loadTrackingView() {
    renderTrackingStats();
    renderTrackingList();
    setupTrackingFilters();
  }

  function renderTrackingStats() {
    const stats = document.getElementById('trackingStats');
    stats.innerHTML = `
      <div class="tracking-stat">
        <span class="tracking-stat-icon">&#9201;</span>
        <div>
          <div class="tracking-stat-num">${Orders.getPendingCount()}</div>
          <div class="tracking-stat-label">Pendientes</div>
        </div>
      </div>
      <div class="tracking-stat">
        <span class="tracking-stat-icon">&#128295;</span>
        <div>
          <div class="tracking-stat-num" style="color:var(--dark-light)">${Orders.getInProgressCount()}</div>
          <div class="tracking-stat-label">Preparando</div>
        </div>
      </div>
      <div class="tracking-stat">
        <span class="tracking-stat-icon">&#9989;</span>
        <div>
          <div class="tracking-stat-num" style="color:#2d6a4f">${Orders.getReadyCount()}</div>
          <div class="tracking-stat-label">Listos</div>
        </div>
      </div>
    `;
  }

  function renderTrackingList() {
    const orders = Orders.getOrders({ status: currentTrackingFilter });
    const container = document.getElementById('trackingList');

    if (orders.length === 0) {
      container.innerHTML = '<div class="tracking-empty">No hay pedidos</div>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="tracking-card status-${order.status}" onclick="window.showOrderDetail(${order.id})">
        <div class="tracking-card-header">
          <strong>Pedido #${order.id}</strong>
          <span class="tracking-status ${order.status}">${getStatusText(order.status)}</span>
        </div>
        <div class="tracking-card-info">
          <span>&#128100; ${order.customer}</span>
          <span>&#128196; Mesa ${order.table}</span>
          <span>&#128337; ${getTimeAgo(order.createdAt)}</span>
        </div>
        <div class="tracking-card-items">
          ${order.items.slice(0, 3).map(i => `${i.quantity}x ${i.name}`).join(', ')}
          ${order.items.length > 3 ? `<span class="tracking-more">+${order.items.length - 3} más</span>` : ''}
        </div>
        <div class="tracking-card-footer">
          <span class="tracking-total">${formatCOP(order.total)}</span>
          ${order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' ? `
            <button class="tracking-action-btn" onclick="event.stopPropagation();window.advanceOrder(${order.id})">
              ${order.status === 'pending' ? 'Iniciar Preparación' : order.status === 'preparing' ? 'Marcar Listo' : 'Entregar'}
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  function setupTrackingFilters() {
    document.querySelectorAll('.tracking-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTrackingFilter = btn.dataset.filter;
        document.querySelectorAll('.tracking-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTrackingList();
      });
    });
  }

  function getStatusText(status) {
    const texts = { pending: 'Pendiente', preparing: 'Preparando', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado' };
    return texts[status] || status;
  }

  function getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ${diff % 60}m`;
  }

  function updateTrackingBadge() {
    const count = Orders.getPendingCount();
    const badge = document.getElementById('trackingBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  window.showOrderDetail = function(orderId) {
    const order = Orders.getOrderById(orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailModal');
    document.getElementById('orderDetailTitle').textContent = `Pedido #${order.id}`;
    document.getElementById('orderDetailBody').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span class="tracking-status ${order.status}">${getStatusText(order.status)}</span>
        <span style="font-size:0.8rem;color:var(--gray-500)">${new Date(order.createdAt).toLocaleString('es-CO')}</span>
      </div>
      <div class="detail-meta">
        <span><strong>Cliente:</strong> ${order.customer}</span>
        <span><strong>Mesa:</strong> ${order.table}</span>
        ${order.notes ? `<span style="grid-column:1/-1"><strong>Notas:</strong> ${order.notes}</span>` : ''}
      </div>
      <div class="detail-items">
        <h4>Artículos</h4>
        ${order.items.map(item => `
          <div class="detail-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${formatCOP(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="detail-total">
          <span>Total</span>
          <span>${formatCOP(order.total)}</span>
        </div>
      </div>
      <div class="detail-timeline">
        <h4>&#128337; Línea de tiempo</h4>
        <div class="timeline-steps">
          ${order.statusHistory.map((entry, i) => {
            const isLast = i === order.statusHistory.length - 1;
            const cls = entry.status === 'cancelled' ? 'cancelled' : (isLast ? 'active' : 'completed');
            const labels = { pending: 'Pedido creado', preparing: 'En preparación', ready: 'Listo para entregar', delivered: 'Entregado', cancelled: 'Cancelado' };
            return `
              <div class="timeline-step ${cls}">
                <div class="step-status">${labels[entry.status] || entry.status}</div>
                <div class="step-time">${new Date(entry.timestamp).toLocaleString('es-CO')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    modal.classList.add('open');
  };

  window.advanceOrder = function(orderId) {
    const order = Orders.getOrderById(orderId);
    if (!order) return;
    const nextStatus = order.status === 'pending' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'delivered';
    Orders.updateStatus(orderId, nextStatus);
    loadTrackingView();
    updateTrackingBadge();
  };

  init();
})();
