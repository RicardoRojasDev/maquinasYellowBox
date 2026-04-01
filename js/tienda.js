const CATEGORY_LABELS = {
  mokador: "Mokador",
  leches: "Leches",
  capuchinos: "Capuchinos",
  chai: "Chai",
  chocolates: "Chocolates",
};

const CATEGORY_PRICING = {
  mokador: { base: 14990, step: 650 },
  leches: { base: 8990, step: 550 },
  capuchinos: { base: 10990, step: 480 },
  chai: { base: 9490, step: 420 },
  chocolates: { base: 9990, step: 390 },
};

const EMAIL_INTEGRATION = {
  backendEndpoint: window.YELLOWBOX_QUOTE_ENDPOINT || "http://localhost:3001/enviar-cotizacion",
  emailjs: {
    publicKey: "",
    serviceId: "",
    templateId: "",
  },
};

const CART_STORAGE_KEY = "yellowbox_quote_cart";
const MOBILE_BREAKPOINT = 1023;
const PRODUCT_SLIDE_INTERVAL_MS = 3000;
const PRODUCT_SLIDE_IDLE_MS = 5000;

const PRODUCTS = enrichProducts(window.YELLOWBOX_PRODUCTS || []);
const PRODUCT_INDEX = new Map(PRODUCTS.map((product) => [product.id, product]));
const PRODUCT_NAME_INDEX = new Map(PRODUCTS.map((product) => [product.name, product]));
const draftQuantities = new Map(PRODUCTS.map((product) => [product.id, 1]));
const productsScroller = {
  intervalId: null,
  paused: false,
  resumeTimer: null,
  listenersBound: false,
};

let cart = loadCart().map(normalizeCartItem).filter(Boolean);
let currentFilter = "all";
let expandedProductId = "";
let lastProductsPerPage = getProductsPerPage();
const elements = {};

window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.renderCart = renderCart;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initializeEmailProvider();
  bindEvents();
  syncStickyOffsets();
  syncMobileQuoteState();
  initializeProductsAutoScroll();
  renderProducts();
  renderCart();
});

function cacheElements() {
  elements.productsGrid = document.getElementById("productsGrid");
  elements.resultText = document.getElementById("catalogResultText");
  elements.cartItems = document.getElementById("cartItems");
  elements.cartEmptyState = document.getElementById("cartEmptyState");
  elements.cartTotal = document.getElementById("cartTotal");
  elements.cartItemsCount = document.getElementById("cartItemsCount");
  elements.heroProductCount = document.getElementById("heroProductCount");
  elements.heroCategoryCount = document.getElementById("heroCategoryCount");
  elements.heroCartCount = document.getElementById("heroCartCount");
  elements.mobileQuoteCount = document.getElementById("mobileQuoteCount");
  elements.quoteForm = document.getElementById("quoteForm");
  elements.quoteSubmit = document.getElementById("quoteSubmit");
  elements.quoteFeedback = document.getElementById("quoteFeedback");
  elements.quotePreview = document.getElementById("quotePreview");
  elements.quoteSummaryField = document.getElementById("quoteSummaryField");
  elements.quoteSidebar = document.getElementById("quoteSidebar");
  elements.quotePanel = document.getElementById("quotePanel");
  elements.quoteMobileTrigger = document.getElementById("quoteMobileTrigger");
  elements.quotePanelClose = document.getElementById("quotePanelClose");
  elements.toastStack = document.getElementById("toastStack");

  if (elements.heroCategoryCount) {
    elements.heroCategoryCount.textContent = Object.keys(CATEGORY_LABELS).length.toString();
  }
}

function bindEvents() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";
      document.querySelectorAll(".category-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderProducts();
    });
  });

  document.querySelector('.category-button[data-filter="all"]')?.classList.add("active");

  elements.productsGrid?.addEventListener("click", handleProductGridClick);
  elements.productsGrid?.addEventListener("keydown", handleProductGridKeydown);
  elements.cartItems?.addEventListener("click", handleCartClick);
  elements.quoteForm?.addEventListener("submit", handleQuoteSubmit);
  elements.quoteForm?.querySelectorAll("input, textarea")?.forEach((field) => {
    field.addEventListener("input", () => {
      field.setCustomValidity("");
      clearFeedback();
    });
  });
  elements.quoteMobileTrigger?.addEventListener("click", () => toggleQuotePanel());
  elements.quotePanelClose?.addEventListener("click", () => toggleQuotePanel(false));

  window.addEventListener("resize", () => {
    syncStickyOffsets();
    syncMobileQuoteState();
    handleViewportChange();
  });
}

