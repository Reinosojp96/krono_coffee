// script.js
const API_BASE_URL ='https://krono-coffee-backend.onrender.com/api/v1';

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
const offersList = document.getElementById('offers-list');
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

function showModal(modalElement) {
    modalElement.classList.remove('hidden');
}

function hideModal(modalElement) {
    modalElement.classList.add('hidden');
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

function updateUI() {
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
            fetchOrders();
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
    fetchMenu();
    updateCartUI();
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

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        if (contentType === 'application/json') {
            config.body = JSON.stringify(body);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            config.body = new URLSearchParams(body).toString();
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.detail || 'Ocurrió un error en la API.';
            showMessage('Error', errorMessage);
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error('Error en la solicitud a la API:', error);
        showMessage('Error de Conexión', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
        throw error;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest(
            '/auth/token',
            'POST',
            { username: email, password: password },
            false,
            'application/x-www-form-urlencoded'
        );
        saveToken(data.access_token);
        updateUI();
        hideModal(loginModal);
        showMessage('Inicio de Sesión Exitoso', '¡Bienvenido de nuevo a Krono Coffee!');
        loginMessage.textContent = '';
        loginForm.reset(); // Vaciar campos del formulario de login
    } catch (error) {
        loginMessage.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
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
        showMessage('Registro Exitoso', '¡Bienvenido a Krono Coffee! Por favor, inicia sesión con tus nuevas credenciales.');
        registerMessage.textContent = '';
        registerForm.reset(); // Vaciar campos del formulario de registro
        showModal(loginModal);
    } catch (error) {
        registerMessage.textContent = error.message || 'Error al registrarse. Inténtalo de nuevo.';
    }
}

async function fetchMenu() {
    try {
        const menuItems = await apiRequest('/menu/menu', 'GET');
        allMenuItems = menuItems;
        displayMenuItems(allMenuItems, 'all');
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        menuItemsGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar el menú. Inténtalo de nuevo más tarde.</p>';
    }
}

function displayMenuItems(items, category = 'all') {
    menuItemsGrid.innerHTML = '';
    const filteredItems = category === 'all' ? items : items.filter(item => item.category === category);

    if (filteredItems.length === 0) {
        menuItemsGrid.innerHTML = '<p class="text-center text-gray-400 col-span-full">No hay ítems en esta categoría.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('menu-item-card');
        itemCard.innerHTML = `
            <img src="${item.image || 'https://placehold.co/300x200/3d2200/d4af37?text=No+Image'}" alt="${item.name}">
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
        menuItemsGrid.appendChild(itemCard);
    });
    addAddToCartListeners();
}

async function fetchOffers() {
}

function addToCart(event) {
    const itemId = event.target.dataset.itemId;
    const itemName = event.target.dataset.itemName;
    const itemPrice = parseFloat(event.target.dataset.itemPrice);

    const existingItem = cart.find(item => item.id == itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
    }
    updateCartUI();
    showMessage('Producto Añadido', `<p>${itemName} ha sido añadido al carrito.</p>`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id != itemId);
    updateCartUI();
}

function updateCartUI() {
    cartList.innerHTML = '';
    let total = 0;

    if (!currentUser || currentUser.role !== 'client') {
        cartList.innerHTML = '<li class="text-gray-400 py-2">Inicia sesión como cliente para gestionar tu carrito.</li>';
        cartTotal.textContent = '0.00';
        placeOrderBtn.classList.add('hidden'); 
        return;
    }

    if (cart.length === 0) {
        cartList.innerHTML = '<li class="text-gray-400 py-2">Tu carrito está vacío.</li>';
        placeOrderBtn.classList.add('hidden');
    } else {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('py-2');
            li.innerHTML = `
                <div class="cart-item-wrapper flex justify-between items-center w-full">
                    <span class="item-name">${item.name}</span>
                    <div class="flex items-center">
                        <span class="item-quantity">x${item.quantity}</span>
                        <span class="item-price ml-4">$${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="remove-from-cart ml-4" data-item-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
            cartList.appendChild(li);
            total += item.price * item.quantity;
        });
        placeOrderBtn.classList.remove('hidden');
    }
    cartTotal.textContent = total.toFixed(2);
    
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.target.closest('button').dataset.itemId;
            removeFromCart(itemId);
        };
    });
}

