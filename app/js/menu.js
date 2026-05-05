const Menu = {
  data: [
    { id: 1, name: "Bruschetta Clásica", description: "Pan tostado con tomate fresco, albahaca, ajo y aceite de oliva", price: 17500, category: "Entradas", image: "https://images.unsplash.com/photo-1572695157366-5e585842a35e?w=400&h=300&fit=crop", available: true },
    { id: 2, name: "Nachos Supremos", description: "Totopos con queso cheddar, jalapeños, guacamole y crema", price: 21000, category: "Entradas", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop", available: true },
    { id: 3, name: "Ceviche Peruano", description: "Pescado fresco marinado en limón con cebolla y cilantro", price: 26000, category: "Entradas", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop", available: true },
    { id: 4, name: "Lomo Saltado", description: "Tiras de lomo con cebolla, tomate, papas y arroz", price: 37500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1558030006-9c7a15e8a364?w=400&h=300&fit=crop", available: true },
    { id: 5, name: "Salmón a la Parrilla", description: "Salmón fresco con salsa de mantequilla y limón", price: 46000, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop", available: true },
    { id: 6, name: "Pasta Carbonara", description: "Spaghetti con salsa de huevo, panceta y parmesano", price: 32500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop", available: true },
    { id: 7, name: "Hamburguesa Gourmet", description: "Carne angus 200g con queso, bacon y salsa especial", price: 29000, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", available: true },
    { id: 8, name: "Pizza Margherita", description: "Masa artesanal con salsa de tomate y mozzarella", price: 27500, category: "Platos Fuertes", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", available: true },
    { id: 9, name: "Limonada de Coco", description: "Limonada cremosa con leche de coco y hielo", price: 11500, category: "Bebidas", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop", available: true },
    { id: 10, name: "Limonada Natural", description: "Limonada clásica con hielo y azúcar", price: 9000, category: "Bebidas", image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop", available: true },
    { id: 11, name: "Tiramisú", description: "Capas de bizcocho con café, mascarpone y cacao", price: 19000, category: "Postres", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", available: true },
    { id: 12, name: "Cheesecake de Frutos Rojos", description: "Tarta de queso con base de galleta y frutos del bosque", price: 17500, category: "Postres", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop", available: true }
  ],

  categories: ["Entradas", "Platos Fuertes", "Bebidas", "Postres"],

  getMenu() {
    const saved = localStorage.getItem('menuData');
    if (saved) {
      this.data = JSON.parse(saved);
    }
    return this.data;
  },

  getCategories() {
    const saved = localStorage.getItem('menuCategories');
    if (saved) {
      this.categories = JSON.parse(saved);
    }
    return this.categories;
  },

  addDish(dish) {
    const newId = Math.max(...this.data.map(d => d.id), 0) + 1;
    const newDish = { ...dish, id: newId, available: true };
    this.data.push(newDish);
    this.save();
    return newDish;
  },

  updateDish(id, updates) {
    const index = this.data.findIndex(d => d.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      this.save();
      return this.data[index];
    }
    return null;
  },

  deleteDish(id) {
    this.data = this.data.filter(d => d.id !== id);
    this.save();
  },

  toggleAvailability(id) {
    const dish = this.data.find(d => d.id === id);
    if (dish) {
      dish.available = !dish.available;
      this.save();
    }
  },

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.saveCategories();
    }
  },

  removeCategory(category) {
    this.categories = this.categories.filter(c => c !== category);
    this.saveCategories();
  },

  save() {
    localStorage.setItem('menuData', JSON.stringify(this.data));
  },

  saveCategories() {
    localStorage.setItem('menuCategories', JSON.stringify(this.categories));
  }
};