function enrichProducts(seed) {
  const counters = {};

  return seed.map((product) => {
    const index = counters[product.category] || 0;
    counters[product.category] = index + 1;
    return {
      ...product,
      id: slugify(`${product.category}-${product.name}`),
      price: simulatePrice(product.category, index),
    };
  });
}

function simulatePrice(category, index) {
  const rule = CATEGORY_PRICING[category] || { base: 9990, step: 350 };
  return rule.base + rule.step * index;
}

function renderProducts(options = {}) {
  if (!elements.productsGrid) return;
  const shouldResetScroll = options.resetScroll !== false;
  const previousScrollLeft = elements.productsGrid.scrollLeft;

  const filtered =
    currentFilter === "all"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === currentFilter);

  const productsPerPage = getProductsPerPage();
  lastProductsPerPage = productsPerPage;
  const productPages = chunkProducts(filtered, productsPerPage);

  elements.productsGrid.innerHTML = productPages
    .map(
      (pageProducts, pageIndex) => `
      <section class="products-page" aria-label="Pagina de productos ${pageIndex + 1}">
        ${pageProducts.map(renderProductCard).join("")}
      </section>
    `,
    )
    .join("");

  elements.productsGrid.scrollTo({
    left: shouldResetScroll ? 0 : previousScrollLeft,
    behavior: "auto",
  });

  if (elements.resultText) {
    elements.resultText.textContent =
      currentFilter === "all"
        ? "Mostrando todos los productos disponibles."
        : `Mostrando ${filtered.length} productos en ${CATEGORY_LABELS[currentFilter] || "la categoria seleccionada"}.`;
  }

  if (elements.heroProductCount) {
    elements.heroProductCount.textContent = filtered.length.toString();
  }

  refreshProductsAutoSlide();
}

function handleProductGridClick(event) {
  const minusButton = event.target.closest("[data-product-qty-minus]");
  if (minusButton) {
    changeDraftQuantity(minusButton.dataset.productQtyMinus, -1);
    return;
  }

  const plusButton = event.target.closest("[data-product-qty-plus]");
  if (plusButton) {
    changeDraftQuantity(plusButton.dataset.productQtyPlus, 1);
    return;
  }

  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    const productId = addButton.dataset.addToCart;
    const quantity = getDraftQuantity(productId);
    const addedProduct = addToCartById(productId, quantity, Number(addButton.dataset.price));
    if (!addedProduct) return;

    const card = addButton.closest(".promotion-card");
    if (card) {
      card.classList.remove("is-added");
      void card.offsetWidth;
      card.classList.add("is-added");
    }

    addButton.classList.remove("is-added");
    void addButton.offsetWidth;
    addButton.classList.add("is-added");
    setTimeout(() => addButton.classList.remove("is-added"), 420);
    pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS);
    return;
  }

  const card = event.target.closest(".promotion-card");
  if (!card) return;

  toggleProductExpansion(card.dataset.productId);
  pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS);
}

function handleProductGridKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("[data-product-qty-minus], [data-product-qty-plus], [data-add-to-cart]")) {
    return;
  }

  const card = event.target.closest(".promotion-card");
  if (!card) return;

  event.preventDefault();
  toggleProductExpansion(card.dataset.productId);
  pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS);
}

function addToCart(nombre, precio, cantidad = 1) {
  const product = PRODUCT_NAME_INDEX.get(nombre);
  if (!product) return null;
  return addProductToCart(product, Number(cantidad), Number(precio) || product.price);
}

function addToCartById(productId, cantidad = 1, priceOverride) {
  const product = PRODUCT_INDEX.get(productId);
  if (!product) return null;
  return addProductToCart(product, Number(cantidad), Number(priceOverride) || product.price);
}

function addProductToCart(product, cantidad, priceOverride) {
  const quantityToAdd = normalizeQuantity(cantidad);
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity = normalizeQuantity(existingProduct.quantity + quantityToAdd);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: priceOverride || product.price,
      quantity: quantityToAdd,
      image: product.image,
      category: product.category,
    });
  }

  window.cart = cart;
  persistCart();
  renderCart();
  showToast("Producto agregado", `${product.name} agregado (x${quantityToAdd}) al carrito.`);
  pulseMobileQuoteTrigger();
  return product;
}

