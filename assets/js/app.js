/**
 * STRIDE MB - Enhanced Interactive E-Commerce Engine
 * Nike / Kith / GOAT Grade UX Features:
 * - Dynamic Global Cart State with Subtotal calculation & localStorage persistence
 * - Universal Cart Drawer & Mobile Hamburger Navigation on ALL pages
 * - Quick-Add Size Picker & Card Quick-Add
 * - Sticky Bottom Buy Bar on PDP Scroll
 * - Colorway Switcher & 5-Angle Viewer
 * - Toast Feedback & Free Shipping Calculator
 * - Interactive ⌘K Instant Search Modal
 * - Interactive Checkout Simulation Modal
 */

// Global State with LocalStorage
const CartState = {
  items: JSON.parse(localStorage.getItem('stridemb_cart') || 'null') || [
    {
      id: 'mb-990-pd',
      name: "Aura Runner 'Pacific Dune'",
      price: 240,
      size: "US 10.5",
      qty: 1,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 'mb-low-ep',
      name: "Coastal Low 'El Porto'",
      price: 210,
      size: "US 11.0",
      qty: 1,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80"
    }
  ],
  freeShippingThreshold: 300,

  save() {
    localStorage.setItem('stridemb_cart', JSON.stringify(this.items));
  },
  
  addItem(item) {
    const existing = this.items.find(i => i.id === item.id && i.size === item.size);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
    this.render();
    showToast(`Added ${item.name} (${item.size}) to Bag`);
  },

  updateQty(index, delta) {
    if (!this.items[index]) return;
    this.items[index].qty += delta;
    if (this.items[index].qty <= 0) {
      this.items.splice(index, 1);
    }
    this.save();
    this.render();
  },

  removeItem(index) {
    if (!this.items[index]) return;
    const removed = this.items.splice(index, 1)[0];
    this.save();
    this.render();
    showToast(`Removed ${removed.name} from Bag`);
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  render() {
    const count = this.getTotalCount();
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);

    const container = document.getElementById('cartItemsContainer');
    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="py-16 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <p class="text-xs text-zinc-400 font-mono">Your shopping bag is empty.</p>
            <a href="shop.html" class="inline-block text-xs font-heading font-bold text-[#FF5A36] hover:underline">Explore 84+ Pair Inventory &rarr;</a>
          </div>
        `;
      } else {
        container.innerHTML = this.items.map((item, idx) => `
          <div class="flex gap-4 p-3.5 bg-zinc-900/70 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-black">
            <div class="flex-1 min-w-0">
              <h4 class="font-heading font-bold text-sm text-white truncate">${item.name}</h4>
              <p class="text-[11px] text-zinc-400 font-mono mt-0.5">Size: ${item.size}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-2 bg-zinc-800/90 rounded-lg px-2.5 py-1 font-mono text-xs border border-white/5">
                  <button onclick="CartState.updateQty(${idx}, -1)" class="text-zinc-400 hover:text-white px-1 font-bold text-sm leading-none" aria-label="Decrease quantity">−</button>
                  <span class="text-white font-bold px-1">${item.qty}</span>
                  <button onclick="CartState.updateQty(${idx}, 1)" class="text-zinc-400 hover:text-white px-1 font-bold text-sm leading-none" aria-label="Increase quantity">+</button>
                </div>
                <div class="text-right">
                  <span class="font-mono font-bold text-sm text-white block">$${(item.price * item.qty).toFixed(2)}</span>
                  <button onclick="CartState.removeItem(${idx})" class="text-[10px] text-zinc-500 hover:text-red-400 font-mono transition-colors">Remove</button>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    const subtotal = this.getSubtotal();
    document.querySelectorAll('[data-cart-subtotal]').forEach(el => el.textContent = `$${subtotal.toFixed(2)}`);
    document.querySelectorAll('[data-cart-total]').forEach(el => el.textContent = `$${subtotal.toFixed(2)} USD`);

    const progressEl = document.getElementById('shippingProgressBar');
    const shippingStatusEl = document.getElementById('shippingStatusText');
    if (progressEl && shippingStatusEl) {
      const remaining = this.freeShippingThreshold - subtotal;
      if (remaining <= 0) {
        progressEl.style.width = '100%';
        progressEl.classList.add('bg-[#2EC4B6]');
        shippingStatusEl.innerHTML = '<span class="text-[#2EC4B6] font-bold">Free SoCal Courier Shipping Unlocked!</span>';
      } else {
        const pct = Math.min(100, Math.max(10, (subtotal / this.freeShippingThreshold) * 100));
        progressEl.style.width = `${pct}%`;
        shippingStatusEl.innerHTML = `Add <strong class="text-white">$${remaining.toFixed(2)}</strong> for Free Courier Delivery`;
      }
    }
  }
};

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="w-6 h-6 rounded-full bg-[#FF5A36] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
    <div class="text-xs font-mono text-white flex-1">${message}</div>
    <button onclick="openCartDrawer()" class="text-xs font-heading font-bold text-[#FF5A36] hover:underline ml-2 whitespace-nowrap">View Bag &rarr;</button>
  `;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Ensure Universal Elements (Cart Drawer, Mobile Nav, Search Modal)
function injectUniversalComponents() {
  // 1. Cart Drawer & Overlay
  if (!document.getElementById('cartDrawer')) {
    const cartHTML = `
      <div id="cartOverlay"></div>
      <aside id="cartDrawer">
        <div class="p-6 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="font-heading font-bold text-lg text-white">Your Bag</h3>
            <span class="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold" data-cart-count>2</span>
          </div>
          <button data-cart-close class="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="Close cart">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-4 bg-zinc-950/80 border-b border-white/5 text-xs">
          <div class="flex justify-between font-mono text-zinc-400 mb-1.5" id="shippingStatusText">
            <span>Free SoCal Courier Delivery</span>
            <span class="text-[#2EC4B6] font-bold">Unlocked!</span>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div id="shippingProgressBar" class="bg-[#2EC4B6] h-full w-full transition-all duration-300"></div>
          </div>
        </div>

        <div id="cartItemsContainer" class="flex-1 overflow-y-auto p-6 space-y-4"></div>

        <div class="p-6 border-t border-white/10 bg-zinc-950/90 space-y-4">
          <div class="space-y-1.5 text-sm font-mono">
            <div class="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span class="text-white font-bold" data-cart-subtotal>$0.00</span>
            </div>
            <div class="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
              <span>Total</span>
              <span class="text-[#FF5A36]" data-cart-total>$0.00 USD</span>
            </div>
          </div>
          <button onclick="triggerCheckout()" class="w-full btn-heat !py-3.5 text-sm">
            Proceed to Secure Checkout &rarr;
          </button>
          <p class="text-xs text-zinc-300 font-mono text-center font-medium">Encrypted 256-bit Checkout • Authenticity Guaranteed</p>
        </div>
      </aside>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);
  }

  // 2. Mobile Menu Drawer
  if (!document.getElementById('mobileMenuDrawer')) {
    const mobileMenuHTML = `
      <div id="mobileMenuOverlay" class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-opacity z-[9990]"></div>
      <aside id="mobileMenuDrawer" class="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-[#111114] border-r border-white/10 -translate-x-full transition-transform duration-300 z-[9991] flex flex-col justify-between p-6">
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-6 border-b border-white/10">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5A36] to-[#2EC4B6] p-[2px] flex items-center justify-center">
                <div class="w-full h-full bg-black rounded-[6px] flex items-center justify-center font-heading font-black text-sm text-white">S</div>
              </div>
              <span class="font-heading font-extrabold text-base tracking-tight text-white">STRIDE<span class="text-[#FF5A36]">.</span>MB</span>
            </div>
            <button id="closeMobileMenuBtn" class="text-zinc-400 hover:text-white p-1" aria-label="Close menu">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <nav class="space-y-4 text-base font-heading font-bold text-zinc-200">
            <a href="index.html" class="block py-2 hover:text-white transition-colors">Home</a>
            <a href="#shop" class="block py-2 hover:text-white transition-colors" data-anchor-close>Shop All (84+ Pairs)</a>
            <a href="#drops" class="block py-2 text-[#FF5A36] flex items-center justify-between" data-anchor-close>
              Live Drops Radar <span class="text-[10px] font-mono bg-[#FF5A36] text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
            </a>
            <a href="#lookbook" class="block py-2 hover:text-white transition-colors" data-anchor-close>Lookbook 2026</a>
            <a href="#about" class="block py-2 hover:text-white transition-colors" data-anchor-close>The Beach House</a>
            <a href="#contact" class="block py-2 hover:text-white transition-colors" data-anchor-close>VIP Concierge</a>
            <a href="admin" class="block py-2 text-xs font-mono text-amber-400 flex items-center justify-between border-t border-white/10 pt-3 mt-2 font-bold">
              ⚡ Boutique OS Admin <span class="bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Portal</span>
            </a>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10 space-y-3 font-mono text-xs text-zinc-400">
          <p>Manhattan Beach Flagship</p>
          <a href="contact.html" class="btn-primary !py-2.5 !px-4 text-xs block text-center">Book VIP Suite</a>
        </div>
      </aside>
    `;
    document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);
  }

  // Handle Clean URL Routing for Render deployment
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && window.location.hostname.includes('onrender.com')) {
      if (href === 'index.html' || href === '/index.html') {
        e.preventDefault();
        window.location.href = '/';
      } else if (href.endsWith('.html')) {
        e.preventDefault();
        const route = href.replace(/\.html$/, '');
        window.location.href = route.startsWith('/') ? route : '/' + route;
      }
    }
  });

  // 3. Search Modal
  if (!document.getElementById('searchModal')) {
    const searchModalHTML = `
      <div id="searchModal" class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-opacity z-[10005] flex items-start justify-center p-4 sm:p-12">
        <div class="w-full max-w-2xl bg-[#131316] border border-white/15 rounded-2xl shadow-2xl overflow-hidden mt-12 scale-95 transition-transform duration-200" id="searchBox">
          <div class="p-4 border-b border-white/10 flex items-center gap-3">
            <svg class="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input id="searchInput" type="text" placeholder="Search silhouettes, collabs, sizes (e.g. 'Pacific Dune', 'US 10.5')..." class="w-full bg-transparent text-white placeholder-zinc-500 font-mono text-sm focus:outline-none">
            <button id="closeSearchBtn" class="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800">ESC</button>
          </div>
          <div id="searchResults" class="p-4 max-h-80 overflow-y-auto space-y-2 text-sm">
            <div class="text-zinc-300 font-mono text-xs px-2 py-4 text-center font-medium">Type to search the entire STRIDE MB archive...</div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', searchModalHTML);
  }

  // Inject Mobile Hamburger Button into Header if not present
  document.querySelectorAll('header .max-w-7xl').forEach(headerRow => {
    if (!headerRow.querySelector('#mobileMenuToggleBtn')) {
      const btn = document.createElement('button');
      btn.id = 'mobileMenuToggleBtn';
      btn.className = 'md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none';
      btn.setAttribute('aria-label', 'Open navigation menu');
      btn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`;
      btn.addEventListener('click', openMobileMenu);
      
      const rightArea = headerRow.querySelector('.flex.items-center.gap-4') || headerRow.lastElementChild;
      if (rightArea) {
        rightArea.prepend(btn);
      }
    }
  });
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openMobileMenu() {
  const drawer = document.getElementById('mobileMenuDrawer');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (drawer && overlay) {
    drawer.style.transform = 'translateX(0)';
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobileMenuDrawer');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (drawer && overlay) {
    drawer.style.transform = 'translateX(-100%)';
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }
}

