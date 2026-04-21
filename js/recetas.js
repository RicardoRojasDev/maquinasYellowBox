const RECIPE_CATEGORY_LABELS = {
  cafes: "Cafes",
  capuchinos: "Capuchinos",
  chocolates: "Chocolates",
  chai: "Chai",
  leches: "Leches",
  frios: "Frios",
  especiales: "Especiales",
};

// Sample recipes can grow without changing the rendering or filtering layer.
const RECIPES = [
  {
    id: "espresso-corto",
    name: "Espresso Corto Premium",
    category: "cafes",
    image: "img/miscela.png",
    shortDescription:
      "Receta breve para un espresso intenso, balanceado y con crema estable.",
    fullDescription:
      "Preparacion enfocada en una taza corta, aromatica y util para degustaciones o servicio corporativo rapido.",
    time: "35 segundos",
    difficulty: "Baja",
    yield: "1 taza de 45 ml",
    flavorProfile: "Intenso, tostado y con final dulce corto",
    idealFor: "Coffee corners, recepciones y oficinas de alto flujo",
    featured: true,
    ingredients: [
      { amount: "8 g", item: "Cafe Mokador Gran Miscela" },
      { amount: "40 a 45 ml", item: "Agua caliente" },
    ],
    steps: [
      "Precalienta la taza para estabilizar la temperatura de servicio.",
      "Carga la dosis de cafe y extrae la bebida en menos de 35 segundos.",
      "Sirve inmediatamente para conservar crema, aroma y cuerpo.",
    ],
    tips: [
      "Usa taza pequena de porcelana para mantener la temperatura.",
      "Si la crema sale muy clara, revisa molienda y caudal.",
    ],
    mainIngredients: ["Cafe", "Agua", "Crema"],
  },
  {
    id: "latte-cremoso",
    name: "Latte Cremoso de Servicio",
    category: "leches",
    image: "img/Milk100.png",
    shortDescription:
      "Base lactea suave para servicio vending con textura estable y buen volumen.",
    fullDescription:
      "Receta pensada para una bebida blanca, cremosa y facil de mantener consistente durante toda la jornada.",
    time: "1 minuto",
    difficulty: "Baja",
    yield: "1 vaso de 180 ml",
    flavorProfile: "Suave, cremoso y ligeramente dulce",
    idealFor: "Oficinas, desayunos y atencion de visitas",
    featured: false,
    ingredients: [
      { amount: "18 g", item: "Milk 100%" },
      { amount: "150 ml", item: "Agua caliente" },
      { amount: "15 ml", item: "Espresso o cafe corto opcional" },
    ],
    steps: [
      "Dispensa la base lactea en el vaso de servicio.",
      "Agrega agua caliente y mezcla hasta lograr textura homogenea.",
      "Si deseas una version latte, incorpora un cafe corto al final.",
    ],
    tips: [
      "Ideal como base para bebidas saborizadas o especiales.",
      "Funciona bien con toppings suaves como canela o cacao fino.",
    ],
    mainIngredients: ["Leche", "Agua", "Cafe opcional"],
  },
  {
    id: "capuccino-avellana",
    name: "Capuccino Avellana",
    category: "capuchinos",
    image: "img/CapuAvellana.jpg",
    shortDescription:
      "Bebida cremosa con aroma a avellana y final amable para consumo transversal.",
    fullDescription:
      "Formula equilibrada para una taza aromatica, comercial y facil de recomendar en puntos de servicio automatizado.",
    time: "1 minuto",
    difficulty: "Baja",
    yield: "1 vaso de 200 ml",
    flavorProfile: "Cremoso, goloso y con avellana marcada",
    idealFor: "Salas de espera, retail y vending de oficina",
    featured: true,
    ingredients: [
      { amount: "22 g", item: "Preparado Capuccino Avellana" },
      { amount: "170 ml", item: "Agua caliente" },
      { amount: "2 g", item: "Cacao o canela para terminacion" },
    ],
    steps: [
      "Dispensa el preparado de capuccino en el vaso.",
      "Completa con agua caliente y mezcla hasta obtener espuma uniforme.",
      "Termina con una pequena capa de cacao o canela si deseas una presentacion premium.",
    ],
    tips: [
      "Sirve en vaso alto para destacar la espuma.",
      "Reduce agua en 10 ml para un perfil mas intenso.",
    ],
    mainIngredients: ["Capuccino", "Agua", "Cacao"],
  },
  {
    id: "mocha-operativo",
    name: "Mocha Operativo",
    category: "especiales",
    image: "img/Nero.png",
    shortDescription:
      "Combinacion de cafe y chocolate pensada para una bebida indulgente pero estable.",
    fullDescription:
      "Receta hibrida para mostrar propuestas especiales de vending con alto valor percibido y lectura simple para el usuario final.",
    time: "1 minuto 20 segundos",
    difficulty: "Media",
    yield: "1 vaso de 220 ml",
    flavorProfile: "Achocolatado, tostado y redondo",
    idealFor: "Demostraciones, menu premium y zonas de descanso",
    featured: true,
    ingredients: [
      { amount: "8 g", item: "Cafe espresso o soluble intenso" },
      { amount: "16 g", item: "Chocolate Nero" },
      { amount: "14 g", item: "Base lactea" },
      { amount: "180 ml", item: "Agua caliente" },
    ],
    steps: [
      "Combina chocolate y base lactea en la taza o vaso.",
      "Agrega el cafe y completa con agua caliente.",
      "Mezcla de manera uniforme hasta lograr una bebida lisa y cremosa.",
    ],
    tips: [
      "Puedes decorar con cacao fino para mayor presencia visual.",
      "Ajusta el cafe segun intensidad deseada del punto de servicio.",
    ],
    mainIngredients: ["Cafe", "Chocolate", "Base lactea"],
  },
  {
    id: "chocolate-clasico",
    name: "Chocolate Clasico Cremoso",
    category: "chocolates",
    image: "img/Choco.png",
    shortDescription:
      "Version clasica para una taza de chocolate estable, cremosa y facil de replicar.",
    fullDescription:
      "Preparacion centrada en cuerpo y textura para ofrecer una bebida de cacao agradable durante todo el dia.",
    time: "55 segundos",
    difficulty: "Baja",
    yield: "1 vaso de 180 ml",
    flavorProfile: "Dulce, cremoso y de cacao amable",
    idealFor: "Colegios, oficinas y consumo familiar",
    featured: false,
    ingredients: [
      { amount: "24 g", item: "Chocolate L'Chocolate" },
      { amount: "160 ml", item: "Agua caliente" },
      { amount: "4 g", item: "Leche granulada opcional" },
    ],
    steps: [
      "Dosifica el chocolate en el vaso o recipiente de preparacion.",
      "Incorpora agua caliente y mezcla hasta disolver completamente.",
      "Agrega leche granulada si deseas una textura aun mas cremosa.",
    ],
    tips: [
      "Sirve con cuchara corta para una mejor experiencia de consumo.",
      "Ideal como receta base para versiones especiales.",
    ],
    mainIngredients: ["Chocolate", "Agua", "Leche opcional"],
  },
  {
    id: "chai-latte-clasico",
    name: "Chai Latte Clasico",
    category: "chai",
    image: "img/CHAI.svg",
    shortDescription:
      "Bebida especiada, moderna y muy util para ampliar la carta de calientes.",
    fullDescription:
      "Formula para una taza especiada y cremosa que agrega variedad a maquinas y corners de autoservicio.",
    time: "1 minuto",
    difficulty: "Baja",
    yield: "1 vaso de 200 ml",
    flavorProfile: "Especiado, cremoso y aromatico",
    idealFor: "Menu alternativo al cafe y tramos de tarde",
    featured: true,
    ingredients: [
      { amount: "20 g", item: "Preparado Chai Latte" },
      { amount: "170 ml", item: "Agua caliente" },
      { amount: "5 g", item: "Base lactea para cuerpo extra" },
    ],
    steps: [
      "Dispensa el chai en un vaso resistente al calor.",
      "Agrega agua caliente en dos tiempos para disolver mejor.",
      "Completa con base lactea si buscas una version mas redonda.",
    ],
    tips: [
      "Espolvorea canela para una presentacion mas premium.",
      "Muy buena opcion para usuarios que no prefieren espresso.",
    ],
    mainIngredients: ["Chai", "Agua", "Base lactea"],
  },
  {
    id: "frappe-caramelo",
    name: "Frappe Caramelo",
    category: "frios",
    image: "img/302.png",
    shortDescription:
      "Receta fria, vistosa y comercial para ampliar propuestas de temporada.",
    fullDescription:
      "Preparacion estilo frappe con perfil dulce y alta aceptacion, util para menu frio y promociones.",
    time: "2 minutos",
    difficulty: "Media",
    yield: "1 vaso de 300 ml",
    flavorProfile: "Dulce, fresco y con caramelo cremoso",
    idealFor: "Temporada calida, vitrinas y venta impulsiva",
    featured: true,
    ingredients: [
      { amount: "20 g", item: "Cafe Caramel capuccino" },
      { amount: "90 ml", item: "Leche fria o base lactea diluida" },
      { amount: "1 taza", item: "Hielo triturado" },
      { amount: "10 ml", item: "Salsa de caramelo" },
    ],
    steps: [
      "Lleva el preparado, la leche fria y el hielo a licuadora o mixer.",
      "Procesa hasta lograr textura frappe homogenea.",
      "Sirve y termina con un hilo de salsa de caramelo.",
    ],
    tips: [
      "Usa vaso transparente para destacar el color y el topping.",
      "Reduce hielo si buscas una textura mas cremosa y menos compacta.",
    ],
    mainIngredients: ["Caramelo", "Leche fria", "Hielo"],
  },
  {
    id: "cold-chai-menta",
    name: "Cold Chai Menta",
    category: "frios",
    image: "img/CHAI.svg",
    shortDescription:
      "Version fria, aromatica y refrescante para un recetario mas versatil.",
    fullDescription:
      "Alternativa moderna con perfil ligero que funciona muy bien como oferta de temporada o menu joven.",
    time: "2 minutos",
    difficulty: "Media",
    yield: "1 vaso de 300 ml",
    flavorProfile: "Fresco, herbal y especiado",
    idealFor: "Temporada primavera-verano y menu diferencial",
    featured: false,
    ingredients: [
      { amount: "18 g", item: "Chai Menta" },
      { amount: "120 ml", item: "Agua fria" },
      { amount: "1 taza", item: "Hielo" },
      { amount: "20 ml", item: "Leche o base cremosa opcional" },
    ],
    steps: [
      "Disuelve primero el chai en una pequena cantidad de agua.",
      "Completa con el resto del liquido y agrega hielo.",
      "Incorpora base cremosa opcional para una textura mas amable.",
    ],
    tips: [
      "Puedes terminar con hojas de menta para mejorar la presentacion.",
      "Ideal como receta de apoyo para publico que busca algo mas fresco.",
    ],
    mainIngredients: ["Chai", "Menta", "Hielo"],
  },
  {
    id: "cafe-vainilla-suave",
    name: "Cafe Vainilla Suave",
    category: "cafes",
    image: "img/arabica.png",
    shortDescription:
      "Cafe aromatico con nota dulce de vainilla para una experiencia mas amable.",
    fullDescription:
      "Receta simple y comercial para quienes quieren un cafe suave, perfumado y de facil salida en entornos corporativos.",
    time: "1 minuto",
    difficulty: "Baja",
    yield: "1 vaso de 180 ml",
    flavorProfile: "Suave, aromatico y con dulzor elegante",
    idealFor: "Oficinas, reuniones y atencion de clientes",
    featured: false,
    ingredients: [
      { amount: "8 g", item: "Cafe 100% Arabica" },
      { amount: "150 ml", item: "Agua caliente" },
      { amount: "8 g", item: "Base sabor vainilla" },
    ],
    steps: [
      "Prepara el cafe en una taza o vaso mediano.",
      "Agrega la base vainilla y mezcla hasta integrar aroma y dulzor.",
      "Sirve de inmediato para conservar temperatura y fragancia.",
    ],
    tips: [
      "Puede combinarse con un toque de leche para version latte.",
      "Muy recomendable como receta de iniciacion para usuarios nuevos.",
    ],
    mainIngredients: ["Cafe", "Vainilla", "Agua"],
  },
  {
    id: "chocolate-organico-premium",
    name: "Chocolate Organico Premium",
    category: "especiales",
    image: "img/106.png",
    shortDescription:
      "Receta de cacao organico con enfoque premium y comunicacion de valor.",
    fullDescription:
      "Propuesta especial para puntos que buscan mostrar origen, calidad y una experiencia de chocolate mas sofisticada.",
    time: "1 minuto 10 segundos",
    difficulty: "Media",
    yield: "1 taza de 180 ml",
    flavorProfile: "Cacao mas profundo, menos dulce y elegante",
    idealFor: "Hoteles, coworks y propuestas gourmet",
    featured: true,
    ingredients: [
      { amount: "22 g", item: "SHOO Choco Organico" },
      { amount: "140 ml", item: "Agua caliente" },
      { amount: "20 ml", item: "Leche caliente o espuma ligera" },
    ],
    steps: [
      "Dispensa el chocolate organico en la taza de servicio.",
      "Agrega agua caliente y mezcla hasta obtener una base densa.",
      "Termina con leche o una espuma ligera para balancear el perfil.",
    ],
    tips: [
      "Funciona muy bien en taza de porcelana pequena o mediana.",
      "Comunica el atributo organico para elevar percepcion de valor.",
    ],
    mainIngredients: ["Chocolate organico", "Agua", "Leche"],
  },
  {
    id: "capuccino-classic",
    name: "Capuccino Classic Operativo",
    category: "capuchinos",
    image: "img/305.svg",
    shortDescription:
      "Capuccino equilibrado y facil de estandarizar para consumo diario.",
    fullDescription:
      "Receta base de capuccino para operacion vending, con cuerpo, espuma y preparacion consistente.",
    time: "55 segundos",
    difficulty: "Baja",
    yield: "1 vaso de 180 ml",
    flavorProfile: "Cremoso, tostado y ligeramente achocolatado",
    idealFor: "Equipos internos, autoservicio y salas de espera",
    featured: false,
    ingredients: [
      { amount: "20 g", item: "Capuccino Classic" },
      { amount: "160 ml", item: "Agua caliente" },
    ],
    steps: [
      "Dosifica el preparado directamente en el vaso.",
      "Agrega agua caliente y mezcla hasta generar espuma fina.",
      "Sirve de inmediato para conservar cuerpo y aroma.",
    ],
    tips: [
      "Ajusta agua para un resultado mas corto o mas suave.",
      "Muy util como referencia base para otras versiones saborizadas.",
    ],
    mainIngredients: ["Capuccino", "Agua", "Espuma"],
  },
  {
    id: "leche-base-neutra",
    name: "Leche Base Neutra",
    category: "leches",
    image: "img/NaturOriginal.png",
    shortDescription:
      "Preparacion tecnica para usar como base de multiples recetas calientes.",
    fullDescription:
      "Ficha simple para una base lactea neutra que sirve como apoyo en chocolates, chai y especiales.",
    time: "45 segundos",
    difficulty: "Baja",
    yield: "1 base de 160 ml",
    flavorProfile: "Neutro, suave y adaptable",
    idealFor: "Recetas compuestas y calibracion de maquinas",
    featured: false,
    ingredients: [
      { amount: "18 g", item: "Natur Original" },
      { amount: "145 ml", item: "Agua caliente" },
    ],
    steps: [
      "Dispensa la base lactea en el recipiente de mezcla.",
      "Agrega agua caliente y remueve hasta disolver por completo.",
      "Usa la base de inmediato o como soporte para otra receta.",
    ],
    tips: [
      "Perfecta para fichas tecnicas donde la base debe repetirse.",
      "Permite documentar proporciones comunes del punto vending.",
    ],
    mainIngredients: ["Base lactea", "Agua", "Cremosidad"],
  },
];

