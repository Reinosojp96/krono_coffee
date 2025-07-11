// script.js

// Base URL de tu backend
const API_BASE_URL ='https://krono-coffee.onrender.com/api/v1'; // Asegúrate de que esta URL sea correcta

// Elementos del DOM
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
const offersSection = document.getElementById('offers'); // Se mantiene la referencia a la sección de ofertas
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

// Enlace de navegación para Carrito
const navCartLink = document.getElementById('nav-cart-link');


let currentUser = null; // Almacena la información del usuario logueado
let cart = []; // Carrito de compras
let allMenuItems = []; // Almacena todos los ítems del menú para filtrar

// --- Funciones de Utilidad ---

/**
 * Muestra un modal específico.
 * @param {HTMLElement} modalElement - El elemento del modal a mostrar.
 */
function showModal(modalElement) {
    modalElement.classList.remove('hidden');
}

/**
 * Oculta un modal específico.
 * @param {HTMLElement} modalElement - El elemento del modal a ocultar.
 */
function hideModal(modalElement) {
    modalElement.classList.add('hidden');
}

/**
 * Muestra un mensaje en el modal de mensajes.
 * @param {string} title - Título del mensaje.
 * @param {string} text - Contenido del mensaje (puede ser HTML para el recibo).
 */
function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.innerHTML = text; // Usar innerHTML para permitir formato de recibo
    showModal(messageModal);
}

/**
 * Guarda el token de autenticación en localStorage.
 * @param {string} token - El token JWT.
 */
function saveToken(token) {
    localStorage.setItem('access_token', token);
}

/**
 * Obtiene el token de autenticación de localStorage.
 * @returns {string|null} El token JWT o null si no existe.
 */
function getToken() {
    return localStorage.getItem('access_token');
}

/**
 * Elimina el token de autenticación de localStorage.
 */
function removeToken() {
    localStorage.removeItem('access_token');
}

/**
 * Actualiza la interfaz de usuario según el estado de autenticación.
 */
function updateUI() {
    const token = getToken();
    if (token) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        // Decodificar el token para obtener el rol del usuario (simplificado, en un entorno real se verificaría en el backend)
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = { username: payload.sub, role: payload.role };
        
        // La sección de ofertas siempre está oculta según la petición del usuario
        offersSection.classList.add('hidden');

        // La sección de carrito y su enlace siempre están visibles para TODOS los usuarios.
        // El contenido interno se gestiona en updateCartUI()
        orderSection.classList.remove('hidden'); 
        navCartLink.classList.remove('hidden');   

        if (currentUser.role === 'admin' || currentUser.role === 'employee') {
            dashboardLink.classList.remove('hidden');
            fetchOrders(); // Cargar pedidos para admin/empleado
            // Ocultar carrito para admin/employee si no lo necesitan (pueden verlo si lo desean)
            // orderSection.classList.add('hidden'); // Comentado para que admin/employee también puedan ver el carrito si lo desean
            // navCartLink.classList.add('hidden'); // Comentado para que el enlace del carrito siempre esté visible
        } else {
            dashboardLink.classList.add('hidden'); // Clientes no ven el dashboard de pedidos
        }
    } else {
        currentUser = null;
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        offersSection.classList.add('hidden'); // Siempre oculta
        dashboardLink.classList.add('hidden');
        dashboardSection.classList.add('hidden'); // Ocultar dashboard si no hay token

        // La sección de carrito y su enlace siempre están visibles para todos,
        // pero el contenido de updateCartUI() indicará que inicie sesión.
        orderSection.classList.remove('hidden');
        navCartLink.classList.remove('hidden');
    }
    fetchMenu(); // Siempre cargar el menú de productos, visible para todos
    updateCartUI(); // Siempre actualizar el carrito, la función maneja el mensaje interno
}

// --- Funciones de API ---

/**
 * Realiza una solicitud a la API.
 * @param {string} endpoint - El endpoint de la API (ej. '/auth/token').
 * @param {string} method - El método HTTP (GET, POST, etc.).
 * @param {object} [body=null] - El cuerpo de la solicitud para POST/PUT.
 * @param {boolean} [requiresAuth=false] - Si la solicitud requiere un token de autenticación.
 * @param {string} [contentType='application/json'] - Tipo de contenido para la solicitud.
 * @returns {Promise<object>} La respuesta de la API en formato JSON.
 */
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