function removeFromCart(productIdentifier) {
  const previousLength = cart.length;
  cart = cart.filter(
    (item) => item.id !== productIdentifier && item.name !== productIdentifier,
  );
  if (cart.length === previousLength) return false;

  window.cart = cart;
  persistCart();
  renderCart();
  return true;
}

function updateQuantity(productIdentifier, value, mode = "delta") {
  const item = cart.find(
    (cartItem) =>
      cartItem.id === productIdentifier || cartItem.name === productIdentifier,
  );
  if (!item) return false;

  const numericValue = Number(value);
  const nextQuantity =
    mode === "set"
      ? normalizeQuantity(numericValue)
      : Math.max(0, Math.floor(item.quantity + numericValue));

  if (nextQuantity <= 0) {
    return removeFromCart(item.id);
  }

  item.quantity = normalizeQuantity(nextQuantity);
  persistCart();
  renderCart();
  return true;
}

function handleCartClick(event) {
  const minusButton = event.target.closest("[data-cart-qty-minus]");
  if (minusButton) {
    updateQuantity(minusButton.dataset.cartQtyMinus, -1, "delta");
    return;
  }

  const plusButton = event.target.closest("[data-cart-qty-plus]");
  if (plusButton) {
    updateQuantity(plusButton.dataset.cartQtyPlus, 1, "delta");
    return;
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (!removeButton) return;

  const removed = removeFromCart(removeButton.dataset.removeItem);
  if (removed) {
    showToast("Producto eliminado", "Producto retirado de la cotizacion.");
  }
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (elements.cartItems) {
    elements.cartItems.innerHTML = cart
      .map(
        (item) => `
      <article class="cart-item">
        <div class="cart-item__image"><img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" /></div>
        <div class="cart-item__content">
          <p class="cart-item__title">${escapeHtml(item.name)}</p>
          <div class="cart-item__prices">
            <span class="cart-item__unit">${formatCurrency(item.price)} c/u</span>
            <span class="cart-item__price">${formatCurrency(item.price * item.quantity)}</span>
          </div>
          <div class="cart-item__controls">
            <div class="qty-stepper qty-stepper--cart" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
              <button class="qty-stepper__btn" type="button" data-cart-qty-minus="${item.id}" aria-label="Restar ${escapeHtml(item.name)}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="qty-stepper__value">${item.quantity}</span>
              <button class="qty-stepper__btn" type="button" data-cart-qty-plus="${item.id}" aria-label="Sumar ${escapeHtml(item.name)}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <button class="cart-item__remove" type="button" data-remove-item="${item.id}" aria-label="Eliminar ${escapeHtml(item.name)}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </article>
    `,
      )
      .join("");
  }

  if (elements.cartItemsCount) {
    elements.cartItemsCount.textContent = totalItems.toString();
  }
  if (elements.heroCartCount) {
    elements.heroCartCount.textContent = totalItems.toString();
  }
  if (elements.mobileQuoteCount) {
    elements.mobileQuoteCount.textContent = totalItems.toString();
  }
  if (elements.cartTotal) {
    elements.cartTotal.textContent = formatCurrency(totalAmount);
  }

  if (elements.cartEmptyState) {
    elements.cartEmptyState.hidden = cart.length > 0;
  }

  if (elements.quoteSubmit) {
    elements.quoteSubmit.disabled = cart.length === 0;
  }

  if (elements.quoteSummaryField) {
    elements.quoteSummaryField.value = buildQuoteSummary();
  }

  if (elements.quotePreview) {
    elements.quotePreview.textContent =
      elements.quoteSummaryField?.value ||
      "El resumen de productos aparecera aqui antes de enviar.";
  }

  if (!isMobileViewport()) {
    elements.quoteSidebar?.classList.add("is-open");
    elements.quoteMobileTrigger?.setAttribute("aria-expanded", "true");
  }
}

async function handleQuoteSubmit(event) {
  event.preventDefault();
  clearFeedback();

  if (cart.length === 0) {
    showFeedback("Agrega al menos un producto antes de enviar la cotizacion.", "error");
    toggleQuotePanel(true);
    return;
  }

  if (!validateQuoteForm(event.currentTarget)) return;

  const payload = buildQuotePayload(new FormData(event.currentTarget));
  if (!payload) return;

  elements.quoteSubmit.disabled = true;
  elements.quoteSubmit.textContent = "Enviando cotizacion...";

  try {
    await deliverQuote(payload);
    showFeedback(
      "Solicitud enviada correctamente. Te responderemos a la brevedad.",
      "success",
    );
    showToast("Cotizacion enviada", "Tu solicitud fue enviada a soporte@smkvending.cl.");
    event.currentTarget.reset();
    cart = [];
    window.cart = cart;
    persistCart();
    renderCart();
    toggleQuotePanel(false);
  } catch (error) {
    showFeedback(
      error?.message ||
        "No fue posible enviar la cotizacion. Verifica la configuracion del servidor.",
      "error",
    );
  } finally {
    elements.quoteSubmit.disabled = cart.length === 0;
    elements.quoteSubmit.textContent = "Enviar cotizacion";
  }
}

function validateQuoteForm(form) {
  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const phoneInput = form.elements.phone;
  const messageInput = form.elements.message;

  nameInput.value = nameInput.value.trim();
  emailInput.value = emailInput.value.trim();
  phoneInput.value = phoneInput.value.trim();
  messageInput.value = messageInput.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+()\d\s-]{8,20}$/;

  if (!emailRegex.test(emailInput.value)) {
    emailInput.setCustomValidity("Ingresa un correo valido.");
  } else {
    emailInput.setCustomValidity("");
  }

  if (!phoneRegex.test(phoneInput.value)) {
    phoneInput.setCustomValidity("Ingresa un telefono valido.");
  } else {
    phoneInput.setCustomValidity("");
  }

  const isValid = form.reportValidity();
  if (!isValid) {
    showFeedback("Revisa los campos obligatorios antes de enviar.", "error");
    toggleQuotePanel(true);
  }

  return isValid;
}

