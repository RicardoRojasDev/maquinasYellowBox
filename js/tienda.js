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
  backendEndpoint:
    window.YELLOWBOX_QUOTE_ENDPOINT || "http://localhost:3001/enviar-cotizacion",
  emailjs: {
    publicKey: "",
    serviceId: "",
    templateId: "",
  },
};

const CART_STORAGE_KEY = "yellowbox_quote_cart";
const MOBILE_BREAKPOINT = 1023;
const ROW_COUNT = 2;
const DESKTOP_CARDS_PER_ROW = 3;
const MOBILE_CARDS_PER_ROW = 2;
const RAIL_REPEAT_COUNT = 3;
const AUTO_SCROLL_PAUSE_MS = 3200;
const AUTO_SCROLL_SPEEDS = [28, 22];
const DRAG_THRESHOLD_PX = 6;
const SNAP_THRESHOLD_PX = 18;
const CLICK_SUPPRESSION_MS = 240;

const PRODUCTS = enrichProducts(window.YELLOWBOX_PRODUCTS || []);
const PRODUCT_INDEX = new Map(PRODUCTS.map((product) => [product.id, product]));
const PRODUCT_NAME_INDEX = new Map(PRODUCTS.map((product) => [product.name, product]));
const draftQuantities = new Map(PRODUCTS.map((product) => [product.id, 1]));
const railControllers = [];
const elements = {};

const catalogState = {
  currentFilter: "all",
  shuffledPool: [],
  poolKey: "",
  activeModalProductId: "",
  suppressClickUntil: 0,
  resizeTimer: 0,
};

let cart = loadCart().map(normalizeCartItem).filter(Boolean);

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
  ensureShuffledPool(true);
  renderProducts({ preservePool: true });
  renderCart();
});

function cacheElements() {
  elements.productsGrid = document.getElementById("productsGrid");
  elements.catalogEmptyState = document.getElementById("catalogEmptyState");
  elements.resultText = document.getElementById("catalogResultText");
  elements.heroProductCount = document.getElementById("heroProductCount");
  elements.heroCategoryCount = document.getElementById("heroCategoryCount");
  elements.heroCartCount = document.getElementById("heroCartCount");
  elements.cartItems = document.getElementById("cartItems");
  elements.cartEmptyState = document.getElementById("cartEmptyState");
  elements.cartTotal = document.getElementById("cartTotal");
  elements.cartItemsCount = document.getElementById("cartItemsCount");
  elements.mobileQuoteCount = document.getElementById("mobileQuoteCount");
  elements.quoteForm = document.getElementById("quoteForm");
  elements.quoteSubmit = document.getElementById("quoteSubmit");
  elements.quoteFeedback = document.getElementById("quoteFeedback");
  elements.quoteSummaryField = document.getElementById("quoteSummaryField");
  elements.quoteSidebar = document.getElementById("quoteSidebar");
  elements.quotePanel = document.getElementById("quotePanel");
  elements.quoteMobileTrigger = document.getElementById("quoteMobileTrigger");
  elements.quotePanelClose = document.getElementById("quotePanelClose");
  elements.quoteSidebarBackdrop = document.getElementById("quoteSidebarBackdrop");
  elements.toastStack = document.getElementById("toastStack");
  elements.productModal = document.getElementById("productModal");
  elements.productModalBackdrop = document.getElementById("productModalBackdrop");
  elements.productModalClose = document.getElementById("productModalClose");
  elements.productModalImage = document.getElementById("productModalImage");
  elements.productModalCategory = document.getElementById("productModalCategory");
  elements.productModalTitle = document.getElementById("productModalTitle");
  elements.productModalDescription = document.getElementById("productModalDescription");
  elements.productModalDetails = document.getElementById("productModalDetails");
  elements.productModalPrice = document.getElementById("productModalPrice");
  elements.productModalQty = document.getElementById("productModalQty");
  elements.productModalQtyMinus = document.getElementById("productModalQtyMinus");
  elements.productModalQtyPlus = document.getElementById("productModalQtyPlus");
  elements.productModalAdd = document.getElementById("productModalAdd");

  if (elements.heroCategoryCount) {
    elements.heroCategoryCount.textContent = String(
      Object.keys(CATEGORY_LABELS).length,
    );
  }
}

