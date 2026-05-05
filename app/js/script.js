function formatCOP(amount) {
  return "$" + Math.round(amount).toLocaleString("es-CO");
}

// Auth system
var currentUser = null;
var users = JSON.parse(localStorage.getItem("restaurantUsers") || '[{"username":"admin","password":"admin123","role":"admin","name":"Administrador"},{"username":"mesero","password":"mesero123","role":"mesero","name":"Mesero"}]');

function checkAuth() {
  var saved = localStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    return true;
  }
  return false;
}

function login(username, password) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      currentUser = { username: users[i].username, role: users[i].role, name: users[i].name };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      return true;
    }
  }
  return false;
}

function register(username, password, role) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username) return false;
  }
  var name = username.charAt(0).toUpperCase() + username.slice(1);
  users.push({ username: username, password: password, role: role, name: name });
  localStorage.setItem("restaurantUsers", JSON.stringify(users));
  return true;
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
}

var menuData = [
  { id: 1, name: "Bruschetta Clásica", description: "Pan tostado con tomate fresco, albahaca, ajo y aceite", price: 17500, category: "Entradas", image: "https://images.unsplash.com/photo-1572695157366-5e585842a35e?w=400&h=300&fit=crop" },
  { id: 2, name: "Nachos Supremos", description: "Totopos con queso, jalapeños y guacamole", price: 21000, category: "Entradas", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop" },
  { id: 3, name: "Ceviche Peruano", description: "Pescado fresco marinado en limón", price: 26000, category: "Entradas", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop" },
  { id: 4, name: "Lomo Saltado", description: "Tiras de lomo con papas y arroz", price: 37500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1558030006-9c7a15e8a364?w=400&h=300&fit=crop" },
  { id: 5, name: "Salmón a la Parrilla", description: "Salmón fresco con salsa de limón", price: 46000, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
  { id: 6, name: "Pasta Carbonara", description: "Spaghetti con salsa de huevo y panceta", price: 32500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop" },
  { id: 7, name: "Hamburguesa Gourmet", description: "Carne angus con queso y bacon", price: 29000, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: 8, name: "Pizza Margherita", description: "Masa artesanal con salsa de tomate", price: 27500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop" },
  { id: 9, name: "Limonada de Coco", description: "Limonada cremosa con leche de coco", price: 11500, category: "Bebidas", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop" },
  { id: 10, name: "Limonada Natural", description: "Limonada clásica con hielo y azúcar", price: 9000, category: "Bebidas", image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop" },
  { id: 11, name: "Tiramisú", description: "Capas de bizcocho con café y mascarpone", price: 19000, category: "Postres", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop" },
  { id: 12, name: "Cheesecake", description: "Tarta de queso con frutos rojos", price: 17500, category: "Postres", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop" }
];

var categories = ["Todos", "Entradas", "Platos Fuertes", "Bebidas", "Postres"];
var cart = [];
var currentCategory = "Todos";
var searchQuery = "";

var menuGrid = document.getElementById("menuGrid");
var categoriesContainer = document.getElementById("categoriesContainer");
var categoryTitle = document.getElementById("categoryTitle");
var menuCount = document.getElementById("menuCount");
var searchInput = document.getElementById("searchInput");
var cartToggle = document.getElementById("cartToggle");
var cartSidebar = document.getElementById("cartSidebar");
var cartOverlay = document.getElementById("cartOverlay");
var closeCartBtn = document.getElementById("closeCart");
var cartItems = document.getElementById("cartItems");
var cartTotal = document.getElementById("cartTotal");
var cartCount = document.getElementById("cartCount");
var checkoutBtn = document.getElementById("checkoutBtn");
var checkoutModal = document.getElementById("checkoutModal");
var closeModal = document.getElementById("closeModal");
var checkoutForm = document.getElementById("checkoutForm");
var orderSummaryItems = document.getElementById("orderSummaryItems");
var summaryTotal = document.getElementById("summaryTotal");
var successModal = document.getElementById("successModal");
var successMessage = document.getElementById("successMessage");
var closeSuccess = document.getElementById("closeSuccess");
var ordersHistoryBtn = document.getElementById("ordersHistoryBtn");
var ordersModal = document.getElementById("ordersModal");
var closeOrders = document.getElementById("closeOrders");
var ordersList = document.getElementById("ordersList");

function init() {
  if (checkAuth()) {
    showUserUI();
  }
  loadCart();
  renderCategories();
  renderMenu();
  updateCartUI();
  setupEventListeners();
}

function showUserUI() {
  if (!currentUser) return;
  var headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    var userInfo = document.getElementById("userInfo");
    if (!userInfo) {
      userInfo = document.createElement("div");
      userInfo.id = "userInfo";
      userInfo.className = "user-welcome";
      headerActions.insertBefore(userInfo, cartToggle);
    }
    userInfo.textContent = "Hola, " + currentUser.name;

    if (!document.getElementById("logoutBtnHeader")) {
      var btn = document.createElement("button");
      btn.id = "logoutBtnHeader";
      btn.className = "logout-btn-header";
      btn.textContent = "Salir";
      btn.addEventListener("click", function() {
        logout();
        location.reload();
      });
      headerActions.appendChild(btn);
    }
  }
}

function setupEventListeners() {
  cartToggle.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCartSidebar);
  cartOverlay.addEventListener("click", closeCartSidebar);
  checkoutBtn.addEventListener("click", openCheckout);
  closeModal.addEventListener("click", closeCheckoutModal);
  checkoutForm.addEventListener("submit", handleCheckout);
  closeSuccess.addEventListener("click", closeSuccessModal);
  ordersHistoryBtn.addEventListener("click", openOrdersHistory);
  closeOrders.addEventListener("click", closeOrdersHistoryModal);
  searchInput.addEventListener("input", handleSearch);

  // Login button
  var loginBtn = document.getElementById("loginBtn");
  var loginModal = document.getElementById("loginModal");
  var closeLogin = document.getElementById("closeLogin");

  if (loginBtn) {
    loginBtn.addEventListener("click", function() {
      loginModal.classList.add("open");
    });
  }
  if (closeLogin) {
    closeLogin.addEventListener("click", function() {
      loginModal.classList.remove("open");
    });
  }

  // Login form
  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var user = document.getElementById("loginUser").value;
      var pass = document.getElementById("loginPass").value;
      if (login(user, pass)) {
        loginModal.classList.remove("open");
        showUserUI();
        alert("Bienvenido " + currentUser.name);
      } else {
        document.getElementById("loginError").textContent = "Usuario o contraseña incorrectos";
      }
    });
  }

  // Register button
  var registerBtn = document.getElementById("registerBtn");
  var registerModal = document.getElementById("registerModal");
  var closeRegister = document.getElementById("closeRegister");

  if (registerBtn) {
    registerBtn.addEventListener("click", function() {
      registerModal.classList.add("open");
    });
  }
  if (closeRegister) {
    closeRegister.addEventListener("click", function() {
      registerModal.classList.remove("open");
    });
  }

  // Register form
  var registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var user = document.getElementById("regUser").value;
      var pass = document.getElementById("regPass").value;
      var role = document.getElementById("regRole").value;
      if (register(user, pass, role)) {
        registerModal.classList.remove("open");
        alert("Registro exitoso. Ya puedes iniciar sesión.");
      } else {
        document.getElementById("registerError").textContent = "El usuario ya existe";
      }
    });
  }
}

function renderCategories() {
  categoriesContainer.innerHTML = "";
  categories.forEach(function(cat) {
    var btn = document.createElement("button");
    btn.className = "category-btn";
    if (cat === currentCategory) btn.classList.add("active");
    btn.textContent = cat;
    btn.setAttribute("data-category", cat);
    btn.addEventListener("click", function() {
      currentCategory = this.getAttribute("data-category");
      renderCategories();
      renderMenu();
    });
    categoriesContainer.appendChild(btn);
  });
}

function renderMenu() {
  var filtered = menuData.filter(function(item) {
    var matchCategory = currentCategory === "Todos" || item.category === currentCategory;
    var matchSearch = item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 || item.description.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
    return matchCategory && matchSearch;
  });

  categoryTitle.textContent = currentCategory === "Todos" ? "Todos los platos" : currentCategory;
  menuCount.textContent = filtered.length + " plato" + (filtered.length !== 1 ? "s" : "");

  if (filtered.length === 0) {
    menuGrid.innerHTML = '<div class="no-results"><span>&#128533;</span><p>No se encontraron platos</p></div>';
    return;
  }

  var html = "";
  filtered.forEach(function(item, index) {
    html += '<div class="dish-card" style="animation-delay: ' + (index * 0.08) + 's">';
    html += '<div class="image-container">';
    html += '<img src="' + item.image + '" alt="' + item.name + '" class="dish-image" loading="lazy">';
    html += '<span class="dish-category-tag">' + item.category + '</span>';
    html += '</div>';
    html += '<div class="dish-content">';
    html += '<div class="dish-header"><h3 class="dish-name">' + item.name + '</h3><span class="dish-price">' + formatCOP(item.price) + '</span></div>';
    html += '<p class="dish-description">' + item.description + '</p>';
    html += '<button class="add-btn" data-id="' + item.id + '">Agregar al pedido</button>';
    html += '</div></div>';
  });
  menuGrid.innerHTML = html;

  document.querySelectorAll(".add-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = parseInt(this.getAttribute("data-id"));
      addToCart(id);
      this.classList.add("added");
      this.textContent = "¡Agregado!";
      var that = this;
      setTimeout(function() {
        that.classList.remove("added");
        that.textContent = "Agregar al pedido";
      }, 1500);
    });
  });
}

