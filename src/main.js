import './style.css';

// ==========================================
// 1. PRODUCT DATABASE
// ==========================================
const PRODUCTS = [
  {
    id: "p1",
    name: "Organic Salmon Dog Treats",
    category: "food",
    petType: "dog",
    price: 18.99,
    imageUrl: "/pet_treats.png",
    tag: "Dogs",
    rating: 5
  },
  {
    id: "p2",
    name: "Orthopedic Memory Foam Bed",
    category: "beds",
    petType: "dog", // also cat
    price: 64.99,
    imageUrl: "/pet_bed.png",
    tag: "Dogs & Cats",
    rating: 5
  },
  {
    id: "p3",
    name: "Interactive Smart Laser Toy",
    category: "toys",
    petType: "cat",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=400",
    tag: "Cats",
    rating: 4
  },
  {
    id: "p4",
    name: "Self-Cleaning Water Fountain",
    category: "accessories",
    petType: "cat", // also dog
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400",
    tag: "Dogs & Cats",
    rating: 5
  },
  {
    id: "p5",
    name: "Eco-Friendly Hemp Collar",
    category: "accessories",
    petType: "dog",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400",
    tag: "Dogs",
    rating: 4
  },
  {
    id: "p6",
    name: "Feather Cat Teaser Toy",
    category: "toys",
    petType: "cat",
    price: 8.49,
    imageUrl: "https://images.unsplash.com/photo-1513360309081-36f5e878fc9e?auto=format&fit=crop&q=80&w=400",
    tag: "Cats",
    rating: 5
  },
  {
    id: "p7",
    name: "Premium Bird Seed Mix",
    category: "food",
    petType: "bird",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=400",
    tag: "Birds",
    rating: 4
  },
  {
    id: "p8",
    name: "Small Animal Hay feeder",
    category: "accessories",
    petType: "small",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1544790103-0870d5072545?auto=format&fit=crop&q=80&w=400",
    tag: "Hamsters & Rabbits",
    rating: 5
  }
];

// ==========================================
// 2. STATE
// ==========================================
let state = {
  cart: [], // Array of { productId, quantity }
  activeFilter: 'all',
  petTypeFilter: null
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-paw"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Remove toast after 4s
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==========================================
// 3. CART OPERATIONS
// ==========================================
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartItemsList = document.getElementById('cart-drawer-items-list');
const cartEmptyState = document.getElementById('cart-empty-state');
const cartFooter = document.getElementById('cart-drawer-footer');
const cartSubtotalPrice = document.getElementById('cart-subtotal-price');

// Open / Close Drawer
function toggleCart(isOpen) {
  if (isOpen) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Add Item
function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = state.cart.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    state.cart[existingItemIndex].quantity += qty;
  } else {
    state.cart.push({ productId, quantity: qty });
  }

  showToast(`${product.name} added to your cart! 🐾`, 'success');
  updateCartUI();
  toggleCart(true); // Auto-open cart to show update
}

// Remove Item
function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  updateCartUI();
}

// Update Qty
function updateQty(productId, delta) {
  const itemIndex = state.cart.findIndex(item => item.productId === productId);
  if (itemIndex > -1) {
    state.cart[itemIndex].quantity += delta;
    if (state.cart[itemIndex].quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
    }
  }
}

// Sync UI Drawer
function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadgeCount.innerText = totalItems;

  if (state.cart.length === 0) {
    cartItemsList.innerHTML = '';
    cartItemsList.appendChild(cartEmptyState);
    cartFooter.style.display = 'none';
  } else {
    if (cartEmptyState.parentNode === cartItemsList) {
      cartEmptyState.remove();
    }
    cartFooter.style.display = 'block';

    let subtotal = 0;
    cartItemsList.innerHTML = '';

    state.cart.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name-row">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-price">$${product.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-control-row">
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="minus" data-id="${product.id}">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" data-action="plus" data-id="${product.id}">+</button>
            </div>
            <button class="cart-item-remove" data-action="remove" data-id="${product.id}">Remove</button>
          </div>
        </div>
      `;

      itemEl.querySelector('[data-action="minus"]').addEventListener('click', () => updateQty(product.id, -1));
      itemEl.querySelector('[data-action="plus"]').addEventListener('click', () => updateQty(product.id, 1));
      itemEl.querySelector('[data-action="remove"]').addEventListener('click', () => removeFromCart(product.id));

      cartItemsList.appendChild(itemEl);
    });

    cartSubtotalPrice.innerText = `$${subtotal.toFixed(2)}`;
  }
}

// ==========================================
// 4. PRODUCT CATALOG RENDERING
// ==========================================
function renderProductGrid() {
  const container = document.getElementById('product-grid-container');
  if (!container) return;

  container.innerHTML = '';

  // Apply filters
  let filteredProducts = PRODUCTS;

  // 1. Filter by category tabs
  if (state.activeFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === state.activeFilter);
  }

  // 2. Filter by quick pet type circles
  if (state.petTypeFilter) {
    filteredProducts = filteredProducts.filter(p => p.petType === state.petTypeFilter);
  }

  if (filteredProducts.length === 0) {
    container.innerHTML = '<div style="grid-column: span 4; text-align: center; padding: 40px; color: var(--text-muted);">No products found matching these categories.</div>';
    return;
  }

  filteredProducts.forEach(product => {
    // Generate star icons
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      starsHtml += i < product.rating 
        ? '<i class="fa-solid fa-star"></i>' 
        : '<i class="fa-regular fa-star"></i>';
    }

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${product.imageUrl}" alt="${product.name}" class="product-img" loading="lazy">
      </div>
      <div class="product-tag">${product.tag}</div>
      <div class="rating-stars">${starsHtml}</div>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-footer">
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <button class="btn-add-cart" data-id="${product.id}"><i class="fa-solid fa-plus"></i></button>
      </div>
    `;

    card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    container.appendChild(card);
  });
}

