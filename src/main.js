import './style.css';

// ==========================================
// 1. PRODUCT DATABASE
// ==========================================
const PRODUCTS = [
  {
    id: "p1",
    name: "Terra Silt Vase",
    category: "vases",
    price: 120.00,
    imageUrl: "/clay_vase.png",
    tag: "Hand-thrown Vase"
  },
  {
    id: "p2",
    name: "Speckled Oatmeal Bowl",
    category: "tableware",
    price: 48.00,
    imageUrl: "/clay_bowl.png",
    tag: "Stoneware Bowl"
  },
  {
    id: "p3",
    name: "Oatmeal Tea Cup",
    category: "tableware",
    price: 38.00,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=500",
    tag: "Glazed Cup"
  },
  {
    id: "p4",
    name: "Silt Incense Dish",
    category: "incense",
    price: 42.00,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=500",
    tag: "Clay Holder"
  },
  {
    id: "p5",
    name: "Earth Serving Plate",
    category: "tableware",
    price: 68.00,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=500",
    tag: "Matte Plate"
  },
  {
    id: "p6",
    name: "Tall Ash Vase",
    category: "vases",
    price: 145.00,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=500",
    tag: "Tall Ceramic Vase"
  }
];

// ==========================================
// 2. STATE
// ==========================================
let state = {
  cart: [], // Array of { productId, quantity }
  activeFilter: 'all'
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Remove toast after 4s
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) reverse';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==========================================
// 3. CART OPERATIONS & RENDERING
// ==========================================
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartItemsList = document.getElementById('cart-drawer-items-list');
const cartEmptyState = document.getElementById('cart-empty-state');
const cartFooter = document.getElementById('cart-drawer-footer');
const cartSubtotalPrice = document.getElementById('cart-subtotal-price');

// Open / Close Cart Drawer
function toggleCart(isOpen) {
  if (isOpen) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock body scroll
  } else {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Unlock scroll
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

  showToast(`${product.name} added to bag.`, 'success');
  updateCartUI();
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

// Sync Drawer DOM
function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadgeCount.innerText = totalItems;

  if (state.cart.length === 0) {
    cartItemsList.innerHTML = '';
    cartItemsList.appendChild(cartEmptyState);
    cartFooter.style.display = 'none';
  } else {
    // Hide empty block, show footer
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

      // Bind quantity changes
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

  const filteredProducts = state.activeFilter === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === state.activeFilter);

  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${product.imageUrl}" alt="${product.name}" class="product-img">
        <div class="product-card-overlay">
          <button class="btn-quick-add" data-id="${product.id}">Quick Add</button>
        </div>
      </div>
      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <span class="product-tag">${product.tag}</span>
        </div>
        <span class="product-price">$${product.price.toFixed(2)}</span>
      </div>
    `;

    // Click whole card to open spotlight/drawer or detail (in this case, just quick add)
    card.querySelector('.btn-quick-add').addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid double action
      addToCart(product.id);
    });

    container.appendChild(card);
  });
}

// ==========================================
// 5. EVENT HANDLERS
// ==========================================
function initEvents() {
  // Navigation Links Active Style
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.backgroundColor = 'rgba(244, 240, 235, 0.98)';
      header.style.padding = '12px 0px';
    } else {
      header.style.backgroundColor = 'rgba(244, 240, 235, 0.85)';
      header.style.padding = '20px 0px';
    }
  });

  // Cart Drawer toggles
  document.getElementById('cart-toggle-btn')?.addEventListener('click', () => toggleCart(true));
  document.getElementById('cart-close-btn')?.addEventListener('click', () => toggleCart(false));
  cartOverlay?.addEventListener('click', () => toggleCart(false));
  document.getElementById('cart-empty-shop-btn')?.addEventListener('click', () => toggleCart(false));

  // Category filter tabs
  const tabs = document.querySelectorAll('#shop-tabs-container .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      state.activeFilter = e.target.getAttribute('data-filter');
      renderProductGrid();
    });
  });

  // Spotlight product buy button
  document.getElementById('spotlight-add-btn')?.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-id');
    addToCart(id);
  });

  // Newsletter Form Submit
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('.newsletter-input');
    showToast(`Thank you! Subscription confirmed for ${input.value}.`, 'success');
    input.value = '';
  });

  // Checkout submit
  document.getElementById('checkout-submit-btn')?.addEventListener('click', () => {
    showToast("Checkout completed! Thank you for ordering from CLAY. 🏺", "success");
    state.cart = [];
    updateCartUI();
    toggleCart(false);
  });

  // Search mock
  document.getElementById('search-toggle-btn')?.addEventListener('click', () => {
    showToast("Our search index is currently offline. Please explore our curated collections!", "info");
  });
}

// ==========================================
// 6. INITIALIZATION
// ==========================================
function init() {
  initEvents();
  renderProductGrid();
  updateCartUI();
}

// Run immediately or on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