const RECIPE_STATE = {
  activeFilter: "all",
  activeRecipeId: "",
  suppressClickUntil: 0,
  slider: {
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    dragDistance: 0,
  },
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheRecipeElements();
  bindRecipeEvents();
  syncRecipeStickyOffset();
  renderRecipePage();
});

function cacheRecipeElements() {
  elements.filterButtons = Array.from(document.querySelectorAll(".recipes-filter"));
  elements.heroRecipeCount = document.getElementById("heroRecipeCount");
  elements.heroCategoryCount = document.getElementById("heroCategoryCount");
  elements.heroFeaturedCount = document.getElementById("heroFeaturedCount");
  elements.featuredSlider = document.getElementById("featuredSlider");
  elements.featuredTrack = document.getElementById("featuredTrack");
  elements.featuredPrev = document.getElementById("featuredPrev");
  elements.featuredNext = document.getElementById("featuredNext");
  elements.featuredSummaryText = document.getElementById("featuredSummaryText");
  elements.recipesGrid = document.getElementById("recipesGrid");
  elements.recipesResultText = document.getElementById("recipesResultText");
  elements.recipesEmptyState = document.getElementById("recipesEmptyState");
  elements.recipeModal = document.getElementById("recipeModal");
  elements.recipeModalBackdrop = document.getElementById("recipeModalBackdrop");
  elements.recipeModalClose = document.getElementById("recipeModalClose");
  elements.recipeModalImage = document.getElementById("recipeModalImage");
  elements.recipeModalCategory = document.getElementById("recipeModalCategory");
  elements.recipeModalTitle = document.getElementById("recipeModalTitle");
  elements.recipeModalDescription = document.getElementById("recipeModalDescription");
  elements.recipeModalTime = document.getElementById("recipeModalTime");
  elements.recipeModalDifficulty = document.getElementById("recipeModalDifficulty");
  elements.recipeModalYield = document.getElementById("recipeModalYield");
  elements.recipeModalIngredients = document.getElementById("recipeModalIngredients");
  elements.recipeModalSteps = document.getElementById("recipeModalSteps");
  elements.recipeModalFlavor = document.getElementById("recipeModalFlavor");
  elements.recipeModalIdealFor = document.getElementById("recipeModalIdealFor");
  elements.recipeModalTips = document.getElementById("recipeModalTips");
}

