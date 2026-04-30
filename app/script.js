const menuData = [
  {
    id: 1,
    name: "Bruschetta Clásica",
    description: "Pan tostado con tomate fresco, albahaca, ajo y aceite de oliva extra virgen",
    price: 8.50,
    category: "Entradas",
    image: "https://images.unsplash.com/photo-1572695157366-5e585842a35e?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "Nachos Supremos",
    description: "Totopos crujientes con queso cheddar, jalapeños, guacamole y crema agria",
    price: 10.00,
    category: "Entradas",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Ceviche Peruano",
    description: "Pescado fresco marinado en limón con cebolla morada, cilantro y ají",
    price: 12.50,
    category: "Entradas",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Lomo Saltado",
    description: "Tiras de lomo fino salteadas con cebolla, tomate, papas fritas y arroz",
    price: 18.00,
    category: "Platos Fuertes",
    image: "https://images.unsplash.com/photo-1558030006-9c7a15e8a364?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "Salmón a la Parrilla",
    description: "Salmón fresco a la parrilla con salsa de mantequilla, limón y hierbas finas",
    price: 22.00,
    category: "Platos Fuertes",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    name: "Pasta Carbonara",
    description: "Spaghetti con salsa cremosa de huevo, panceta crujiente y parmesano",
    price: 15.50,
    category: "Platos Fuertes",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop"
  },
  {
    id: 7,
    name: "Hamburguesa Gourmet",
    description: "Carne angus 200g, queso cheddar, bacon, lechuga, tomate y salsa especial",
    price: 14.00,
    category: "Platos Fuertes",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
  },
  {
    id: 8,
    name: "Pizza Margherita",
    description: "Masa artesanal con salsa de tomate San Marzano, mozzarella fresca y albahaca",
    price: 13.00,
    category: "Platos Fuertes",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop"
  },
  {
    id: 9,
    name: "Limonada de Coco",
    description: "Limonada natural cremosa con leche de coco y hielo frappé",
    price: 5.50,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop"
  },
  {
    id: 10,
    name: "Mojito Clásico",
    description: "Ron blanco, menta fresca, lima, azúcar de caña y soda",
    price: 8.00,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop"
  },
  {
    id: 11,
    name: "Tiramisú",
    description: "Capas de bizcocho empapado en café, mascarpone cremoso y cacao en polvo",
    price: 9.00,
    category: "Postres",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"
  },
  {
    id: 12,
    name: "Cheesecake de Frutos Rojos",
    description: "Tarta de queso cremosa con base de galleta y coulis de frutos del bosque",
    price: 8.50,
    category: "Postres",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop"
  }
];

const categories = ["Todos", ...new Set(menuData.map(item => item.category))];

let cart = [];
let currentCategory = "Todos";
let searchQuery = "";

// DOM Elements
const menuGrid = document.getElementById("menuGrid");
const categoriesContainer = document.getElementById("categoriesContainer");
const categoryTitle = document.getElementById("categoryTitle");
const menuCount = document.getElementById("menuCount");
const searchInput = document.getElementById("searchInput");
const cartToggle = document.getElementById("cartToggle");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutForm = document.getElementById("checkoutForm");
const orderSummaryItems = document.getElementById("orderSummaryItems");
const summaryTotal = document.getElementById("summaryTotal");
const successModal = document.getElementById("successModal");
const successMessage = document.getElementById("successMessage");
const closeSuccess = document.getElementById("closeSuccess");
const ordersHistoryBtn = document.getElementById("ordersHistoryBtn");
const ordersModal = document.getElementById("ordersModal");
const closeOrders = document.getElementById("closeOrders");
const ordersList = document.getElementById("ordersList");

function init() {
  loadCart();
  renderCategories();
  renderMenu();
  updateCartUI();
  setupEventListeners();
}

function setupEventListeners() {
  cartToggle.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartSidebar);
  cartOverlay.addEventListener("click", closeCartSidebar);
  checkoutBtn.addEventListener("click", openCheckout);
  closeModal.addEventListener("click", closeCheckoutModal);
  checkoutForm.addEventListener("submit", handleCheckout);
  closeSuccess.addEventListener("click", closeSuccessModal);
  ordersHistoryBtn.addEventListener("click", openOrdersHistory);
  closeOrders.addEventListener("click", closeOrdersHistoryModal);
  searchInput.addEventListener("input", handleSearch);
}