/**
 * Maneja el inicio de sesión del usuario.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // CORRECCIÓN: La ruta de login es /auth/token y usa form-urlencoded
        const data = await apiRequest(
            '/auth/token', // Ruta correcta según Swagger
            'POST',
            { username: email, password: password },
            false, // No requiere autenticación para obtener el token
            'application/x-www-form-urlencoded' // Tipo de contenido para login (OAuth2)
        );
        saveToken(data.access_token);
        updateUI();
        hideModal(loginModal);
        showMessage('Inicio de Sesión Exitoso', '¡Bienvenido de nuevo a Krono Coffee!');
        loginMessage.textContent = ''; // Limpiar mensaje de error
    } catch (error) {
        loginMessage.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
    }
}

/**
 * Maneja el registro de un nuevo usuario.
 * @param {Event} event - El evento de envío del formulario.
 */
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
        showModal(loginModal);
    } catch (error) {
        registerMessage.textContent = error.message || 'Error al registrarse. Inténtalo de nuevo.';
    }
}

/**
 * Carga los elementos del menú desde el backend y los muestra.
 */
async function fetchMenu() {
    try {
        // CORRECCIÓN: La URL debe ser /menu/menu/ según tu Swagger UI
        const menuItems = await apiRequest('/menu/menu', 'GET'); // Eliminado la barra final para consistencia con Swagger
        allMenuItems = menuItems; // Almacena los ítems reales del menú
        displayMenuItems(allMenuItems, 'all'); // Mostrar todos los ítems por defecto al cargar
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        menuItemsGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar el menú. Inténtalo de nuevo más tarde.</p>';
    }
}

/**
 * Muestra los ítems del menú en la cuadrícula, filtrando por categoría si se especifica.
 * @param {Array} items - Array de objetos de ítems del menú.
 * @param {string} [category='all'] - Categoría a filtrar.
 */
function displayMenuItems(items, category = 'all') {
    menuItemsGrid.innerHTML = ''; // Limpiar menú existente
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
    addAddToCartListeners(); // Añadir listeners después de cargar el menú
}

/**
 * Carga las ofertas desde el backend y las muestra para clientes.
 * Esta función ya no se llama directamente desde updateUI, ni se muestra en el nav.
 */
async function fetchOffers() {
    // Esta función no se usa directamente en el flujo actual, pero se mantiene si se necesita.
    // Si se activara, debería hacer una llamada a la API real.
    try {
        // const offers = await apiRequest('/offers/', 'GET', null, true);
        // offersList.innerHTML = '';
        // if (offers.length === 0) {
        //     offersList.innerHTML = '<p class="text-center text-gray-400 col-span-full">No hay promociones disponibles en este momento.</p>';
        //     return;
        // }
        // offers.forEach(offer => { /* ... renderizar ofertas ... */ });
    } catch (error) {
        console.error('Error al cargar las ofertas:', error);
        offersList.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar las promociones. Inténtalo de nuevo más tarde.</p>';
    }
}

/**
 * Añade un producto al carrito.
 * @param {Event} event - El evento click del botón "Añadir".
 */
function addToCart(event) {
    const itemId = event.target.dataset.itemId;
    const itemName = event.target.dataset.itemName;
    const itemPrice = parseFloat(event.target.dataset.itemPrice);

    const existingItem = cart.find(item => item.id == itemId); // Usar == para comparar ID que puede ser string/number
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
    }
    updateCartUI();
    showMessage('Producto Añadido', `<p>${itemName} ha sido añadido al carrito.</p>`);
}

/**
 * Elimina un producto del carrito.
 * @param {string} itemId - El ID del producto a eliminar.
 */
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id != itemId); // Usar != para comparar ID
    updateCartUI();
}

/**
 * Actualiza la interfaz del carrito.
 */
function updateCartUI() {
    cartList.innerHTML = '';
    let total = 0;

    // Si no es un cliente, o no hay sesión, el carrito muestra un mensaje adecuado
    if (!currentUser || currentUser.role !== 'client') {
        cartList.innerHTML = '<li class="text-gray-400 py-2">Inicia sesión como cliente para gestionar tu carrito.</li>';
        cartTotal.textContent = '0.00';
        // No hay "Confirmar Pedido" si no está logueado como cliente
        placeOrderBtn.classList.add('hidden'); 
        return;
    }

    // Si es un cliente, pero el carrito está vacío
    if (cart.length === 0) {
        cartList.innerHTML = '<li class="text-gray-400 py-2">Tu carrito está vacío.</li>';
        placeOrderBtn.classList.add('hidden'); // Ocultar botón si el carrito está vacío
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
        placeOrderBtn.classList.remove('hidden'); // Mostrar botón si hay ítems en el carrito
    }
    cartTotal.textContent = total.toFixed(2);
    
    // Añadir listeners para botones de eliminar
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.target.closest('button').dataset.itemId;
            removeFromCart(itemId);
        };
    });
}