// ==========================================
// 5. BOOKING MODAL OPERATIONS
// ==========================================
const bookingModal = document.getElementById('booking-modal');
const bookingForm = document.getElementById('booking-form');

function toggleBookingModal(isOpen, preSelectedService = '') {
  if (isOpen) {
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Populate service dropdown if passed
    if (preSelectedService) {
      document.getElementById('book-service').value = preSelectedService;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('book-date').min = today;
  } else {
    bookingModal.classList.remove('open');
    document.body.style.overflow = '';
    bookingForm.reset();
  }
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
function initEvents() {
  // Navigation scroll behavior
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.backgroundColor = 'rgba(250, 248, 245, 0.98)';
      header.style.boxShadow = 'var(--shadow-sm)';
    } else {
      header.style.backgroundColor = 'rgba(250, 248, 245, 0.85)';
      header.style.boxShadow = 'none';
    }
  });

  // Drawer toggles
  document.getElementById('cart-toggle-btn')?.addEventListener('click', () => toggleCart(true));
  document.getElementById('cart-close-btn')?.addEventListener('click', () => toggleCart(false));
  cartOverlay?.addEventListener('click', () => toggleCart(false));
  document.getElementById('cart-empty-shop-btn')?.addEventListener('click', () => toggleCart(false));

  // Category filters tabs
  const tabs = document.querySelectorAll('#shop-tabs-container .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      state.activeFilter = e.target.getAttribute('data-filter');
      renderProductGrid();
    });
  });

  // Quick category circles (scroll & filter)
  const catCircles = document.querySelectorAll('.category-item');
  catCircles.forEach(circle => {
    circle.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-filter-cat');
      
      // Toggle filter: if same filter is clicked twice, reset
      if (state.petTypeFilter === type) {
        state.petTypeFilter = null;
        e.currentTarget.classList.remove('active-cat');
      } else {
        catCircles.forEach(c => c.classList.remove('active-cat'));
        state.petTypeFilter = type;
        e.currentTarget.classList.add('active-cat');
      }

      renderProductGrid();

      // Scroll to shop
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Booking Modal open triggers
  document.getElementById('nav-book-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleBookingModal(true);
  });
  document.getElementById('hero-book-btn')?.addEventListener('click', () => toggleBookingModal(true));
  document.getElementById('booking-close-btn')?.addEventListener('click', () => toggleBookingModal(false));

  // Service Card Booking triggers
  document.querySelectorAll('.btn-book-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = e.target.getAttribute('data-service-select');
      toggleBookingModal(true, service);
    });
  });

  // Footer Booking triggers
  document.querySelectorAll('.open-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBookingModal(true);
    });
  });

  // Modal overlay click close
  bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      toggleBookingModal(false);
    }
  });

  // Booking Form Submit
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const serviceName = document.getElementById('book-service').options[document.getElementById('book-service').selectedIndex].text;
    const petName = document.getElementById('book-pet-name').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;

    showToast(`Appointment confirmed! We're excited to see ${petName} for "${serviceName}" on ${date} at ${time}! 🐶✨`, 'success');
    toggleBookingModal(false);
  });

  // Newsletter Form Submit
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('.newsletter-input');
    showToast(`Welcome to the pack! 🐾 10% off code sent to: ${input.value}`, 'success');
    input.value = '';
  });

  // Checkout order submit
  document.getElementById('checkout-submit-btn')?.addEventListener('click', () => {
    showToast("Pawsome! Order submitted. Thank you for supporting our shop & local shelters! 🐾💖", "success");
    state.cart = [];
    updateCartUI();
    toggleCart(false);
  });

  // Search input mock
  document.getElementById('search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      showToast("Searching for treats...", "info");
    }
  });
}

// ==========================================
// 7. INITIALIZATION
// ==========================================
function init() {
  initEvents();
  renderProductGrid();
  updateCartUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