function bindEvents() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", () => {
      if ((button.dataset.filter || "all") === catalogState.currentFilter) return;

      catalogState.currentFilter = button.dataset.filter || "all";
      document.querySelectorAll(".category-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      clearFeedback();
      ensureShuffledPool(true);
      closeProductModal();
      renderProducts({ preservePool: true });
    });
  });

  document.querySelector('.category-button[data-filter="all"]')?.classList.add("active");

  elements.productsGrid?.addEventListener("click", handleCatalogClick);
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
  elements.quoteSidebarBackdrop?.addEventListener("click", () => toggleQuotePanel(false));
  elements.productModalBackdrop?.addEventListener("click", closeProductModal);
  elements.productModalClose?.addEventListener("click", closeProductModal);
  elements.productModalQtyMinus?.addEventListener("click", () =>
    changeActiveModalQuantity(-1),
  );
  elements.productModalQtyPlus?.addEventListener("click", () =>
    changeActiveModalQuantity(1),
  );
  elements.productModalAdd?.addEventListener("click", addActiveModalProductToCart);

  document.addEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", handleResize);
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

function handleResize() {
  window.clearTimeout(catalogState.resizeTimer);
  catalogState.resizeTimer = window.setTimeout(() => {
    syncStickyOffsets();
    syncMobileQuoteState();
    renderProducts({ preservePool: true });
    renderCart();
  }, 120);
}

function handleGlobalKeydown(event) {
  if (event.key !== "Escape") return;

  if (elements.productModal?.classList.contains("is-open")) {
    closeProductModal();
    return;
  }

  if (isMobileViewport() && elements.quoteSidebar?.classList.contains("is-open")) {
    toggleQuotePanel(false);
  }
}

function handleVisibilityChange() {
  railControllers.forEach((controller) => {
    controller.lastFrame = 0;
  });
}

function getFilteredProducts() {
  if (catalogState.currentFilter === "all") return PRODUCTS;

  return PRODUCTS.filter((product) => product.category === catalogState.currentFilter);
}

function ensureShuffledPool(forceShuffle = false) {
  const filtered = getFilteredProducts();
  const nextKey = filtered.map((product) => product.id).join("|");

  if (forceShuffle || catalogState.poolKey !== nextKey) {
    catalogState.poolKey = nextKey;
    catalogState.shuffledPool = shuffleArray([...filtered]);
  }

  return catalogState.shuffledPool;
}

function renderProducts(options = {}) {
  if (!elements.productsGrid) return;

  const preservePool = options.preservePool === true;
  const filtered = getFilteredProducts();
  const pool = ensureShuffledPool(!preservePool);
  const rows = buildCatalogRows(pool);
  const hasProducts = filtered.length > 0;

  destroyRailControllers();

  if (!hasProducts) {
    elements.productsGrid.innerHTML = "";
    elements.catalogEmptyState.hidden = false;
    updateCatalogSummary(filtered.length);
    return;
  }

  elements.catalogEmptyState.hidden = true;
  elements.productsGrid.innerHTML = rows
    .filter((row) => row.length)
    .map((rowProducts, rowIndex) => renderProductRow(rowProducts, rowIndex))
    .join("");

  updateCatalogSummary(filtered.length);

  if (
    catalogState.activeModalProductId &&
    !filtered.some((product) => product.id === catalogState.activeModalProductId)
  ) {
    closeProductModal();
  }

  window.requestAnimationFrame(() => {
    initializeRails();
    syncStickyOffsets();
    syncProductModalQuantity();
  });
}

