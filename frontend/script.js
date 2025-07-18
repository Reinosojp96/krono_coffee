// script.js
const API_BASE_URL = 'https://krono-coffee-backend.onrender.com/api/v1';

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const messageModal = document.getElementById('message-modal');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const closeButtons = document.querySelectorAll('.close-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const menuItemsGrid = document.getElementById('menu-items-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const offersSection = document.getElementById('offers');
const orderSection = document.getElementById('order-section');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const placeOrderBtn = document.getElementById('place-order-btn');
const dashboardLink = document.getElementById('dashboard-link');
const dashboardSection = document.getElementById('dashboard');
const ordersList = document.getElementById('orders-list');
const viewMenuBtn = document.getElementById('view-menu-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNav = document.getElementById('main-nav');
const navCartLink = document.getElementById('nav-cart-link');

let currentUser = null;
let cart = [];
let allMenuItems = [];

function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
}

function showMessage(title, text) {
  messageTitle.textContent = title;
  messageText.innerHTML = text;
  showModal(messageModal);
}

function saveToken(token) {
  localStorage.setItem('access_token', token);
}

function getToken() {
  return localStorage.getItem('access_token');
}

function removeToken() {
  localStorage.removeItem('access_token');
}

async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false, contentType = 'application/json') {
  const headers = {};
  if (contentType === 'application/json') {
    headers['Content-Type'] = 'application/json';
  } else if (contentType === 'application/x-www-form-urlencoded') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      showMessage('Error de Autenticación', 'No estás autenticado. Por favor, inicia sesión.');
      throw new Error('No authentication token found.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = { method, headers };
  if (body) {
    config.body = contentType === 'application/json'
      ? JSON.stringify(body)
      : new URLSearchParams(body).toString();
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    const err = data.detail || 'Ocurrió un error en la API.';
    showMessage('Error', err);
    throw new Error(err);
  }
  return data;
}

async function updateUI() {
  const token = getToken();
  if (token) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = { username: payload.sub, role: payload.role };
    offersSection.classList.add('hidden');
    orderSection.classList.remove('hidden');
    navCartLink.classList.remove('hidden');
    if (currentUser.role === 'admin' || currentUser.role === 'employee') {
      dashboardLink.classList.remove('hidden');
      await fetchOrders();
    } else {
      dashboardLink.classList.add('hidden');
    }
  } else {
    currentUser = null;
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    offersSection.classList.add('hidden');
    dashboardLink.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    orderSection.classList.remove('hidden');
    navCartLink.classList.remove('hidden');
  }
  await fetchMenu();
  updateCartUI();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const data = await apiRequest(
      '/auth/token',
      'POST',
      { username: email, password },
      false,
      'application/x-www-form-urlencoded'
    );
    saveToken(data.access_token);
    await updateUI();
    hideModal(loginModal);
    showMessage('Inicio de Sesión Exitoso', '¡Bienvenido de nuevo a Krono Coffee!');
    loginMessage.textContent = '';
    loginForm.reset();
  } catch (e) {
    loginMessage.textContent = e.message || 'Error al iniciar sesión. Verifica tus credenciales.';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const fullName = document.getElementById('register-fullname').value;
  const id = document.getElementById('register-id').value;
  const documentType = document.getElementById('register-doc-type').value;
  if (!documentType || !id || !fullName) {
    registerMessage.textContent = 'Por favor completa todos los campos requeridos.';
    return;
  }
  try {
    await apiRequest('/auth/register', 'POST', {
      id,
      document_type: documentType,
      full_name: fullName,
      username,
      email,
      password
    });
    hideModal(registerModal);
    showMessage('Registro Exitoso', '¡Regístrate e inicia sesión!');
    registerMessage.textContent = '';
    registerForm.reset();
    showModal(loginModal);
  } catch (e) {
    registerMessage.textContent = e.message || 'Error al registrarse.';
  }
}

async function fetchMenu() {
  try {
    const items = await apiRequest('/menu/menu');
    allMenuItems = items;
    displayMenuItems(allMenuItems, 'all');
  } catch {
    menuItemsGrid.innerHTML =
      '<p class="text-center text-red-500 col-span-full">Error al cargar el menú.</p>';
  }
}