function buildQuotePayload(formData) {
  const message = formData.get("message")?.toString().trim() || "";
  const summary = buildQuoteSummary();
  const total = getCartTotal();

  return {
    customer: {
      name: formData.get("name")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      phone: formData.get("phone")?.toString().trim() || "",
      message,
    },
    cart: cart.map((item) => ({ ...item })),
    total,
    summary,
    composedMessage: [
      message,
      "",
      "Resumen de productos solicitados:",
      summary,
      "",
      `Total referencial: ${formatCurrency(total)}`,
    ]
      .join("\n")
      .trim(),
    destinationEmail: "soporte@smkvending.cl",
    createdAt: new Date().toISOString(),
  };
}

function buildQuoteSummary() {
  return cart
    .map(
      (item) =>
        `- ${item.name} | Cantidad: ${item.quantity} | Subtotal: ${formatCurrency(item.price * item.quantity)}`,
    )
    .join("\n");
}

async function deliverQuote(payload) {
  if (EMAIL_INTEGRATION.backendEndpoint) {
    const response = await fetch(EMAIL_INTEGRATION.backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await safeJson(response);
    if (!response.ok) {
      throw new Error(result?.message || "No se pudo procesar el envio de la cotizacion.");
    }
    return result;
  }

  const hasEmailJsConfig = Boolean(
    EMAIL_INTEGRATION.emailjs.publicKey &&
      EMAIL_INTEGRATION.emailjs.serviceId &&
      EMAIL_INTEGRATION.emailjs.templateId &&
      window.emailjs,
  );

  if (hasEmailJsConfig) {
    return window.emailjs.send(
      EMAIL_INTEGRATION.emailjs.serviceId,
      EMAIL_INTEGRATION.emailjs.templateId,
      {
        customer_name: payload.customer.name,
        customer_email: payload.customer.email,
        customer_phone: payload.customer.phone,
        customer_message: payload.customer.message,
        quote_summary: payload.summary,
        quote_total: formatCurrency(payload.total),
        composed_message: payload.composedMessage,
        created_at: payload.createdAt,
      },
    );
  }

  throw new Error("No hay proveedor de envio configurado para la cotizacion.");
}

function initializeEmailProvider() {
  if (EMAIL_INTEGRATION.emailjs.publicKey && window.emailjs) {
    window.emailjs.init(EMAIL_INTEGRATION.emailjs.publicKey);
  }
}

function syncStickyOffsets() {
  const navbar = document.querySelector(".catalog-page .navbar");
  const filterBar = document.querySelector(".category-buttons-container");
  const scope = document.body;

  if (navbar && scope) {
    scope.style.setProperty("--catalog-navbar-height", `${navbar.offsetHeight}px`);
  }

  if (filterBar && scope) {
    scope.style.setProperty("--catalog-filter-height", `${filterBar.offsetHeight}px`);
  }
}

function syncMobileQuoteState() {
  if (!elements.quoteSidebar || !elements.quoteMobileTrigger) return;

  if (isMobileViewport()) {
    elements.quoteSidebar.classList.remove("is-open");
    elements.quoteMobileTrigger.setAttribute("aria-expanded", "false");
    return;
  }

  elements.quoteSidebar.classList.add("is-open");
  elements.quoteMobileTrigger.setAttribute("aria-expanded", "true");
}

function initializeProductsAutoScroll() {
  if (!elements.productsGrid || productsScroller.listenersBound) return;

  const pause = () => setProductsAutoScrollPaused(true);
  const resume = () => {
    if (isMobileViewport()) return;
    setProductsAutoScrollPaused(false);
  };

  elements.productsGrid.addEventListener("mouseenter", pause);
  elements.productsGrid.addEventListener("mouseleave", resume);
  elements.productsGrid.addEventListener("focusin", pause);
  elements.productsGrid.addEventListener("focusout", resume);
  elements.productsGrid.addEventListener("pointerdown", () => {
    pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS);
  });
  elements.productsGrid.addEventListener(
    "wheel",
    () => pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS),
    { passive: true },
  );
  elements.productsGrid.addEventListener(
    "touchstart",
    () => pauseProductsAutoSlideTemporarily(PRODUCT_SLIDE_IDLE_MS),
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      setProductsAutoScrollPaused(true);
    } else if (!isMobileViewport()) {
      setProductsAutoScrollPaused(false);
    }
  });

  productsScroller.listenersBound = true;
}