function triggerCheckout() {
  const total = CartState.getSubtotal();
  if (total === 0) {
    alert('Your shopping bag is empty. Select a pair to proceed.');
    return;
  }
  const modalHTML = `
    <div id="checkoutModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[10010] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-[#131316] border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#2EC4B6] p-[2px] mx-auto">
          <div class="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-white font-heading font-black text-2xl">✓</div>
        </div>
        <div>
          <span class="badge-mb">DEMO CHECKOUT</span>
          <h3 class="text-2xl font-heading font-extrabold text-white mt-2">Order Authenticated!</h3>
          <p class="text-xs text-zinc-400 font-mono mt-2">
            Total: $${total.toFixed(2)} USD • Free SoCal Courier Delivery Dispatched
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900 border border-white/10 text-left font-mono text-xs space-y-2">
          <div class="flex justify-between text-zinc-400">
            <span>Pairs in Batch:</span>
            <span class="text-white">${CartState.getTotalCount()}</span>
          </div>
          <div class="flex justify-between text-zinc-400">
            <span>Destination:</span>
            <span class="text-white">Manhattan Beach / SoCal</span>
          </div>
          <div class="flex justify-between text-[#2EC4B6] font-bold">
            <span>Courier Dispatch:</span>
            <span>Same-Day 90266</span>
          </div>
        </div>
        <button onclick="document.getElementById('checkoutModal').remove(); closeCartDrawer();" class="w-full btn-heat !py-3.5 text-xs font-bold">
          Close Demo & Return to Store
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Search Modal Setup
function initSearchModal() {
  const searchModal = document.getElementById('searchModal');
  const searchBox = document.getElementById('searchBox');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  if (!searchModal || !searchInput) return;

  const catalog = [
    { name: "Aura Runner 'Pacific Dune'", price: "$240", cat: "Collab / Runner", link: "product-detail.html", img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=120&q=80" },
    { name: "Coastal Low 'El Porto'", price: "$210", cat: "Collab / Low", link: "product-detail.html", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=120&q=80" },
    { name: "Midnight Strider 01", price: "$285", cat: "Obsidian / High Heat", link: "product-detail.html", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=120&q=80" },
    { name: "The Strand Vintage '88", price: "$450", cat: "Rare Grail / Collector", link: "product-detail.html", img: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=120&q=80" },
    { name: "Pier View Trainer 'Coast'", price: "$195", cat: "Pacific Wave / Trainer", link: "product-detail.html", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80" }
  ];

  function openSearch() {
    searchModal.classList.remove('opacity-0', 'pointer-events-none');
    searchModal.classList.add('opacity-100', 'pointer-events-auto');
    searchBox.classList.remove('scale-95');
    searchBox.classList.add('scale-100');
    searchInput.focus();
  }

  function closeSearch() {
    searchModal.classList.remove('opacity-100', 'pointer-events-auto');
    searchModal.classList.add('opacity-0', 'pointer-events-none');
    searchBox.classList.remove('scale-100');
    searchBox.classList.add('scale-95');
  }

  document.querySelectorAll('a[href="shop.html"]').forEach(el => {
    if (el.textContent.includes('SEARCH') || el.textContent.includes('⌘K')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
      closeCartDrawer();
      closeMobileMenu();
    }
  });

  closeSearchBtn?.addEventListener('click', closeSearch);
  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      searchResults.innerHTML = `<div class="text-zinc-300 font-mono text-xs px-2 py-4 text-center font-medium">Type to search the entire STRIDE MB archive...</div>`;
      return;
    }
    const matches = catalog.filter(item => item.name.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q));
    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="text-zinc-300 font-mono text-xs px-2 py-4 text-center font-medium">No pairs found matching "${q}".</div>`;
    } else {
      searchResults.innerHTML = matches.map(item => `
        <a href="${item.link}" class="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 transition-colors group">
          <div class="flex items-center gap-3">
            <img src="${item.img}" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <h4 class="font-heading font-bold text-white group-hover:text-[#FF5A36] transition-colors">${item.name}</h4>
              <span class="text-[10px] font-mono text-zinc-400">${item.cat}</span>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-white">${item.price}</span>
        </a>
      `).join('');
    }
  });
}