function updateCatalogSummary(filteredCount) {
  if (elements.heroProductCount) {
    elements.heroProductCount.textContent = String(filteredCount);
  }

  if (elements.heroCategoryCount) {
    elements.heroCategoryCount.textContent = String(
      catalogState.currentFilter === "all" ? Object.keys(CATEGORY_LABELS).length : 1,
    );
  }

  if (elements.resultText) {
    if (catalogState.currentFilter === "all") {
      elements.resultText.textContent = `${filteredCount} productos distribuidos en dos sliders infinitos para cotizar sin salir de la vista.`;
    } else {
      elements.resultText.textContent = `${filteredCount} productos en ${CATEGORY_LABELS[catalogState.currentFilter] || "la categoria seleccionada"}, repartidos entre dos filas independientes.`;
    }
  }
}

function buildCatalogRows(products) {
  const rows = Array.from({ length: ROW_COUNT }, () => []);

  products.forEach((product, index) => {
    rows[index % ROW_COUNT].push(product);
  });

  if (!rows[1].length && rows[0].length > 1) {
    rows[1] = rows[0].splice(Math.ceil(rows[0].length / 2));
  }

  return rows;
}

function renderProductRow(products, rowIndex) {
  const visibleCards = Math.max(1, Math.min(getCardsPerRow(), products.length));
  const repeatedProducts = buildLoopedProducts(products);
  const rowTitle =
    rowIndex === 0 ? "Descubre productos destacados" : "Sigue armando tu mix";
  const rowText =
    rowIndex === 0
      ? "Movimiento continuo para explorar rapido y sumar al carrito."
      : "Otra fila independiente para evitar repeticiones visibles.";

  return `
    <section class="product-row" style="--visible-cards: ${visibleCards}" data-row-index="${rowIndex}">

      <div class="product-row__viewport" data-rail-viewport data-row-index="${rowIndex}">
        <div class="product-row__track" data-rail-track data-base-count="${products.length}">
          ${repeatedProducts.map((product) => renderProductCard(product)).join("")}
        </div>
      </div>
    </section>
  `;
}

function buildLoopedProducts(products) {
  if (products.length <= 1) return products;

  const repeated = [];
  for (let copyIndex = 0; copyIndex < RAIL_REPEAT_COUNT; copyIndex += 1) {
    repeated.push(...products);
  }
  return repeated;
}