/**
 * Realiza un pedido y muestra un recibo.
 */
async function placeOrder() {
    if (cart.length === 0) {
        showMessage('Carrito Vacío', 'No puedes realizar un pedido con el carrito vacío.');
        return;
    }

    const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        name: item.name, // Incluir nombre para el recibo
        quantity: item.quantity,
        price_at_order: item.price // Guardar el precio al momento del pedido
    }));
    const orderTotal = parseFloat(cartTotal.textContent);

    try {
        // Llama a la API real para crear un pedido
        const response = await apiRequest('/orders/', 'POST', { items: orderItems, total: orderTotal }, true);
        
        // Generar el contenido del recibo con la respuesta real del backend
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
        cart = []; // Vaciar carrito
        updateCartUI();
    } catch (error) {
        showMessage('Error al Realizar Pedido', error.message || 'Hubo un problema al procesar tu pedido. Inténtalo de nuevo.');
    }
}

/**
 * Carga los pedidos en tiempo real para administradores y empleados.
 */
async function fetchOrders() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'employee')) {
        dashboardSection.classList.add('hidden');
        return;
    }
    dashboardSection.classList.remove('hidden');

    try {
        // Llama a la API real para obtener todos los pedidos
        const orders = await apiRequest('/orders/all', 'GET', null, true);
        
        ordersList.innerHTML = '';
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-center text-gray-400 col-span-full">No hay pedidos pendientes.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');
            // Envuelve todos los elementos en un solo div para evitar errores de JSX
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

        // Añadir listeners para acciones de pedido
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

/**
 * Actualiza el estado de un pedido.
 * @param {string} orderId - ID del pedido.
 * @param {string} status - Nuevo estado ('completed' o 'cancelled').
 */
async function updateOrderStatus(orderId, status) {
    try {
        // Llama a la API real para actualizar el estado del pedido
        await apiRequest(`/orders/${orderId}/status`, 'PUT', { status: status }, true);
        showMessage('Estado Actualizado', `<p>Pedido #${orderId} marcado como ${status}.</p>`);
        fetchOrders(); // Recargar pedidos para ver el cambio
    }
    catch (error) {
        showMessage('Error', `<p>No se pudo actualizar el estado del pedido #${orderId}.</p>`);
    }
}


// --- Event Listeners ---

// Abrir modal de login/registro
loginBtn.addEventListener('click', () => showModal(loginModal));

// Cerrar modales
closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        // Asegúrate de cerrar el modal correcto
        if (event.target.closest('#login-modal')) hideModal(loginModal);
        if (event.target.closest('#register-modal')) hideModal(registerModal);
        if (event.target.closest('#message-modal')) hideModal(messageModal);
    });
});

// Cambiar entre login y registro
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

// Enviar formularios
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    removeToken();
    currentUser = null;
    updateUI();
    showMessage('Sesión Cerrada', '<p>Has cerrado tu sesión exitosamente.</p>');
});

// Añadir al carrito
function addAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.removeEventListener('click', addToCart); // Evitar duplicados
        button.addEventListener('click', addToCart);
    });
}

// Confirmar pedido
placeOrderBtn.addEventListener('click', placeOrder);

// Navegar al dashboard
dashboardLink.addEventListener('click', (event) => {
    event.preventDefault();
    // Ocultar otras secciones si es necesario
    document.querySelectorAll('section').forEach(section => {
        // Solo ocultar si no es la sección del dashboard, hero, about, contact o gallery
        if (section.id !== 'dashboard' && section.id !== 'hero' && section.id !== 'about' && section.id !== 'contact' && section.id !== 'gallery' && section.id !== 'menu' && section.id !== 'order-section') {
            section.classList.add('hidden');
        }
    });
    dashboardSection.classList.remove('hidden');
    fetchOrders(); // Asegurarse de que los pedidos estén actualizados
});

// Botón "Explorar Menú" en la sección Hero
viewMenuBtn.addEventListener('click', () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
});

// Filtros de menú
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.dataset.category;
        displayMenuItems(allMenuItems, category);
    });
});

// Toggle mobile menu
hamburgerMenu.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    // Cambiar icono según el estado del menú
    const icon = hamburgerMenu.querySelector('i');
    if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times'); // Icono 'x'
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars'); // Icono de hamburguesa
    }
});

// Cerrar menú móvil cuando se hace clic en un enlace de navegación
mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        // Asegurarse de que el menú móvil se cierre y el icono cambie
        mainNav.classList.remove('active');
        hamburgerMenu.querySelector('i').classList.remove('fa-times');
        hamburgerMenu.querySelector('i').classList.add('fa-bars');
    });
});


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI(); // Cargar estado inicial de la UI
});