function bindRecipeEvents() {
  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextFilter = button.dataset.filter || "all";
      if (nextFilter === RECIPE_STATE.activeFilter) return;

      RECIPE_STATE.activeFilter = nextFilter;
      elements.filterButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      closeRecipeModal();
      renderRecipePage();
    });
  });

  elements.featuredPrev?.addEventListener("click", () => scrollFeaturedSlider(-1));
  elements.featuredNext?.addEventListener("click", () => scrollFeaturedSlider(1));
  elements.featuredTrack?.addEventListener("click", handleRecipeActionClick);
  elements.recipesGrid?.addEventListener("click", handleRecipeActionClick);
  elements.recipeModalBackdrop?.addEventListener("click", closeRecipeModal);
  elements.recipeModalClose?.addEventListener("click", closeRecipeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRecipeModal();
    }
  });

  window.addEventListener("resize", syncRecipeStickyOffset);

  // Keep drag interactions lightweight so the featured rail feels natural on desktop too.
  elements.featuredSlider?.addEventListener("pointerdown", handleFeaturedPointerDown);
  elements.featuredSlider?.addEventListener("pointermove", handleFeaturedPointerMove);
  elements.featuredSlider?.addEventListener("pointerup", handleFeaturedPointerUp);
  elements.featuredSlider?.addEventListener("pointercancel", handleFeaturedPointerUp);
}