function refreshProductsAutoSlide() {
  if (!elements.productsGrid) return;

  const canScroll =
    !isMobileViewport() &&
    elements.productsGrid.scrollWidth > elements.productsGrid.clientWidth + 6;

  if (!canScroll) {
    stopProductsAutoSlide();
    return;
  }

  if (productsScroller.intervalId) return;
  productsScroller.intervalId = window.setInterval(() => {
    if (productsScroller.paused || document.hidden || isMobileViewport()) return;
    advanceProductsSlide();
  }, PRODUCT_SLIDE_INTERVAL_MS);
}

function advanceProductsSlide() {
  if (!elements.productsGrid) return;

  const pageWidth = elements.productsGrid.clientWidth;
  const maxScrollLeft = elements.productsGrid.scrollWidth - pageWidth;

  if (maxScrollLeft <= 8) return;

  const nextLeft = elements.productsGrid.scrollLeft + pageWidth;
  const targetLeft = nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft;

  elements.productsGrid.scrollTo({
    left: targetLeft,
    behavior: "smooth",
  });
}

function stopProductsAutoSlide() {
  if (productsScroller.intervalId) {
    clearInterval(productsScroller.intervalId);
    productsScroller.intervalId = null;
  }
  clearTimeout(productsScroller.resumeTimer);
}

function setProductsAutoScrollPaused(forcePause) {
  productsScroller.paused = forcePause;
}

function pauseProductsAutoSlideTemporarily(ms) {
  setProductsAutoScrollPaused(true);
  clearTimeout(productsScroller.resumeTimer);
  productsScroller.resumeTimer = setTimeout(() => {
    if (!isMobileViewport()) {
      setProductsAutoScrollPaused(false);
    }
  }, ms);
}

function handleViewportChange() {
  const nextProductsPerPage = getProductsPerPage();
  if (nextProductsPerPage !== lastProductsPerPage) {
    renderProducts();
    return;
  }

  refreshProductsAutoSlide();
}

function getProductsPerPage() {
  if (window.innerWidth <= 767) return 1;
  if (window.innerWidth <= MOBILE_BREAKPOINT) return 2;
  return 4;
}

function chunkProducts(products, size) {
  const chunks = [];

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size));
  }

  return chunks;
}

