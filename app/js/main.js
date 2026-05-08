(function() {
  'use strict';

  let cart = [];
  let currentCategory = 'Todos';
  let searchQuery = '';
  let currentOrderFilter = 'all';
  let currentOrderSearch = '';
  let currentReservationFilter = 'all';
  let lastOrderCount = 0;
  let removeRealtimeListener = null;

  const formatCOP = (amount) => `$${Math.round(amount).toLocaleString('es-CO')}`;

  function init() {
    Orders.init();
    lastOrderCount = Orders.getPendingCount();
    if (Auth.checkAuth()) {
      showMainView();
    } else {
      showLoginView();
    }
    setupEventListeners();
    setupRealtimeOrders();
  }

  function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('mainView').classList.remove('active');
  }

  function showMainView() {
    document.getElementById('loginView').classList.remove('active');
    document.getElementById('mainView').classList.add('active');
    updateUserInfo();
    setupNavigation();
    updateKitchenBadge();
    loadMenuView();
  }

  function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (Auth.currentUser) {
      userInfo.innerHTML = `<span>${Auth.currentUser.name} (${Auth.currentUser.role})</span>`;
    }
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = Auth.hasRole('admin') ? '' : 'none';
    });

    const meseroElements = document.querySelectorAll('.mesero-only');
    meseroElements.forEach(el => {
      el.style.display = Auth.hasAnyRole(['mesero', 'admin']) ? '' : 'none';
    });
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        switchView(viewId);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function switchView(viewId) {
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    switch(viewId) {
      case 'menuView': loadMenuView(); break;
      case 'ordersView': loadOrdersView(); break;
      case 'kitchenView': loadKitchenView(); break;
      case 'reservationsView': loadReservationsView(); break;
      case 'menuAdminView': loadMenuAdminView(); break;
      case 'reportsView': loadReportsView(); break;
    }
  }

  function loadMenuView() {
    renderCategories();
    renderMenu();
    setupCart();
  }

  function renderCategories() {
    const categories = ['Todos', ...Menu.getCategories()];
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = categories.map(cat => `
      <button class="category-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        renderCategories();
        renderMenu();
      });
    });
  }

  function renderMenu() {
    const menuData = Menu.getMenu();
    const filtered = menuData.filter(item => {
      const matchCategory = currentCategory === 'Todos' || item.category === currentCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch && item.available;
    });

    const grid = document.getElementById('menuGrid');
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="no-results"><span>&#128533;</span><p>No se encontraron platos</p></div>';
      return;
    }

    grid.innerHTML = filtered.map((item, index) => `
      <div class="dish-card" style="animation-delay: ${index * 0.08}s">
        <div class="image-container">
          <img src="${item.image}" alt="${item.name}" class="dish-image" loading="lazy">
          <span class="dish-category-tag">${item.category}</span>
        </div>
        <div class="dish-content">
          <div class="dish-header">
            <h3 class="dish-name">${item.name}</h3>
            <span class="dish-price">${formatCOP(item.price)}</span>
          </div>
          <p class="dish-description">${item.description}</p>
          <button class="add-btn" data-id="${item.id}">Agregar al pedido</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(parseInt(btn.dataset.id));
        btn.textContent = '¡Agregado!';
        setTimeout(() => btn.textContent = 'Agregar al pedido', 1500);
      });
    });
  }

  function addToCart(id) {
    const item = Menu.getMenu().find(d => d.id === id);
    if (!item) return;
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    saveCart();
    updateCartUI();
  }

  function setupCart() {
    const cartToggle = document.getElementById('cartToggle');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartToggle) {
      cartToggle.addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.add('open');
        cartOverlay.classList.add('open');
      });
    }

    if (closeCart) {
      closeCart.addEventListener('click', closeCartSidebar);
    }
    if (cartOverlay) {
      cartOverlay.addEventListener('click', closeCartSidebar);
    }
  }

  function closeCartSidebar() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }

  function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!cartCount) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = formatCOP(totalPrice);
    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty"><span>&#128722;</span><p>Tu carrito está vacío</p></div>';
      return;
    }

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCOP(item.price * item.quantity)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="window.changeQty(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="window.changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="window.removeFromCart(${item.id})">&times;</button>
      </div>
    `).join('');
  }

  window.changeQty = function(id, change) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
    saveCart();
    updateCartUI();
  };

  window.removeFromCart = function(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartUI();
  };

  function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
  }

  function loadOrdersView() {
    Orders.init();
    renderOrders();

    document.querySelectorAll('.order-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentOrderFilter = btn.dataset.filter;
        document.querySelectorAll('.order-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOrders();
      });
    });
  }

  function renderOrders() {
    const orders = Orders.getOrders({ status: currentOrderFilter, search: currentOrderSearch });
    const container = document.getElementById('ordersList');

    if (orders.length === 0) {
      container.innerHTML = '<div class="no-orders"><p>No hay pedidos</p></div>';
      return;
    }

    container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
  }

  function renderOrderCard(order) {
    const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const timeAgo = getTimeAgo(order.createdAt);

    return `
      <div class="order-card status-${order.status}" onclick="window.showOrderDetail(${order.id})" style="cursor:pointer">
        <div class="order-header">
          <strong>Pedido #${order.id}</strong>
          <div>
            <span class="order-time" style="font-size:0.75rem;color:var(--gray-500);margin-right:0.5rem">${timeAgo}</span>
            <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
          </div>
        </div>
        <div class="order-info">Mesa ${order.table} - ${order.customer}</div>
        <div class="order-items">${itemsText}</div>
        <div class="order-total">${formatCOP(order.total)}</div>
        ${Auth.hasAnyRole(['mesero', 'admin']) ? renderOrderActions(order) : ''}
      </div>
    `;
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

  function renderOrderActions(order) {
    let actions = [];
    if (order.status === 'pending') {
      actions.push(`<button onclick="event.stopPropagation();window.updateOrderStatus(${order.id}, 'preparing')">Iniciar Preparación</button>`);
    } else if (order.status === 'preparing') {
      actions.push(`<button onclick="event.stopPropagation();window.updateOrderStatus(${order.id}, 'ready')">Marcar Listo</button>`);
    } else if (order.status === 'ready') {
      actions.push(`<button onclick="event.stopPropagation();window.updateOrderStatus(${order.id}, 'delivered')">Entregar</button>`);
    }
    if (order.status === 'pending') {
      actions.push(`<button class="btn-danger" onclick="event.stopPropagation();window.cancelOrder(${order.id})">Cancelar</button>`);
    }
    if (actions.length === 0) return '';
    return `<div class="order-actions">${actions.join('')}</div>`;
  }

  window.updateOrderStatus = function(orderId, newStatus) {
    Orders.updateStatus(orderId, newStatus);
    const activeView = document.querySelector('.content-view.active');
    if (activeView) {
      const viewId = activeView.id;
      if (viewId === 'ordersView') renderOrders();
      if (viewId === 'kitchenView') renderKitchenBoard();
    }
    updateKitchenBadge();
  };

  window.cancelOrder = function(orderId) {
    if (confirm('¿Cancelar este pedido?')) {
      Orders.cancel(orderId);
      const activeView = document.querySelector('.content-view.active');
      if (activeView) {
        const viewId = activeView.id;
        if (viewId === 'ordersView') renderOrders();
        if (viewId === 'kitchenView') renderKitchenBoard();
      }
      updateKitchenBadge();
    }
  };

  function getStatusText(status) {
    const texts = { pending: 'Pendiente', preparing: 'En Preparación', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado' };
    return texts[status] || status;
  }

  window.showOrderDetail = function(orderId) {
    const order = Orders.getOrderById(orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailModal');
    const title = document.getElementById('orderDetailTitle');
    const body = document.getElementById('orderDetailBody');

    title.textContent = `Pedido #${order.id}`;

    body.innerHTML = `
      <div class="order-detail-header">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
          <span style="font-size:0.8rem;color:var(--gray-500)">${new Date(order.createdAt).toLocaleString('es-CO')}</span>
        </div>
      </div>
      <div class="order-detail-meta">
        <span><strong>Cliente:</strong> ${order.customer}</span>
        <span><strong>Mesa:</strong> ${order.table}</span>
        ${order.notes ? `<span style="grid-column:1/-1"><strong>Notas:</strong> ${order.notes}</span>` : ''}
      </div>
      <div class="order-detail-items">
        <h4>Artículos</h4>
        ${order.items.map(item => `
          <div class="order-detail-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${formatCOP(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="order-detail-total">
          <span>Total</span>
          <span>${formatCOP(order.total)}</span>
        </div>
      </div>
      <div class="order-timeline">
        <h4>&#128337; Línea de tiempo</h4>
        <div class="timeline-steps">
          ${renderTimeline(order.statusHistory)}
        </div>
      </div>
      ${Auth.hasAnyRole(['mesero', 'admin']) ? `
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--gray-200)">
          ${renderOrderActions(order)}
        </div>
      ` : ''}
    `;

    modal.classList.add('open');
  };

  function renderTimeline(history) {
    const statusLabels = {
      pending: 'Pedido creado',
      preparing: 'En preparación',
      ready: 'Listo para entregar',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };

    const steps = ['pending', 'preparing', 'ready', 'delivered'];
    const currentIndex = history.length > 0 ? steps.indexOf(history[history.length - 1].status) : -1;

    return history.map((entry, i) => {
      const stepIndex = steps.indexOf(entry.status);
      const isLast = i === history.length - 1;
      const cls = entry.status === 'cancelled' ? 'cancelled' : (isLast ? 'active' : 'completed');
      return `
        <div class="timeline-step ${cls}">
          <div class="step-status">${statusLabels[entry.status] || entry.status}</div>
          <div class="step-time">${new Date(entry.timestamp).toLocaleString('es-CO')}</div>
        </div>
      `;
    }).join('');
  }

  function loadKitchenView() {
    renderKitchenStats();
    renderKitchenBoard();
  }

  function renderKitchenStats() {
    const stats = document.getElementById('kitchenStats');
    stats.innerHTML = `
      <div class="kitchen-stat">
        <span>&#9201;</span>
        <span>Pendientes</span>
        <span class="stat-count" id="statPending">${Orders.getPendingCount()}</span>
      </div>
      <div class="kitchen-stat">
        <span>&#128295;</span>
        <span>Preparando</span>
        <span class="stat-count" id="statPreparing" style="color:var(--dark-light)">${Orders.getInProgressCount()}</span>
      </div>
      <div class="kitchen-stat">
        <span>&#9989;</span>
        <span>Listos</span>
        <span class="stat-count" id="statReady" style="color:#2d6a4f">${Orders.getReadyCount()}</span>
      </div>
    `;
  }

  function renderKitchenBoard() {
    const board = document.getElementById('kitchenBoard');
    const columns = [
      { status: 'pending', label: 'Pendientes', icon: '&#9201;' },
      { status: 'preparing', label: 'En Preparación', icon: '&#128295;' },
      { status: 'ready', label: 'Listos', icon: '&#9989;' }
    ];

    board.innerHTML = columns.map(col => {
      const orders = Orders.getOrders({ status: col.status });
      return `
        <div class="kitchen-column">
          <div class="kitchen-column-header ${col.status}">
            ${col.icon} ${col.label} (${orders.length})
          </div>
          <div class="kitchen-column-orders" id="kitchenCol${col.status}">
            ${orders.length === 0 ? '<div class="kitchen-column-empty">No hay pedidos</div>' : orders.map(o => `
              <div class="kitchen-order-card" onclick="window.showOrderDetail(${o.id})">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="kitchen-order-id">#${o.id}</span>
                  <span class="kitchen-order-table">Mesa ${o.table}</span>
                </div>
                <div class="kitchen-order-items">
                  ${o.items.slice(0, 3).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  ${o.items.length > 3 ? ` y ${o.items.length - 3} más` : ''}
                </div>
                <div class="kitchen-order-time">${getTimeAgo(o.createdAt)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    renderKitchenStats();
  }

  function updateKitchenBadge() {
    const count = Orders.getPendingCount();
    const badge = document.getElementById('kitchenBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function setupRealtimeOrders() {
    removeRealtimeListener = Orders.onChange((data) => {
      const activeView = document.querySelector('.content-view.active');
      if (activeView) {
        const viewId = activeView.id;
        if (viewId === 'ordersView') renderOrders();
        if (viewId === 'kitchenView') {
          renderKitchenBoard();
          renderKitchenStats();
        }
      }
      updateKitchenBadge();

      if (data && data.action === 'new') {
        playNotificationSound();
        showNotification(
          '&#128276; Nuevo pedido',
          `Pedido #${data.orderId} ha sido creado`
        );
      } else if (data && data.action === 'statusChange') {
        const statusText = getStatusText(data.status);
        showNotification(
          '&#128240; Pedido actualizado',
          `Pedido #${data.orderId}: ${statusText}`
        );
      }
    });

    document.getElementById('orderSearchInput').addEventListener('input', (e) => {
      currentOrderSearch = e.target.value;
      renderOrders();
    });
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
    } catch (e) {
    }
  }

  function showNotification(title, text) {
    const container = document.getElementById('notificationToast');
    const item = document.createElement('div');
    item.className = 'notification-toast-item';
    item.innerHTML = `
      <div class="notification-toast-title">${title}</div>
      <div class="notification-toast-text">${text}</div>
    `;
    item.addEventListener('click', () => item.remove());
    container.appendChild(item);
    setTimeout(() => {
      if (item.parentNode) item.remove();
    }, 3500);
  }

  function loadReservationsView() {
    Reservations.init();
    renderReservations();
  }

  function renderReservations() {
    const reservations = Reservations.getReservations({ status: currentReservationFilter });
    const container = document.getElementById('reservationsList');

    if (reservations.length === 0) {
      container.innerHTML = '<div class="no-orders"><p>No hay reservas</p></div>';
      return;
    }

    container.innerHTML = reservations.map(res => `
      <div class="reservation-card status-${res.status}">
        <div class="reservation-header">
          <strong>${res.customer}</strong>
          <span class="status-badge ${res.status}">${res.status}</span>
        </div>
        <div class="reservation-details">
          <span>&#128197; ${res.date}</span>
          <span>&#128336; ${res.time}</span>
          <span>&#128101; ${res.guests} personas</span>
        </div>
      </div>
    `).join('');
  }

  function loadMenuAdminView() {
    if (!Auth.hasRole('admin')) return;
    renderAdminMenu();
  }

  function renderAdminMenu() {
    const menu = Menu.getMenu();
    const container = document.getElementById('adminMenuList');

    container.innerHTML = menu.map(item => `
      <div class="admin-dish-card">
        <img src="${item.image}" alt="${item.name}" class="admin-dish-image">
        <div class="admin-dish-info">
          <h4>${item.name}</h4>
          <p>${item.category} - ${formatCOP(item.price)}</p>
          <p>${item.description}</p>
        </div>
        <div class="admin-dish-actions">
          <button onclick="toggleDishAvailability(${item.id})">${item.available ? 'Desactivar' : 'Activar'}</button>
          <button onclick="deleteDish(${item.id})">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  window.toggleDishAvailability = function(id) {
    Menu.toggleAvailability(id);
    renderAdminMenu();
  };

  window.deleteDish = function(id) {
    if (confirm('¿Está seguro de eliminar este plato?')) {
      Menu.deleteDish(id);
      renderAdminMenu();
    }
  };

  function loadReportsView() {
    if (!Auth.hasRole('admin')) return;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportStartDate').value = today;
    document.getElementById('reportEndDate').value = today;
  }

  function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const result = Auth.login(username, password);
        if (result) {
          showMainView();
        } else {
          document.getElementById('loginError').textContent = 'Usuario o contraseña inválidos';
        }
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        cart = [];
        showLoginView();
      });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMenu();
      });
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        showCheckoutModal();
      });
    }

    const closeOrderDetail = document.getElementById('closeOrderDetail');
    if (closeOrderDetail) {
      closeOrderDetail.addEventListener('click', () => {
        document.getElementById('orderDetailModal').classList.remove('open');
      });
    }

    document.getElementById('orderDetailModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('orderDetailModal').classList.remove('open');
      }
    });
  }

  function showCheckoutModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Confirmar Pedido';
    modalBody.innerHTML = `
      <form id="checkoutForm">
        <div class="form-group">
          <label>Nombre del cliente</label>
          <input type="text" id="customerName" required>
        </div>
        <div class="form-group">
          <label>Número de mesa</label>
          <input type="number" id="tableNumber" required min="1" max="50">
        </div>
        <div class="form-group">
          <label>Notas adicionales</label>
          <textarea id="orderNotes" rows="3"></textarea>
        </div>
        <div class="order-summary">
          <h4>Resumen</h4>
          ${cart.map(i => `<div>${i.quantity}x ${i.name} - ${formatCOP(i.price * i.quantity)}</div>`).join('')}
          <div class="total">Total: ${formatCOP(cart.reduce((s, i) => s + i.price * i.quantity, 0))}</div>
        </div>
        <button type="submit" class="confirm-btn">Confirmar Pedido</button>
      </form>
    `;

    modal.classList.add('open');

    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const order = Orders.create({
        customer: document.getElementById('customerName').value,
        table: parseInt(document.getElementById('tableNumber').value),
        notes: document.getElementById('orderNotes').value,
        items: [...cart],
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0)
      });

      cart = [];
      saveCart();
      updateCartUI();
      closeCartSidebar();
      modal.classList.remove('open');

      playNotificationSound();

      const successHtml = `
        <div class="success-content">
          <div class="success-icon">&#9989;</div>
          <h3>¡Pedido Confirmado!</h3>
          <p>Pedido #${order.id} creado exitosamente</p>
          <button onclick="document.getElementById('modal').classList.remove('open')" class="confirm-btn">Cerrar</button>
        </div>
      `;
      modalTitle.textContent = 'Pedido Exitoso';
      modalBody.innerHTML = successHtml;
      modal.classList.add('open');
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  init();
})();