function handleSearch(e) {
  searchQuery = e.target.value;
  renderMenu();
}

function addToCart(id) {
  var item = null;
  for (var i = 0; i < menuData.length; i++) {
    if (menuData[i].id === id) { item = menuData[i]; break; }
  }
  if (!item) return;

  var existing = null;
  for (var j = 0; j < cart.length; j++) {
    if (cart[j].id === id) { existing = cart[j]; break; }
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, category: item.category, image: item.image, quantity: 1 });
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
  var totalItems = 0;
  var totalPrice = 0;
  for (var i = 0; i < cart.length; i++) {
    totalItems += cart[i].quantity;
    totalPrice += cart[i].price * cart[i].quantity;
  }

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatCOP(totalPrice);
  checkoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><span class="empty-icon">&#128722;</span><p>Tu carrito está vacío</p><span class="empty-hint">Agrega platos deliciosos</span></div>';
    return;
  }

  var html = "";
  cart.forEach(function(item) {
    html += '<div class="cart-item" data-id="' + item.id + '">';
    html += '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-image">';
    html += '<div class="cart-item-details">';
    html += '<div class="cart-item-name">' + item.name + '</div>';
    html += '<div class="cart-item-price">' + formatCOP(item.price * item.quantity) + '</div>';
    html += '<div class="cart-item-controls">';
    html += '<button class="qty-btn qty-decrease" data-id="' + item.id + '">-</button>';
    html += '<span class="cart-item-qty">' + item.quantity + '</span>';
    html += '<button class="qty-btn qty-increase" data-id="' + item.id + '">+</button>';
    html += '</div></div>';
    html += '<button class="remove-btn" data-id="' + item.id + '">&times;</button>';
    html += '</div>';
  });
  cartItems.innerHTML = html;

  document.querySelectorAll(".qty-increase").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = parseInt(this.getAttribute("data-id"));
      updateQuantity(id, 1);
    });
  });

  document.querySelectorAll(".qty-decrease").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = parseInt(this.getAttribute("data-id"));
      updateQuantity(id, -1);
    });
  });

  document.querySelectorAll(".remove-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = parseInt(this.getAttribute("data-id"));
      removeFromCart(id);
    });
  });
}