function renderProductCard(product) {
  const qty = getDraftQuantity(product.id);
  const isExpanded = expandedProductId === product.id;

  return `
    <article class="promotion-card ${isExpanded ? "is-expanded" : ""}" data-product-id="${product.id}" tabindex="0" role="button" aria-expanded="${isExpanded ? "true" : "false"}" aria-label="Ver detalles de ${escapeHtml(product.name)}">
      <div class="promotion-card__top">
        <div class="promotion-image">
          <img src="${product.image}" alt="${escapeHtml(product.alt)}" loading="lazy" />
        </div>
        <div class="promotion-content">
          <div class="promotion-info">
            <span class="promotion-meta">${CATEGORY_LABELS[product.category] || "Catalogo"}</span>
            <h3 class="promotion-title">${escapeHtml(product.name)}</h3>
            <p class="promotion-description">${escapeHtml(product.description)}</p>
          </div>
          <div class="product-footer">
            <div class="product-price">${formatCurrency(product.price)}<small>Precio referencial</small></div>
            <div class="product-actions">
              <div class="qty-stepper qty-stepper--card" role="group" aria-label="Cantidad de ${escapeHtml(product.name)}">
                <button class="qty-stepper__btn" type="button" data-product-qty-minus="${product.id}" aria-label="Restar cantidad de ${escapeHtml(product.name)}">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="qty-stepper__value" data-product-qty-value="${product.id}">${qty}</span>
                <button class="qty-stepper__btn" type="button" data-product-qty-plus="${product.id}" aria-label="Sumar cantidad de ${escapeHtml(product.name)}">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <button class="btn-add-to-cart" type="button" data-add-to-cart="${product.id}" data-price="${product.price}">
                <i class="fas fa-cart-plus"></i>
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="promotion-extra">
        <p class="promotion-details">${escapeHtml(product.details)}</p>
      </div>
    </article>
  `;
}

function toggleProductExpansion(productId) {
  expandedProductId = expandedProductId === productId ? "" : productId;
  renderProducts({ resetScroll: false });
}

function toggleQuotePanel(forceState) {
  if (!elements.quoteSidebar || !elements.quoteMobileTrigger) return;
  if (!isMobileViewport()) return;

  const shouldOpen =
    typeof forceState === "boolean"
      ? forceState
      : !elements.quoteSidebar.classList.contains("is-open");

  elements.quoteSidebar.classList.toggle("is-open", shouldOpen);
  elements.quoteMobileTrigger.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    window.setTimeout(() => {
      elements.quotePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
}

function pulseMobileQuoteTrigger() {
  if (!isMobileViewport() || !elements.quoteMobileTrigger) return;
  elements.quoteMobileTrigger.classList.remove("is-pulse");
  void elements.quoteMobileTrigger.offsetWidth;
  elements.quoteMobileTrigger.classList.add("is-pulse");
}

function changeDraftQuantity(productId, delta) {
  const current = getDraftQuantity(productId);
  const next = normalizeQuantity(current + Number(delta));
  draftQuantities.set(productId, next);

  document
    .querySelectorAll(`[data-product-qty-value="${productId}"]`)
    .forEach((node) => {
      node.textContent = String(next);
    });
}

function getDraftQuantity(productId) {
  return normalizeQuantity(draftQuantities.get(productId));
}

function normalizeQuantity(quantity) {
  const parsed = Math.floor(Number(quantity) || 1);
  return Math.min(99, Math.max(1, parsed));
}

function showFeedback(message, type) {
  if (!elements.quoteFeedback) return;
  elements.quoteFeedback.className = `quote-feedback is-visible ${type === "success" ? "is-success" : "is-error"}`;
  elements.quoteFeedback.textContent = message;
}

function clearFeedback() {
  if (!elements.quoteFeedback) return;
  elements.quoteFeedback.className = "quote-feedback";
  elements.quoteFeedback.textContent = "";
}

function showToast(title, message) {
  if (!elements.toastStack) return;

  const toast = document.createElement("article");
  toast.className = "toast-card";
  toast.innerHTML = `<div class="toast-card__icon"><i class="fas fa-check"></i></div><div><div class="toast-card__title">${escapeHtml(title)}</div><div class="toast-card__message">${escapeHtml(message)}</div></div>`;
  elements.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function loadCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function normalizeCartItem(rawItem) {
  if (!rawItem) return null;
  const ref =
    PRODUCT_INDEX.get(rawItem.id) ||
    PRODUCT_NAME_INDEX.get(rawItem.name) ||
    null;

  if (!ref) return null;

  return {
    id: ref.id,
    name: ref.name,
    price: Number(rawItem.price) > 0 ? Number(rawItem.price) : ref.price,
    quantity: normalizeQuantity(rawItem.quantity),
    image: ref.image,
    category: ref.category,
  };
}

function persistCart() {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function safeJson(response) {
  return response
    .json()
    .catch(() => ({}));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