function renderProductCard(product) {
  const qty = getDraftQuantity(product.id);

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__media">
        <img src="${product.image}" alt="${escapeHtml(product.alt)}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <div class="product-card__topline">
          <span class="product-card__badge">${CATEGORY_LABELS[product.category] || "Catalogo"}</span>
          <button class="product-card__detail" type="button" data-open-detail="${product.id}" aria-label="Ver detalle de ${escapeHtml(product.name)}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="product-card__copy">
          <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
          <p class="product-card__description">${escapeHtml(product.description)}</p>
          <p class="product-card__details">${escapeHtml(product.details)}</p>
        </div>
        <div class="product-card__footer">
          <div class="product-card__price">
            <span>Precio referencial</span>
            <strong>${formatCurrency(product.price)}</strong>
          </div>
          <div class="product-card__actions">
            <div class="qty-stepper" role="group" aria-label="Cantidad de ${escapeHtml(product.name)}">
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
    </article>
  `;
}

function initializeRails() {
  if (!elements.productsGrid) return;

  elements.productsGrid.querySelectorAll("[data-rail-viewport]").forEach((viewport, index) => {
    railControllers.push(createRailController(viewport, index));
  });
}

function createRailController(viewport, rowIndex) {
  const track = viewport.querySelector("[data-rail-track]");
  const controller = {
    viewport,
    track,
    rowIndex,
    baseCount: Number(track?.dataset.baseCount) || 0,
    speed: AUTO_SCROLL_SPEEDS[rowIndex % AUTO_SCROLL_SPEEDS.length],
    baseWidth: 0,
    cardSpan: 0,
    canLoop: false,
    canAnimate: false,
    paused: false,
    resumeTimer: 0,
    rafId: 0,
    lastFrame: 0,
    activePointerId: null,
    startX: 0,
    startScrollLeft: 0,
    dragDistance: 0,
    cleanupFns: [],
  };

  measureRail(controller);

  bindRailEvent(controller, viewport, "pointerdown", (event) =>
    startRailDrag(controller, event),
  );
  bindRailEvent(controller, viewport, "pointermove", (event) =>
    handleRailDragMove(controller, event),
  );
  bindRailEvent(controller, viewport, "pointerup", (event) =>
    finishRailDrag(controller, event),
  );
  bindRailEvent(controller, viewport, "pointercancel", (event) =>
    finishRailDrag(controller, event),
  );
  bindRailEvent(
    controller,
    viewport,
    "scroll",
    () => normalizeRailPosition(controller),
    { passive: true },
  );
  bindRailEvent(
    controller,
    viewport,
    "wheel",
    () => pauseRail(controller),
    { passive: true },
  );
  bindRailEvent(controller, viewport, "mouseenter", () => {
    if (isMobileViewport()) return;
    holdRail(controller);
  });
  bindRailEvent(controller, viewport, "mouseleave", () => {
    if (isMobileViewport()) return;
    scheduleRailResume(controller, 280);
  });

  controller.rafId = window.requestAnimationFrame((time) => stepRail(controller, time));
  return controller;
}

function bindRailEvent(controller, target, eventName, handler, options) {
  target.addEventListener(eventName, handler, options);
  controller.cleanupFns.push(() => target.removeEventListener(eventName, handler, options));
}

function destroyRailControllers() {
  while (railControllers.length) {
    const controller = railControllers.pop();
    if (!controller) continue;

    window.cancelAnimationFrame(controller.rafId);
    window.clearTimeout(controller.resumeTimer);
    controller.cleanupFns.forEach((cleanup) => cleanup());
  }
}

function measureRail(controller) {
  const cards = Array.from(controller.track?.children || []);
  const firstCard = cards[0];
  const anchorCard = cards[controller.baseCount];
  const gap = Number.parseFloat(
    window.getComputedStyle(controller.track).gap || "0",
  );

  controller.cardSpan = firstCard
    ? firstCard.getBoundingClientRect().width + gap
    : 0;
  controller.baseWidth = anchorCard
    ? anchorCard.offsetLeft - firstCard.offsetLeft
    : controller.cardSpan * controller.baseCount;
  controller.canLoop = controller.baseCount > 1 && controller.baseWidth > 0;
  controller.canAnimate =
    controller.baseCount > getCardsPerRow() &&
    controller.viewport.scrollWidth > controller.viewport.clientWidth + 8;

  if (controller.canLoop) {
    controller.viewport.scrollLeft = controller.baseWidth;
  } else {
    controller.viewport.scrollLeft = 0;
  }
}

function stepRail(controller, time) {
  if (!controller.viewport?.isConnected) return;

  if (!controller.lastFrame) {
    controller.lastFrame = time;
  }

  const delta = time - controller.lastFrame;
  controller.lastFrame = time;

  if (shouldAnimateRail(controller)) {
    controller.viewport.scrollLeft += controller.speed * (delta / 1000);
    normalizeRailPosition(controller);
  }

  controller.rafId = window.requestAnimationFrame((nextTime) =>
    stepRail(controller, nextTime),
  );
}

function shouldAnimateRail(controller) {
  return (
    controller.canAnimate &&
    !controller.paused &&
    !document.hidden &&
    !prefersReducedMotion() &&
    controller.activePointerId === null
  );
}

function normalizeRailPosition(controller) {
  if (!controller.canLoop) return;

  const lowerLimit = controller.baseWidth * 0.5;
  const upperLimit = controller.baseWidth * 1.5;

  if (controller.viewport.scrollLeft <= lowerLimit) {
    controller.viewport.scrollLeft += controller.baseWidth;
  } else if (controller.viewport.scrollLeft >= upperLimit) {
    controller.viewport.scrollLeft -= controller.baseWidth;
  }
}

function holdRail(controller) {
  controller.paused = true;
  window.clearTimeout(controller.resumeTimer);
}

function scheduleRailResume(controller, delay = AUTO_SCROLL_PAUSE_MS) {
  window.clearTimeout(controller.resumeTimer);
  controller.resumeTimer = window.setTimeout(() => {
    controller.paused = false;
    controller.lastFrame = 0;
  }, delay);
}

function pauseRail(controller, delay = AUTO_SCROLL_PAUSE_MS) {
  holdRail(controller);
  scheduleRailResume(controller, delay);
}

function pauseAllRails(delay = AUTO_SCROLL_PAUSE_MS) {
  railControllers.forEach((controller) => pauseRail(controller, delay));
}

function startRailDrag(controller, event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (event.target.closest("button, a, input, textarea, select, label")) return;

  holdRail(controller);
  controller.activePointerId = event.pointerId;
  controller.startX = event.clientX;
  controller.startScrollLeft = controller.viewport.scrollLeft;
  controller.dragDistance = 0;
  controller.viewport.classList.add("is-dragging");
  controller.viewport.setPointerCapture?.(event.pointerId);
}

function handleRailDragMove(controller, event) {
  if (controller.activePointerId !== event.pointerId) return;

  const deltaX = event.clientX - controller.startX;
  controller.dragDistance = Math.max(controller.dragDistance, Math.abs(deltaX));

  if (controller.dragDistance < 2) return;

  controller.viewport.scrollLeft = controller.startScrollLeft - deltaX;
  normalizeRailPosition(controller);
  event.preventDefault();
}

function finishRailDrag(controller, event) {
  if (controller.activePointerId !== event.pointerId) return;

  const scrollDelta = controller.viewport.scrollLeft - controller.startScrollLeft;

  if (controller.dragDistance >= DRAG_THRESHOLD_PX) {
    catalogState.suppressClickUntil = performance.now() + CLICK_SUPPRESSION_MS;
    snapRailToCard(controller, scrollDelta);
  }

  controller.viewport.releasePointerCapture?.(event.pointerId);
  controller.viewport.classList.remove("is-dragging");
  controller.activePointerId = null;
  controller.startX = 0;
  controller.startScrollLeft = 0;
  controller.dragDistance = 0;
  scheduleRailResume(controller);
}

function snapRailToCard(controller, scrollDelta) {
  if (!controller.cardSpan) return;

  normalizeRailPosition(controller);

  const current = controller.canLoop
    ? controller.viewport.scrollLeft - controller.baseWidth
    : controller.viewport.scrollLeft;

  let targetIndex;
  if (Math.abs(scrollDelta) >= SNAP_THRESHOLD_PX) {
    targetIndex = scrollDelta > 0
      ? Math.ceil(current / controller.cardSpan)
      : Math.floor(current / controller.cardSpan);
  } else {
    targetIndex = Math.round(current / controller.cardSpan);
  }

  targetIndex = clamp(targetIndex, 0, Math.max(0, controller.baseCount - 1));

  controller.viewport.scrollTo({
    left: (controller.canLoop ? controller.baseWidth : 0) + targetIndex * controller.cardSpan,
    behavior: "smooth",
  });
}

function shouldSuppressCatalogClick() {
  return performance.now() < catalogState.suppressClickUntil;
}

function handleCatalogClick(event) {
  if (shouldSuppressCatalogClick()) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const minusButton = event.target.closest("[data-product-qty-minus]");
  if (minusButton) {
    changeDraftQuantity(minusButton.dataset.productQtyMinus, -1);
    pauseAllRails();
    return;
  }

  const plusButton = event.target.closest("[data-product-qty-plus]");
  if (plusButton) {
    changeDraftQuantity(plusButton.dataset.productQtyPlus, 1);
    pauseAllRails();
    return;
  }

  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    const productId = addButton.dataset.addToCart;
    const quantity = getDraftQuantity(productId);
    const addedProduct = addToCartById(
      productId,
      quantity,
      Number(addButton.dataset.price),
    );
    if (!addedProduct) return;

    addButton.classList.remove("is-added");
    void addButton.offsetWidth;
    addButton.classList.add("is-added");
    pauseAllRails();
    return;
  }

  const detailButton = event.target.closest("[data-open-detail]");
  if (detailButton) {
    openProductModal(detailButton.dataset.openDetail);
    pauseAllRails();
    return;
  }

  const card = event.target.closest(".product-card");
  if (!card) return;
  if (!isMobileViewport()) return;
  if (event.target.closest("button, a, input, textarea, select, label")) return;

  openProductModal(card.dataset.productId);
  pauseAllRails();
}

function changeDraftQuantity(productId, delta) {
  const current = getDraftQuantity(productId);
  const next = normalizeQuantity(current + Number(delta));
  draftQuantities.set(productId, next);
  syncProductQuantityDisplays(productId);
}

function getDraftQuantity(productId) {
  return normalizeQuantity(draftQuantities.get(productId));
}

function syncProductQuantityDisplays(productId) {
  document
    .querySelectorAll(`[data-product-qty-value="${productId}"]`)
    .forEach((node) => {
      node.textContent = String(getDraftQuantity(productId));
    });

  if (catalogState.activeModalProductId === productId && elements.productModalQty) {
    elements.productModalQty.textContent = String(getDraftQuantity(productId));
  }
}

function openProductModal(productId) {
  const product = PRODUCT_INDEX.get(productId);
  if (!product || !elements.productModal) return;

  catalogState.activeModalProductId = productId;
  elements.productModalImage.src = product.image;
  elements.productModalImage.alt = product.alt;
  elements.productModalCategory.textContent =
    CATEGORY_LABELS[product.category] || "Catalogo";
  elements.productModalTitle.textContent = product.name;
  elements.productModalDescription.textContent = product.description;
  elements.productModalDetails.textContent = product.details;
  elements.productModalPrice.textContent = formatCurrency(product.price);
  elements.productModalAdd.dataset.productId = productId;
  syncProductModalQuantity();

  elements.productModal.hidden = false;
  elements.productModal.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    elements.productModal.classList.add("is-open");
  });
  syncBodyLock();
}

function closeProductModal() {
  if (!elements.productModal) return;

  elements.productModal.classList.remove("is-open");
  elements.productModal.setAttribute("aria-hidden", "true");
  catalogState.activeModalProductId = "";
  window.setTimeout(() => {
    if (!elements.productModal.classList.contains("is-open")) {
      elements.productModal.hidden = true;
    }
  }, 240);
  syncBodyLock();
}

function syncProductModalQuantity() {
  if (!catalogState.activeModalProductId || !elements.productModalQty) return;

  elements.productModalQty.textContent = String(
    getDraftQuantity(catalogState.activeModalProductId),
  );
}

function changeActiveModalQuantity(delta) {
  if (!catalogState.activeModalProductId) return;
  changeDraftQuantity(catalogState.activeModalProductId, delta);
}

function addActiveModalProductToCart() {
  const productId = catalogState.activeModalProductId;
  if (!productId) return;

  addToCartById(productId, getDraftQuantity(productId));
  closeProductModal();
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
    existingProduct.quantity = normalizeQuantity(
      existingProduct.quantity + quantityToAdd,
    );
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
  showToast("Producto agregado", `${product.name} agregado (x${quantityToAdd}) a tu cotizacion.`);
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
    showToast("Producto eliminado", "El producto fue retirado de la cotizacion.");
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
            <div class="cart-item__image">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" />
            </div>
            <div class="cart-item__content">
              <div class="cart-item__header">
                <p class="cart-item__title">${escapeHtml(item.name)}</p>
                <button class="cart-item__remove" type="button" data-remove-item="${item.id}" aria-label="Eliminar ${escapeHtml(item.name)}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <div class="cart-item__meta">
                <span>${formatCurrency(item.price)} c/u</span>
                <span class="cart-item__subtotal">Subtotal ${formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div class="cart-item__controls">
                <div class="qty-stepper" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
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
          </article>
        `,
      )
      .join("");
  }

  if (elements.cartItemsCount) {
    elements.cartItemsCount.textContent = String(totalItems);
  }
  if (elements.heroCartCount) {
    elements.heroCartCount.textContent = String(totalItems);
  }
  if (elements.mobileQuoteCount) {
    elements.mobileQuoteCount.textContent = String(totalItems);
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

  if (!isMobileViewport()) {
    elements.quoteSidebar?.classList.add("is-open");
    elements.quoteMobileTrigger?.setAttribute("aria-expanded", "true");
  }
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
  syncBodyLock();
}