function renderRecipePage() {
  const recipes = getVisibleRecipes();
  const featuredRecipes = getVisibleFeaturedRecipes(recipes);

  renderHeroStats(recipes, featuredRecipes);
  renderFeaturedRecipes(featuredRecipes);
  renderRecipeGrid(recipes);

  if (
    RECIPE_STATE.activeRecipeId &&
    !RECIPES.some((recipe) => recipe.id === RECIPE_STATE.activeRecipeId)
  ) {
    closeRecipeModal();
  }
}

function getVisibleRecipes() {
  if (RECIPE_STATE.activeFilter === "all") return RECIPES;

  return RECIPES.filter((recipe) => recipe.category === RECIPE_STATE.activeFilter);
}

function getVisibleFeaturedRecipes(filteredRecipes) {
  const featured = filteredRecipes.filter((recipe) => recipe.featured);
  if (featured.length) return featured;
  return filteredRecipes.slice(0, 4);
}

function renderHeroStats(recipes, featuredRecipes) {
  if (elements.heroRecipeCount) {
    elements.heroRecipeCount.textContent = String(recipes.length);
  }

  if (elements.heroCategoryCount) {
    elements.heroCategoryCount.textContent = String(
      RECIPE_STATE.activeFilter === "all" ? Object.keys(RECIPE_CATEGORY_LABELS).length : 1,
    );
  }

  if (elements.heroFeaturedCount) {
    elements.heroFeaturedCount.textContent = String(featuredRecipes.length);
  }

  if (elements.featuredSummaryText) {
    elements.featuredSummaryText.textContent =
      RECIPE_STATE.activeFilter === "all"
        ? "Selecciones con mejor lectura visual para consulta y demostracion."
        : `Destacadas dentro de ${RECIPE_CATEGORY_LABELS[RECIPE_STATE.activeFilter] || "la categoria activa"}.`;
  }

  if (elements.recipesResultText) {
    elements.recipesResultText.textContent =
      RECIPE_STATE.activeFilter === "all"
        ? `${recipes.length} recetas disponibles para consulta y soporte operativo.`
        : `${recipes.length} recetas encontradas en ${RECIPE_CATEGORY_LABELS[RECIPE_STATE.activeFilter] || "la categoria seleccionada"}.`;
  }
}

