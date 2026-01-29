const CART_KEY = 'fenty_cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const i = cart.findIndex(x => x.productId === productId);
  if (i >= 0) cart[i].quantity += qty;
  else cart.push({ productId, quantity: qty });
  setCart(cart);
}

function removeFromCart(productId) {
  setCart(getCart().filter(x => x.productId !== productId));
}

function setQuantity(productId, qty) {
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart();
  const i = cart.findIndex(x => x.productId === productId);
  if (i >= 0) {
    cart[i].quantity = qty;
    setCart(cart);
  }
}

function getCartCount() {
  return getCart().reduce((s, x) => s + (x.quantity || 0), 0);
}

function updateCartBadge() {
  const n = getCartCount();
  const link = document.querySelector('.cart-link');
  if (!link) return;
  let badge = link.querySelector('.cart-badge');
  if (n > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      link.appendChild(badge);
    }
    badge.textContent = n;
  } else if (badge) {
    badge.remove();
  }
}

function addToCartUi(productId, btn) {
  if (!productId) return;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Adding...';
  }
  addToCart(productId, 1);
  if (btn) {
    btn.textContent = 'Added!';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'ADD TO BAG';
    }, 800);
  }
}

function renderProductCard(p, linkPrefix = 'product.html?id=') {
  const out = p.inStock === false;
  return `
    <div class="product-card-scroll">
      <a href="${linkPrefix}${p.id}" class="product-card-link">
        <div class="product-image">
          <img src="${p.image}" alt="${escapeHtml(p.name)}">
          <div class="add-to-cart-overlay">
            <button class="add-to-cart-btn" data-product-id="${p.id}" type="button">ADD TO BAG</button>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${escapeHtml(p.name)}</h3>
          <p class="product-category">${escapeHtml(p.category)}</p>
          <div class="product-rating">${[1,2,3,4,5].map(() => '<svg class="star-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>').join('')}</div>
          <p class="product-price">$${Number(p.price).toFixed(2)}</p>
          ${out ? '<p class="product-out-of-stock">Out of Stock</p>' : ''}
        </div>
      </a>
    </div>`;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
});

document.addEventListener('click', function(e) {
  var btn = (e.target && typeof e.target.closest === 'function') ? e.target.closest('.add-to-cart-btn') : null;
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  addToCartUi(btn.getAttribute('data-product-id'), btn);
});
