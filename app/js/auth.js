// Sistema simple de autenticación
const Auth = {
  users: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
    { username: 'mesero', password: 'mesero123', role: 'mesero', name: 'Mesero' },
    { username: 'cliente', password: 'cliente123', role: 'cliente', name: 'Cliente' }
  ],

  currentUser: null,

  login(username, password) {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = { username: user.username, role: user.role, name: user.name };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  },

  checkAuth() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      return true;
    }
    return false;
  },

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  },

  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role);
  }
};