function displayMenuItems(items, category = 'all') {
  menuItemsGrid.innerHTML = '';
  const filtered = category === 'all'
    ? items
    : items.filter(item => item.category === category);
  if (!filtered.length) {
    menuItemsGrid.innerHTML =
      '<p class="text-center text-gray-400 col-span-full">No hay ítems en esta categoría.</p>';
    return;
  }
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('menu-item-card');
    card.innerHTML = `
      <img src="${item.image_url || 'https://placehold.co/300x200'}" alt="${item.name}">
      <h4>${item.name}</h4>
      <p class="description">${item.description}</p>
      <span class="price">$${item.price.toFixed(2)}</span>
      <button class="btn btn-primary add-to-cart-btn mt-auto"
              data-item-id="${item.id}"
              data-item-name="${item.name}"
              data-item-price="${item.price}">
        Añadir al Carrito
      </button>
    `;
    menuItemsGrid.appendChild(card);
  });
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.itemId;
      const name = btn.dataset.itemName;
      const price = parseFloat(btn.dataset.itemPrice);
      const existing = cart.find(i => i.id == id);
      if (existing) existing.quantity++;
      else cart.push({ id, name, price, quantity: 1 });
      updateCartUI();
      showMessage('Producto Añadido', `<p>${name} agregado.</p>`);
    });
  });
}