function renderCategories() {
  categoriesContainer.innerHTML = categories
    .map(cat => `
      <button class="category-btn ${cat === currentCategory ? "active" : ""}" data-category="${cat}">
        ${cat}
      </button>
    `)
    .join("");

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const filtered = menuData.filter(item => {
    const matchCategory = currentCategory === "Todos" || item.category === currentCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  categoryTitle.textContent = currentCategory === "Todos" ? "Todos los platos" : currentCategory;
  menuCount.textContent = `${filtered.length} plato${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    menuGrid.innerHTML = `
      <div class="no-results">
        <span>&#128533;</span>
        <p>No se encontraron platos</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filtered
    .map((item, index) => `
      <div class="dish-card" style="animation-delay: ${index * 0.08}s">
        <div class="image-container">
          <img src="${item.image}" alt="${item.name}" class="dish-image" loading="lazy"
               onerror="this.src='https://via.placeholder.com/400x300/e9ecef/495057?text=Plato'">
          <span class="dish-category-tag">${item.category}</span>
        </div>
        <div class="dish-content">
          <div class="dish-header">
            <h3 class="dish-name">${item.name}</h3>
            <span class="dish-price">$${item.price.toFixed(2)}</span>
          </div>
          <p class="dish-description">${item.description}</p>
          <button class="add-btn" data-id="${item.id}">
            Agregar al pedido
          </button>
        </div>
      </div>
    `)
    .join("");

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      addToCart(id);
      btn.classList.add("added");
      btn.textContent = "¡Agregado!";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = "Agregar al pedido";
      }, 1500);
    });
  });
}

function handleSearch(e) {
  searchQuery = e.target.value;
  renderMenu();
}

function addToCart(id) {
  const item = menuData.find(d => d.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  bumpCartCount();
}

function bumpCartCount() {
  cartCount.classList.remove("bump");
  void cartCount.offsetWidth;
  cartCount.classList.add("bump");
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  checkoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">&#128722;</span>
        <p>Tu carrito está vacío</p>
        <span class="empty-hint">Agrega platos deliciosos</span>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart
    .map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image"
             onerror="this.src='https://via.placeholder.com/60x60/e9ecef/495057?text=?'">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove-btn" data-id="${item.id}">&times;</button>
      </div>
    `)
    .join("");

  document.querySelectorAll(".qty-increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      updateQuantity(id, 1);
    });
  });

  document.querySelectorAll(".qty-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      updateQuantity(id, -1);
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      removeFromCart(id);
    });
  });
}

function updateQuantity(id, change) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function openCheckout() {
  closeCartSidebar();
  const summaryHTML = cart
    .map(item => `
      <div class="summary-item">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `)
    .join("");

  orderSummaryItems.innerHTML = summaryHTML;
  summaryTotal.textContent = `$${getTotal().toFixed(2)}`;
  checkoutModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("open");
  document.body.style.overflow = "";
}

function handleCheckout(e) {
  e.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const tableNumber = document.getElementById("tableNumber").value;
  const orderNotes = document.getElementById("orderNotes").value.trim();

  if (!customerName || !tableNumber) return;

  const order = {
    id: Date.now(),
    customer: customerName,
    table: tableNumber,
    notes: orderNotes,
    items: [...cart],
    total: getTotal(),
    date: new Date().toLocaleString("es-ES")
  };

  saveOrder(order);

  successMessage.textContent = `Pedido #${order.id} confirmado para ${customerName} (Mesa ${tableNumber})`;
  successModal.classList.add("open");

  cart = [];
  saveCart();
  updateCartUI();
  checkoutForm.reset();
  closeCheckoutModal();
}

function closeSuccessModal() {
  successModal.classList.remove("open");
  document.body.style.overflow = "";
}

function saveCart() {
  localStorage.setItem("restaurantCart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("restaurantCart");
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem("restaurantOrders", JSON.stringify(orders));
}

function getOrders() {
  const saved = localStorage.getItem("restaurantOrders");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function openOrdersHistory() {
  const orders = getOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="no-orders">
        <p>No hay pedidos registrados</p>
      </div>
    `;
  } else {
    ordersList.innerHTML = orders
      .map(order => `
        <div class="order-card">
          <div class="order-card-header">
            <span>Pedido #${order.id}</span>
            <span>Mesa ${order.table}</span>
          </div>
          <div class="order-card-date">${order.date} - Cliente: ${order.customer}</div>
          <div class="order-card-items">
            ${order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
          </div>
          <div class="order-card-total">Total: $${order.total.toFixed(2)}</div>
        </div>
      `)
      .join("");
  }

  ordersModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOrdersHistoryModal() {
  ordersModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeCartSidebar();
    closeCheckoutModal();
    closeSuccessModal();
    closeOrdersHistoryModal();
  }
});

init();