// Lifecycle Initialization
document.addEventListener('DOMContentLoaded', () => {
  injectUniversalComponents();
  CartState.render();
  initCartListeners();
  initCountdowns();
  initSizeSelectors();
  initFilters();
  initAccordion();
  initStickyBuyBar();
  initPDPInteractions();
  initSearchModal();

  // Wire mobile anchor clicks to close drawer
  document.querySelectorAll('[data-anchor-close]').forEach(el => {
    el.addEventListener('click', closeMobileMenu);
  });

  // Wire mobile menu close
  document.getElementById('closeMobileMenuBtn')?.addEventListener('click', closeMobileMenu);
  document.getElementById('mobileMenuOverlay')?.addEventListener('click', closeMobileMenu);
});

// Cart Drawer open/close listeners
function initCartListeners() {
  document.querySelectorAll('[data-cart-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  document.querySelectorAll('[data-cart-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCartDrawer();
    });
  });

  document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);
}

// Countdown Timers
function initCountdowns() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(targetDate.getHours() + 14);

  function update() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) return;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.querySelectorAll('.cd-days').forEach(el => el.textContent = String(days).padStart(2, '0'));
    document.querySelectorAll('.cd-hours').forEach(el => el.textContent = String(hours).padStart(2, '0'));
    document.querySelectorAll('.cd-minutes').forEach(el => el.textContent = String(minutes).padStart(2, '0'));
    document.querySelectorAll('.cd-seconds').forEach(el => el.textContent = String(seconds).padStart(2, '0'));
  }

  update();
  setInterval(update, 1000);
}