function syncMobileQuoteState() {
  if (!elements.quoteSidebar || !elements.quoteMobileTrigger) return;

  if (isMobileViewport()) {
    elements.quoteSidebar.classList.remove("is-open");
    elements.quoteMobileTrigger.setAttribute("aria-expanded", "false");
  } else {
    elements.quoteSidebar.classList.add("is-open");
    elements.quoteMobileTrigger.setAttribute("aria-expanded", "true");
  }

  syncBodyLock();
}

function pulseMobileQuoteTrigger() {
  if (!isMobileViewport() || !elements.quoteMobileTrigger) return;

  elements.quoteMobileTrigger.classList.remove("is-pulse");
  void elements.quoteMobileTrigger.offsetWidth;
  elements.quoteMobileTrigger.classList.add("is-pulse");
}

function syncBodyLock() {
  const shouldLock =
    (isMobileViewport() && elements.quoteSidebar?.classList.contains("is-open")) ||
    elements.productModal?.classList.contains("is-open");

  document.body.classList.toggle("catalog-lock", Boolean(shouldLock));
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

  emailInput.setCustomValidity(
    emailRegex.test(emailInput.value) ? "" : "Ingresa un correo valido.",
  );
  phoneInput.setCustomValidity(
    phoneRegex.test(phoneInput.value) ? "" : "Ingresa un telefono valido.",
  );

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

  if (navbar) {
    document.body.style.setProperty("--catalog-navbar-height", `${navbar.offsetHeight}px`);
  }

  if (filterBar) {
    document.body.style.setProperty("--catalog-filter-height", `${filterBar.offsetHeight}px`);
  }
}

