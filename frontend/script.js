// script.js
const API_BASE_URL = 'https://krono-coffee-backend.onrender.com/api/v1';

const messageModal = document.getElementById('message-modal');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const closeButtons = document.querySelectorAll('.close-button');

const menuItemsGrid = document.getElementById('menu-items-grid');
const menuFiltersContainer = document.getElementById('menu-filters');
const offersSection = document.getElementById('offers'); // Se mantiene oculta por defecto

const dashboardLink = document.getElementById('dashboard-link');
const dashboardSection = document.getElementById('dashboard');
const ordersList = document.getElementById('orders-list');
const viewMenuBtn = document.getElementById('view-menu-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNav = document.getElementById('main-nav');

const adminBtn = document.getElementById('admin-btn');
const adminPanel = document.getElementById('admin-panel');
const adminForm = document.getElementById('admin-form');
const adminFormMessage = document.getElementById('admin-form-message');
const adminCategorySelect = document.getElementById('categoria');

let currentUser = null; // Se mantiene para el rol de admin/employee
let allMenuItems = [];

function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.innerHTML = text;
    messageModal.classList.remove('hidden');
}

async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false, contentType = 'application/json') {
    const headers = {};
    if (contentType === 'application/json') {
        headers['Content-Type'] = 'application/json';
    } else if (contentType === 'application/x-www-form-urlencoded') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (requiresAuth) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showMessage('Error de Autenticación', 'No estás autorizado. Por favor, asegúrate de tener permisos de administrador/empleado.');
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
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            const err = data.detail || 'Ocurrió un error en la API.';
            showMessage('Error', err);
            throw new Error(err);
        }
        return data;
    } catch (e) {
        console.error('Error en la solicitud a la API:', e);
        showMessage('Error de Conexión', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
        throw e;
    }
}

async function updateUI() {
    const token = localStorage.getItem('access_token');
    const logoutBtnElement = document.getElementById('logout-btn'); // Obtener referencia aquí

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = { username: payload.sub, role: payload.role };
            
            offersSection.classList.add('hidden'); // Siempre oculta ahora

            if (currentUser.role === 'admin' || currentUser.role === 'employee') {
                dashboardLink.classList.remove('hidden');
                adminBtn.classList.remove('hidden');
                // fetchOrders(); // Se llama solo al hacer clic en el dashboard link
            } else {
                dashboardLink.classList.add('hidden');
                adminBtn.classList.add('hidden');
                adminPanel.classList.add('hidden'); // Asegurarse de que el panel de admin también se oculte
            }
            logoutBtnElement.classList.remove('hidden'); // Mostrar botón de cerrar sesión
        } catch (e) {
            console.error('Error al decodificar token o establecer currentUser:', e);
            localStorage.removeItem('access_token'); // Token inválido, lo borramos
            currentUser = null;
            logoutBtnElement.classList.add('hidden');
            dashboardLink.classList.add('hidden');
            adminBtn.classList.add('hidden');
            adminPanel.classList.add('hidden');
        }
    } else {
        currentUser = null;
        logoutBtnElement.classList.add('hidden');
        dashboardLink.classList.add('hidden');
        dashboardSection.classList.add('hidden');
        adminBtn.classList.add('hidden');
        adminPanel.classList.add('hidden');
    }
    await fetchMenu();
}

async function fetchMenu() {
    try {
        console.log('Intentando cargar el menú desde:', `${API_BASE_URL}/menu/menu`);
        const items = await apiRequest('/menu/menu');
        console.log('Menú cargado exitosamente:', items);
        allMenuItems = items;
        displayMenuItems(allMenuItems, 'all');
        populateCategoryFilters(allMenuItems);
        populateAdminCategorySelect(allMenuItems);
    } catch (e) {
        console.error('Error al cargar el menú en fetchMenu():', e);
        menuItemsGrid.innerHTML =
            '<p class="text-center text-red-500 col-span-full">Error al cargar el menú. Inténtalo de nuevo más tarde.</p>';
    }
}

function populateCategoryFilters(menuItems) {
    const categories = [...new Set(menuItems.map(item => item.category))].sort();
    
    menuFiltersContainer.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.classList.add('filter-btn', 'active');
    allButton.textContent = 'Todo';
    allButton.dataset.category = 'all';
    allButton.addEventListener('click', () => {
        document.querySelectorAll('#menu-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        displayMenuItems(allMenuItems, 'all');
    });
    menuFiltersContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('filter-btn');
        button.textContent = category.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        button.dataset.category = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('#menu-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayMenuItems(allMenuItems, category);
        });
        menuFiltersContainer.appendChild(button);
    });
}

function populateAdminCategorySelect(menuItems) {
    const categories = [...new Set(menuItems.map(item => item.category))].sort();
    
    while (adminCategorySelect.options.length > 1) {
        adminCategorySelect.remove(1);
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        adminCategorySelect.appendChild(option);
    });
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
            <img src="${item.image_url || 'https://placehold.co/300x200/3d2200/d4af37?text=No+Image'}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/FF0000/FFFFFF?text=Error+Imagen'; console.error('Error al cargar imagen:', '${item.image_url}');">
            <h4>${item.name}</h4>
            <p class="description">${item.description}</p>
            <span class="price">$${item.price.toFixed(2)}</span>
            <!-- Botón de Añadir al Carrito eliminado -->
        `;
        menuItemsGrid.appendChild(card);
    });
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
    } catch (e) {
        console.error('Error al cargar los pedidos:', e);
        ordersList.innerHTML =
            '<p class="text-center text-red-500 col-span-full">Error al cargar pedidos.</p>';
    }
}

async function updateOrderStatus(id, status) {
    try {
        await apiRequest(`/orders/${id}/status`, 'PUT', { status }, true);
        showMessage('Estado Actualizado', `<p>Pedido #${id} ${status}.</p>`);
        fetchOrders();
    } catch (e) {
        console.error('Error al actualizar estado del pedido:', e);
        showMessage('Error', `<p>No se pudo cambiar pedido ${id}.</p>`);
    }
}

// Event listener para cerrar el modal de mensaje
closeButtons.forEach(b => b.addEventListener('click', () => {
    messageModal.classList.add('hidden');
}));

// Event listener para el botón de cerrar sesión
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    currentUser = null;
    updateUI();
    showMessage('Sesión Cerrada','Has cerrado sesión.');
});

viewMenuBtn.addEventListener('click', () => document.getElementById('menu').scrollIntoView({behavior:'smooth'}));

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
            category: adminCategorySelect.value,
            image_url: document.getElementById('imagen').value,
            is_available: true
        };
        try {
            await apiRequest('/admin/menu', 'POST', payload, true);
            adminFormMessage.textContent = '✅ Producto agregado correctamente.';
            adminForm.reset();
            fetchMenu();
        } catch (e) {
            console.error('Error al agregar producto:', e);
            adminFormMessage.textContent = '❌ Error al agregar el producto.';
        }
    });
});