// Interactive Size Selector
function initSizeSelectors() {
  const sizePills = document.querySelectorAll('.size-pill:not(.sold-out)');
  const selectedDisplay = document.getElementById('selectedSizeDisplay');

  sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sizePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const sizeVal = pill.getAttribute('data-size') || pill.textContent.trim();
      if (selectedDisplay) selectedDisplay.textContent = sizeVal;
      
      const stickySelect = document.getElementById('stickySizeSelect');
      if (stickySelect) stickySelect.value = sizeVal;
    });
  });
}

// Nike/GOAT Style Sticky Bottom Buy Bar
function initStickyBuyBar() {
  const stickyBar = document.getElementById('stickyBuyBar');
  const mainBuyBtn = document.getElementById('mainBuyBtn');

  if (!stickyBar || !mainBuyBtn) return;

  window.addEventListener('scroll', () => {
    const rect = mainBuyBtn.getBoundingClientRect();
    if (rect.bottom < 0) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  });
}

// PDP Angle & Colorway Switcher
function initPDPInteractions() {
  const anglePills = document.querySelectorAll('[data-angle-img]');
  const mainImg = document.getElementById('mainProductImg');
  
  anglePills.forEach(pill => {
    pill.addEventListener('click', () => {
      anglePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const targetSrc = pill.getAttribute('data-angle-img');
      if (mainImg && targetSrc) mainImg.src = targetSrc;
    });
  });

  const colorwayThumbs = document.querySelectorAll('[data-colorway]');
  colorwayThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      colorwayThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const name = thumb.getAttribute('data-name');
      const img = thumb.getAttribute('data-img');
      const sku = thumb.getAttribute('data-sku');
      
      const titleEl = document.getElementById('productColorwayTitle');
      const skuEl = document.getElementById('productSkuDisplay');
      if (titleEl) titleEl.textContent = name;
      if (skuEl) skuEl.textContent = sku;
      if (mainImg && img) mainImg.src = img;
    });
  });
}

// Catalog filter tabs
function initFilters() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-white', 'text-black');
        b.classList.add('bg-zinc-900', 'text-zinc-400');
      });
      btn.classList.add('bg-white', 'text-black');
      btn.classList.remove('bg-zinc-900', 'text-zinc-400');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category').includes(filter)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Accordion (Specs, Shipping, Authenticity)
function initAccordion() {
  const headers = document.querySelectorAll('[data-accordion-header]');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      const isOpen = content.style.maxHeight;

      document.querySelectorAll('[data-accordion-content]').forEach(c => c.style.maxHeight = null);
      document.querySelectorAll('.accordion-icon').forEach(i => i.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}