function showFeedback(message, type) {
  if (!elements.quoteFeedback) return;

  elements.quoteFeedback.className = `quote-feedback is-visible ${
    type === "success" ? "is-success" : "is-error"
  }`;
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
  toast.innerHTML = `
    <div class="toast-card__icon"><i class="fas fa-check"></i></div>
    <div>
      <div class="toast-card__title">${escapeHtml(title)}</div>
      <div class="toast-card__message">${escapeHtml(message)}</div>
    </div>
  `;

  elements.toastStack.appendChild(toast);

  if (elements.toastStack.children.length > 4) {
    elements.toastStack.firstElementChild?.remove();
  }

  window.setTimeout(() => toast.remove(), 3200);
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

  const ref = PRODUCT_INDEX.get(rawItem.id) || PRODUCT_NAME_INDEX.get(rawItem.name) || null;
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

function normalizeQuantity(quantity) {
  const parsed = Math.floor(Number(quantity) || 1);
  return Math.min(99, Math.max(1, parsed));
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

function getCardsPerRow() {
  return isMobileViewport() ? MOBILE_CARDS_PER_ROW : DESKTOP_CARDS_PER_ROW;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shuffleArray(list) {
  for (let index = list.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[randomIndex]] = [list[randomIndex], list[index]];
  }

  return list;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeJson(response) {
  return response.json().catch(() => ({}));
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
