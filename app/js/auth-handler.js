const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerRole = document.getElementById("registerRole");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");
const authTabs = document.querySelectorAll(".auth-tab");

authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    authTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const tabName = tab.dataset.tab;
    document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));

    if (tabName === "login") {
      loginForm.classList.add("active");
    } else {
      registerForm.classList.add("active");
    }

    loginError.classList.remove("visible");
    registerError.classList.remove("visible");
    registerSuccess.classList.remove("visible");
  });
});

loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const email = loginEmail.value;
  const password = loginPassword.value;

  const result = loginUser(email, password);

  if (!result.success) {
    loginError.textContent = result.message;
    loginError.classList.add("visible");
    return;
  }

  loginError.classList.remove("visible");

  if (result.user.role === "admin") {
    window.location.href = "index.html";
  } else if (result.user.role === "mesero") {
    window.location.href = "index.html";
  } else {
    window.location.href = "index.html";
  }
});

registerForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = registerName.value;
  const email = registerEmail.value;
  const password = registerPassword.value;
  const role = registerRole.value;

  if (password.length < 6) {
    registerError.textContent = "La contraseña debe tener al menos 6 caracteres";
    registerError.classList.add("visible");
    return;
  }

  const result = registerUser(name, email, password, role);

  if (!result.success) {
    registerError.textContent = result.message;
    registerError.classList.add("visible");
    registerSuccess.classList.remove("visible");
    return;
  }

  registerError.classList.remove("visible");
  registerSuccess.textContent = result.message;
  registerSuccess.classList.add("visible");
  registerForm.reset();

  setTimeout(() => {
    registerSuccess.classList.remove("visible");
    authTabs[0].click();
  }, 2000);
});

const session = getCurrentSession();
if (session.isLoggedIn) {
  window.location.href = "index.html";
}