function updateQuantity(id, change) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].quantity += change;
      if (cart[i].quantity <= 0) {
        cart.splice(i, 1);
      }
      saveCart();
      updateCartUI();
      return;
    }
  }
}

function removeFromCart(id) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart.splice(i, 1);
      break;
    }
  }
  saveCart();
  updateCartUI();
}

function getTotal() {
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].quantity;
  }
  return total;
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
  var summaryHTML = "";
  cart.forEach(function(item) {
    summaryHTML += '<div class="summary-item"><span>' + item.quantity + 'x ' + item.name + '</span><span>' + formatCOP(item.price * item.quantity) + '</span></div>';
  });
  orderSummaryItems.innerHTML = summaryHTML;
  summaryTotal.textContent = formatCOP(getTotal());
  checkoutModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("open");
  document.body.style.overflow = "";
}

function handleCheckout(e) {
  e.preventDefault();

  var customerName = document.getElementById("customerName").value.trim();
  var tableNumber = document.getElementById("tableNumber").value;
  var orderNotes = document.getElementById("orderNotes").value.trim();

  if (!customerName || !tableNumber) return;

  var order = {
    id: Date.now(),
    customer: customerName,
    table: tableNumber,
    notes: orderNotes,
    items: JSON.parse(JSON.stringify(cart)),
    total: getTotal(),
    date: new Date().toLocaleString("es-ES")
  };

  saveOrder(order);

  successMessage.textContent = "Pedido #" + order.id + " confirmado para " + customerName + " (Mesa " + tableNumber + ")";
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
  var saved = localStorage.getItem("restaurantCart");
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
}

function saveOrder(order) {
  var orders = getOrders();
  orders.unshift(order);
  localStorage.setItem("restaurantOrders", JSON.stringify(orders));
}

function getOrders() {
  var saved = localStorage.getItem("restaurantOrders");
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
  var orders = getOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = '<div class="no-orders"><p>No hay pedidos registrados</p></div>';
  } else {
    var html = "";
    orders.forEach(function(order) {
      html += '<div class="order-card">';
      html += '<div class="order-card-header"><span>Pedido #' + order.id + '</span><span>Mesa ' + order.table + '</span></div>';
      html += '<div class="order-card-date">' + order.date + ' - Cliente: ' + order.customer + '</div>';
      html += '<div class="order-card-items">' + order.items.map(function(i) { return i.quantity + 'x ' + i.name; }).join(", ") + '</div>';
      html += '<div class="order-card-total">Total: ' + formatCOP(order.total) + '</div>';
      html += '</div>';
    });
    ordersList.innerHTML = html;
  }

  ordersModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOrdersHistoryModal() {
  ordersModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeCartSidebar();
    closeCheckoutModal();
    closeSuccessModal();
    closeOrdersHistoryModal();
  }
});

init();