function updateCartUI() {
  cartList.innerHTML = '';
  let total = 0;
  if (!currentUser || currentUser.role !== 'client') {
    cartList.innerHTML =
      '<li class="text-gray-400 py-2">Inicia sesión como cliente para el carrito.</li>';
    cartTotal.textContent = '0.00';
    placeOrderBtn.classList.add('hidden');
    return;
  }
  if (!cart.length) {
    cartList.innerHTML =
      '<li class="text-gray-400 py-2">Tu carrito está vacío.</li>';
    placeOrderBtn.classList.add('hidden');
  } else {
    cart.forEach(item => {
      total += item.price * item.quantity;
      const li = document.createElement('li');
      li.classList.add('py-2');
      li.innerHTML = `
        <div class="flex justify-between items-center">
          <span>${item.name} x${item.quantity}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
          <button class="remove-from-cart" data-item-id="${item.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      cartList.appendChild(li);
    });
    placeOrderBtn.classList.remove('hidden');
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i.id != btn.dataset.itemId);
        updateCartUI();
      });
    });
  }
  cartTotal.textContent = total.toFixed(2);
}

async function placeOrder() {
  if (!cart.length) {
    showMessage('Carrito Vacío', 'No puedes pedir con el carrito vacío.');
    return;
  }
  const items = cart.map(i => ({
    menu_item_id: i.id,
    name: i.name,
    quantity: i.quantity,
    price_at_order: i.price
  }));
  const total = parseFloat(cartTotal.textContent);
  try {
    const res = await apiRequest('/orders/', 'POST', { items, total }, true);
    let receipt = `
      <p><strong>Pedido #${res.order_id}</strong></p>
      <p><strong>Cliente:</strong> ${currentUser.username}</p>
      <ul>
        ${res.items.map(i => `<li>${i.name} x${i.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total:</strong> $${res.total.toFixed(2)}</p>
    `;
    showMessage('Pedido Confirmado', receipt);
    cart = [];
    updateCartUI();
  } catch (e) {
    showMessage('Error al Realizar Pedido', e.message);
  }
}

async function fetchOrders() {
  if (!currentUser || !['admin','employee'].includes(currentUser.role)) {
    dashboardSection.classList.add('hidden');
    return;
  }
  dashboardSection.classList.remove('hidden');
  try {
    const orders = await apiRequest('/orders/all', 'GET', null, true);
    ordersList.innerHTML = '';
    if (!orders.length) {
      ordersList.innerHTML =
        '<p class="text-center text-gray-400 col-span-full">No hay pedidos.</p>';
      return;
    }
    orders.forEach(o => {
      const card = document.createElement('div');
      card.classList.add('order-card');
      card.innerHTML = `
        <h4>Pedido #${o.id}</h4>
        <p><strong>Cliente:</strong> ${o.username}</p>
        <p><strong>Total:</strong> $${o.total.toFixed(2)}</p>
        <p><strong>Estado:</strong> ${o.status.toUpperCase()}</p>
        <ul>
          ${o.items.map(i => `<li>${i.name} x${i.quantity}</li>`).join('')}
        </ul>
        ${o.status==='pending'
          ? `<button class="complete-order-btn" data-id="${o.id}">Completar</button>
             <button class="cancel-order-btn" data-id="${o.id}">Cancelar</button>`
          : ''
        }
      `;
      ordersList.appendChild(card);
    });
    document.querySelectorAll('.complete-order-btn').forEach(b =>
      b.addEventListener('click', () => updateOrderStatus(b.dataset.id,'completed'))
    );
    document.querySelectorAll('.cancel-order-btn').forEach(b =>
      b.addEventListener('click', () => updateOrderStatus(b.dataset.id,'cancelled'))
    );
  } catch {
    ordersList.innerHTML =
      '<p class="text-center text-red-500 col-span-full">Error al cargar pedidos.</p>';
  }
}

async function updateOrderStatus(id, status) {
  try {
    await apiRequest(`/orders/${id}/status`, 'PUT', { status }, true);
    showMessage('Estado Actualizado', `<p>Pedido #${id} ${status}.</p>`);
    fetchOrders();
  } catch {
    showMessage('Error', `<p>No se pudo cambiar pedido ${id}.</p>`);
  }
}

loginBtn.addEventListener('click', () => showModal(loginModal));
closeButtons.forEach(b => b.addEventListener('click', e => {
  if (e.target.closest('#login-modal')) hideModal(loginModal);
  if (e.target.closest('#register-modal')) hideModal(registerModal);
  if (e.target.closest('#message-modal')) hideModal(messageModal);
}));
showRegisterLink.addEventListener('click', e => { e.preventDefault(); hideModal(loginModal); showModal(registerModal); });
showLoginLink.addEventListener('click', e => { e.preventDefault(); hideModal(registerModal); showModal(loginModal); });
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', () => {
  removeToken();
  currentUser = null;
  updateUI();
  showMessage('Sesión Cerrada','Has cerrado sesión.');
});
viewMenuBtn.addEventListener('click', () => document.getElementById('menu').scrollIntoView({behavior:'smooth'}));
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  displayMenuItems(allMenuItems, btn.dataset.category);
}));
hamburgerMenu.addEventListener('click', () => {
  mainNav.classList.toggle('active');
  const icon = hamburgerMenu.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});
mainNav.querySelectorAll('.nav-link').forEach(link =>
  link.addEventListener('click', () => {
    mainNav.classList.remove('active');
    const icon = hamburgerMenu.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-times');
  })
);

document.addEventListener('DOMContentLoaded', () => {
  updateUI();

  const adminBtn = document.getElementById('admin-btn');
  const adminPanel = document.getElementById('admin-panel');
  const adminForm = document.getElementById('admin-form');
  const formMessage = document.getElementById('admin-form-message');

  if (currentUser && currentUser.role === 'admin') {
    adminBtn.classList.remove('hidden');
  }

  adminBtn.addEventListener('click', e => {
    e.preventDefault();
    const hidden = adminPanel.classList.toggle('hidden');
    if (!hidden) window.scrollTo({ top: adminPanel.offsetTop, behavior: 'smooth' });
  });

  adminForm.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('nombre').value,
      description: document.getElementById('descripcion').value,
      price: parseFloat(document.getElementById('precio').value),
      category: document.getElementById('categoria').value,
      image_url: document.getElementById('imagen').value,
      is_available: true
    };
    try {
      await apiRequest('/admin/menu', 'POST', payload, true);
      formMessage.textContent = '✅ Producto agregado correctamente.';
      adminForm.reset();
      fetchMenu();
    } catch {
      formMessage.textContent = '❌ Error al agregar el producto.';
    }
  });
});