async function placeOrder() {
    if (cart.length === 0) {
        showMessage('Carrito Vacío', 'No puedes realizar un pedido con el carrito vacío.');
        return;
    }

    const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price_at_order: item.price
    }));
    const orderTotal = parseFloat(cartTotal.textContent);

    try {
        const response = await apiRequest('/orders/', 'POST', { items: orderItems, total: orderTotal }, true);
        
        let receiptContent = `
            <p><strong>Pedido #${response.order_id}</strong></p>
            <p><strong>Cliente:</strong> ${currentUser ? currentUser.username : 'Invitado'}</p>
            <p><strong>Fecha:</strong> ${new Date(response.timestamp).toLocaleDateString()} ${new Date(response.timestamp).toLocaleTimeString()}</p>
            <hr class="my-4 border-gray-600">
            <h5 class="font-semibold text-white mb-2">Detalles del Pedido:</h5>
            <ul class="text-left mb-4">
                ${response.items.map(item => `<li>${item.name} x${item.quantity} - $${(item.price_at_order * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <hr class="my-4 border-gray-600">
            <p class="text-right text-2xl font-bold text-white">Total: $${response.total.toFixed(2)}</p>
            <p class="text-center mt-4 text-gray-400">¡Gracias por tu compra en Krono Coffee!</p>
        `;

        showMessage('Pedido Confirmado', receiptContent);
        cart = [];
        updateCartUI();
    } catch (error) {
        showMessage('Error al Realizar Pedido', error.message || 'Hubo un problema al procesar tu pedido. Inténtalo de nuevo.');
    }
}

async function fetchOrders() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'employee')) {
        dashboardSection.classList.add('hidden');
        return;
    }
    dashboardSection.classList.remove('hidden');

    try {
        const orders = await apiRequest('/orders/all', 'GET', null, true);
        
        ordersList.innerHTML = '';
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-center text-gray-400 col-span-full">No hay pedidos pendientes.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');
            orderCard.innerHTML = `
                <div class="order-card-content">
                    <h4>Pedido #${order.id}</h4>
                    <p><strong>Cliente:</strong> ${order.username}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Estado:</strong> <span class="status-${order.status}">${order.status.toUpperCase()}</span></p>
                    <p><strong>Hora:</strong> ${new Date(order.timestamp).toLocaleTimeString()}</p>
                    <h5>Artículos:</h5>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
                    </ul>
                    <div class="order-actions">
                        ${order.status === 'pending' ? `
                            <button class="btn btn-primary btn-sm complete-order-btn" data-order-id="${order.id}">Completar</button>
                            <button class="btn btn-secondary btn-sm cancel-order-btn" data-order-id="${order.id}">Cancelar</button>
                        ` : ''}
                    </div>
                </div>
            `;
            ordersList.appendChild(orderCard);
        });

        document.querySelectorAll('.complete-order-btn').forEach(button => {
            button.onclick = (e) => updateOrderStatus(e.target.dataset.orderId, 'completed');
        });
        document.querySelectorAll('.cancel-order-btn').forEach(button => {
            button.onclick = (e) => updateOrderStatus(e.target.dataset.orderId, 'cancelled');
        });

    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
        ordersList.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar los pedidos. Inténtalo de nuevo más tarde.</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/orders/${orderId}/status`, 'PUT', { status: status }, true);
        showMessage('Estado Actualizado', `<p>Pedido #${orderId} marcado como ${status}.</p>`);
        fetchOrders();
    }
    catch (error) {
        showMessage('Error', `<p>No se pudo actualizar el estado del pedido #${orderId}.</p>`);
    }
}

loginBtn.addEventListener('click', () => showModal(loginModal));

closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        if (event.target.closest('#login-modal')) hideModal(loginModal);
        if (event.target.closest('#register-modal')) hideModal(registerModal);
        if (event.target.closest('#message-modal')) hideModal(messageModal);
    });
});

showRegisterLink.addEventListener('click', (event) => {
    event.preventDefault();
    hideModal(loginModal);
    showModal(registerModal);
});

showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    hideModal(registerModal);
    showModal(loginModal);
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

logoutBtn.addEventListener('click', () => {
    removeToken();
    currentUser = null;
    updateUI();
    showMessage('Sesión Cerrada', '<p>Has cerrado tu sesión exitosamente.</p>');
});

function addAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.removeEventListener('click', addToCart);
        button.addEventListener('click', addToCart);
    });
}

placeOrderBtn.addEventListener('click', placeOrder);

dashboardLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'dashboard' && section.id !== 'hero' && section.id !== 'about' && section.id !== 'contact' && section.id !== 'gallery' && section.id !== 'menu' && section.id !== 'order-section') {
            section.classList.add('hidden');
        }
    });
    dashboardSection.classList.remove('hidden');
    fetchOrders();
});

viewMenuBtn.addEventListener('click', () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.dataset.category;
        displayMenuItems(allMenuItems, category);
    });
});

hamburgerMenu.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const icon = hamburgerMenu.querySelector('i');
    if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        hamburgerMenu.querySelector('i').classList.remove('fa-times');
        hamburgerMenu.querySelector('i').classList.add('fa-bars');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    updateUI();

     // ———————— LÓGICA DE ADMIN ————————
    const adminBtn      = document.getElementById('admin-btn');
    const adminPanel    = document.getElementById('admin-panel');
    const adminForm     = document.getElementById('admin-form');
    const formMessage   = document.getElementById('admin-form-message');

     // 1) Mostrar botón y panel solo si el rol es ADMIN
    if (currentUser && currentUser.role === 'admin') {
        adminBtn.classList.remove('hidden');
    }

     // 2) Al hacer clic en "Administrador", mostrar/ocultar el panel
    adminBtn.addEventListener('click', e => {
        e.preventDefault();
        const isHidden = adminPanel.classList.toggle('hidden');
        if (!isHidden) window.scrollTo({ top: adminPanel.offsetTop, behavior: 'smooth' });
    });

     // 3) Al enviar el formulario de admin, llamar al endpoint POST
    adminForm.addEventListener('submit', async e => {
        e.preventDefault();
        const token = getToken();
        const payload = {
            name:        document.getElementById('nombre').value,
            description: document.getElementById('descripcion').value,
            price:       parseFloat(document.getElementById('precio').value),
            category:    document.getElementById('categoria').value,
            image_url:   document.getElementById('imagen').value,
            is_available:true
        };
        try {
            await apiRequest('/admin/menu', 'POST', payload, true);
            formMessage.textContent = '✅ Producto agregado correctamente.';
            adminForm.reset();
             // (Opcional) refrescar menú visible:
            fetchMenu();
        } catch {
            formMessage.textContent = '❌ Error al agregar el producto.';
        }
    });
     // ————————————————————————————————
});