function renderFeaturedRecipes(recipes) {
  if (!elements.featuredTrack) return;

  elements.featuredTrack.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="featured-card">
          <div class="featured-card__media">
            <img src="${recipe.image}" alt="${escapeHtml(recipe.name)}" loading="lazy" />
          </div>
          <div class="featured-card__body">
            <div class="featured-card__topline">
              <span class="featured-card__badge">${RECIPE_CATEGORY_LABELS[recipe.category]}</span>
            </div>
            <div class="featured-card__meta">
              <span>${recipe.time}</span>
              <span>${recipe.difficulty}</span>
            </div>
            <h3 class="featured-card__title">${escapeHtml(recipe.name)}</h3>
            <p class="featured-card__description">${escapeHtml(recipe.shortDescription)}</p>
            <button class="featured-card__button" type="button" data-open-recipe="${recipe.id}">
              <i class="fas fa-book-open"></i>
              <span>Ver detalle</span>
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  elements.featuredSlider.scrollLeft = 0;
}

function renderRecipeGrid(recipes) {
  if (!elements.recipesGrid || !elements.recipesEmptyState) return;

  elements.recipesEmptyState.hidden = recipes.length > 0;
  elements.recipesGrid.hidden = recipes.length === 0;

  if (!recipes.length) {
    elements.recipesGrid.innerHTML = "";
    return;
  }

  elements.recipesGrid.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="recipe-card">
          <div class="recipe-card__media">
            <img src="${recipe.image}" alt="${escapeHtml(recipe.name)}" loading="lazy" />
          </div>
          <div class="recipe-card__body">
            <div class="recipe-card__topline">
              <span class="recipe-card__badge">${RECIPE_CATEGORY_LABELS[recipe.category]}</span>
            </div>
            <div class="recipe-card__meta">
              <span>${recipe.time}</span>
              <span>${recipe.difficulty}</span>
              <span>${recipe.yield}</span>
            </div>
            <h3 class="recipe-card__title">${escapeHtml(recipe.name)}</h3>
            <p class="recipe-card__description">${escapeHtml(recipe.shortDescription)}</p>
            <div class="recipe-card__ingredients">
              ${recipe.mainIngredients
                .slice(0, 3)
                .map((item) => `<span>${escapeHtml(item)}</span>`)
                .join("")}
            </div>
            <button class="recipe-card__button" type="button" data-open-recipe="${recipe.id}">
              <i class="fas fa-book"></i>
              <span>Ver receta</span>
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function handleRecipeActionClick(event) {
  if (performance.now() < RECIPE_STATE.suppressClickUntil) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const openButton = event.target.closest("[data-open-recipe]");
  if (!openButton) return;

  openRecipeModal(openButton.dataset.openRecipe);
}

function openRecipeModal(recipeId) {
  const recipe = RECIPES.find((item) => item.id === recipeId);
  if (!recipe || !elements.recipeModal) return;

  RECIPE_STATE.activeRecipeId = recipe.id;
  elements.recipeModalImage.src = recipe.image;
  elements.recipeModalImage.alt = recipe.name;
  elements.recipeModalCategory.textContent = RECIPE_CATEGORY_LABELS[recipe.category];
  elements.recipeModalTitle.textContent = recipe.name;
  elements.recipeModalDescription.textContent = recipe.fullDescription;
  elements.recipeModalTime.textContent = recipe.time;
  elements.recipeModalDifficulty.textContent = recipe.difficulty;
  elements.recipeModalYield.textContent = recipe.yield;
  elements.recipeModalFlavor.textContent = recipe.flavorProfile;
  elements.recipeModalIdealFor.textContent = recipe.idealFor;

  elements.recipeModalIngredients.innerHTML = recipe.ingredients
    .map(
      (ingredient) =>
        `<li><strong>${escapeHtml(ingredient.amount)}</strong> ${escapeHtml(ingredient.item)}</li>`,
    )
    .join("");

  elements.recipeModalSteps.innerHTML = recipe.steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");

  elements.recipeModalTips.innerHTML = recipe.tips
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join("");

  elements.recipeModal.hidden = false;
  elements.recipeModal.setAttribute("aria-hidden", "false");

  window.requestAnimationFrame(() => {
    elements.recipeModal.classList.add("is-open");
  });

  document.body.classList.add("recipes-lock");
}

function closeRecipeModal() {
  if (!elements.recipeModal) return;

  RECIPE_STATE.activeRecipeId = "";
  elements.recipeModal.classList.remove("is-open");
  elements.recipeModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("recipes-lock");

  window.setTimeout(() => {
    if (!elements.recipeModal.classList.contains("is-open")) {
      elements.recipeModal.hidden = true;
    }
  }, 220);
}

function scrollFeaturedSlider(direction) {
  if (!elements.featuredSlider) return;

  const card = elements.featuredTrack?.querySelector(".featured-card");
  if (!card) return;

  const gap = Number.parseFloat(
    window.getComputedStyle(elements.featuredTrack).gap || "0",
  );
  const amount = card.getBoundingClientRect().width + gap;

  elements.featuredSlider.scrollBy({
    left: direction * amount,
    behavior: "smooth",
  });
}

function handleFeaturedPointerDown(event) {
  if (!elements.featuredSlider) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (event.target.closest("button, a")) return;

  RECIPE_STATE.slider.pointerId = event.pointerId;
  RECIPE_STATE.slider.startX = event.clientX;
  RECIPE_STATE.slider.startScrollLeft = elements.featuredSlider.scrollLeft;
  RECIPE_STATE.slider.dragDistance = 0;
  elements.featuredSlider.classList.add("is-dragging");
  elements.featuredSlider.setPointerCapture?.(event.pointerId);
}

function handleFeaturedPointerMove(event) {
  if (!elements.featuredSlider) return;
  if (RECIPE_STATE.slider.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - RECIPE_STATE.slider.startX;
  RECIPE_STATE.slider.dragDistance = Math.max(
    RECIPE_STATE.slider.dragDistance,
    Math.abs(deltaX),
  );

  if (RECIPE_STATE.slider.dragDistance < 2) return;

  elements.featuredSlider.scrollLeft = RECIPE_STATE.slider.startScrollLeft - deltaX;
  event.preventDefault();
}

function handleFeaturedPointerUp(event) {
  if (!elements.featuredSlider) return;
  if (RECIPE_STATE.slider.pointerId !== event.pointerId) return;

  if (RECIPE_STATE.slider.dragDistance > 10) {
    RECIPE_STATE.suppressClickUntil = performance.now() + 220;
  }

  elements.featuredSlider.releasePointerCapture?.(event.pointerId);
  elements.featuredSlider.classList.remove("is-dragging");
  RECIPE_STATE.slider.pointerId = null;
  RECIPE_STATE.slider.startX = 0;
  RECIPE_STATE.slider.startScrollLeft = 0;
  RECIPE_STATE.slider.dragDistance = 0;
}

function syncRecipeStickyOffset() {
  const navbar = document.querySelector(".recipes-page .navbar");
  if (!navbar) return;

  document.body.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
