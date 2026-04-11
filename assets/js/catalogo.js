let productos = [];
let activeModal = null;
let modalImage = null;
let modalTitle = null;
let modalCategory = null;
let modalDescription = null;
let modalPrice = null;
let modalRating = null;
let modalStock = null;
let lastFocusedCard = null;

const money = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

function productCard(producto) {
  const badges = [
    producto.oferta ? '<span class="badge badge-oferta">Oferta</span>' : "",
    producto.stock ? '<span class="badge badge-stock">En stock</span>' : '<span class="badge badge-sin-stock">Sin stock</span>'
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="product-card" data-id="${producto.id}" role="button" tabindex="0" aria-label="Ver detalle de ${producto.nombre}">
      <div class="product-image-wrap">
        <img class="product-image" src="${producto.imagen}" alt="${producto.alt}" loading="lazy">
      </div>
      <div class="product-badges">${badges}</div>
      <span class="product-tag">${producto.categoria}</span>
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <div class="product-meta">
        <span class="product-price">${money.format(producto.precio)}</span>
        <span class="product-score">★ ${producto.rating.toFixed(1)}</span>
      </div>
    </article>
  `;
}

async function loadProducts() {
  const response = await fetch("assets/data/productos.json");
  if (!response.ok) {
    throw new Error(`Error cargando productos: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("El archivo de productos no tiene un formato valido.");
  }

  return data;
}

function ensureModal(root) {
  const modalMarkup = `
    <div class="product-modal" id="product-modal" aria-hidden="true">
      <div class="product-modal-backdrop" data-close-modal="true"></div>
      <div class="product-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button class="product-modal-close" type="button" id="product-modal-close" aria-label="Cerrar detalle">×</button>
        <div class="product-modal-media">
          <img id="product-modal-image" alt="">
        </div>
        <div class="product-modal-content">
          <p class="product-modal-category" id="product-modal-category"></p>
          <h3 id="product-modal-title"></h3>
          <p id="product-modal-description"></p>
          <div class="product-modal-meta">
            <span id="product-modal-price"></span>
            <span id="product-modal-rating"></span>
            <span id="product-modal-stock"></span>
          </div>
        </div>
      </div>
    </div>
  `;

  root.insertAdjacentHTML("beforeend", modalMarkup);
  activeModal = document.querySelector("#product-modal");
  modalImage = document.querySelector("#product-modal-image");
  modalTitle = document.querySelector("#product-modal-title");
  modalCategory = document.querySelector("#product-modal-category");
  modalDescription = document.querySelector("#product-modal-description");
  modalPrice = document.querySelector("#product-modal-price");
  modalRating = document.querySelector("#product-modal-rating");
  modalStock = document.querySelector("#product-modal-stock");
}

function closeModal() {
  if (!activeModal) {
    return;
  }

  activeModal.classList.remove("is-open");
  activeModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedCard) {
    lastFocusedCard.focus();
  }
}

function openModal(producto, triggerCard) {
  if (!activeModal || !producto) {
    return;
  }

  lastFocusedCard = triggerCard ?? null;
  modalImage.src = producto.imagen;
  modalImage.alt = producto.alt;
  modalTitle.textContent = producto.nombre;
  modalCategory.textContent = producto.categoria;
  modalDescription.textContent = producto.descripcion;
  modalPrice.textContent = money.format(producto.precio);
  modalRating.textContent = `★ ${producto.rating.toFixed(1)}`;
  modalStock.textContent = producto.stock ? "Disponible" : "Sin stock";

  activeModal.classList.add("is-open");
  activeModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector("#product-modal-close")?.focus();
}

function bindModalEvents(grid) {
  if (!activeModal) {
    return;
  }

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) {
      return;
    }

    const productId = Number(card.dataset.id);
    const producto = productos.find((item) => item.id === productId);
    openModal(producto, card);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const card = event.target.closest(".product-card");
    if (!card) {
      return;
    }

    event.preventDefault();
    const productId = Number(card.dataset.id);
    const producto = productos.find((item) => item.id === productId);
    openModal(producto, card);
  });

  activeModal.addEventListener("click", (event) => {
    const shouldClose = event.target.matches("[data-close-modal='true']") || event.target.closest("#product-modal-close");
    if (shouldClose) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function fillCategoryFilter(select, items) {
  const categorias = [...new Set(items.map((item) => item.categoria))].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    select.append(option);
  });
}

function renderProducts(grid, items) {
  if (!items.length) {
    grid.innerHTML = '<p class="empty-state">No se encontraron productos con ese filtro.</p>';
    return;
  }

  grid.innerHTML = items.map(productCard).join("");
}

function bindCatalogEvents(searchInput, categorySelect, grid) {
  const update = () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;

    const filtered = productos.filter((producto) => {
      const matchText =
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query);
      const matchCategory = category === "all" || producto.categoria === category;
      return matchText && matchCategory;
    });

    renderProducts(grid, filtered);
  };

  searchInput.addEventListener("input", update);
  categorySelect.addEventListener("change", update);
}

async function mountCatalog() {
  const catalogRoot = document.querySelector("#catalogo");
  if (!catalogRoot) {
    return;
  }

  try {
    const response = await fetch("sections/catalogo.html");
    if (!response.ok) {
      throw new Error(`Error cargando catalogo: ${response.status}`);
    }

    catalogRoot.innerHTML = await response.text();

    const searchInput = document.querySelector("#search-producto");
    const categorySelect = document.querySelector("#filter-categoria");
    const grid = document.querySelector("#catalogo-grid");

    if (!searchInput || !categorySelect || !grid) {
      return;
    }

    productos = await loadProducts();
    fillCategoryFilter(categorySelect, productos);
    renderProducts(grid, productos);
    bindCatalogEvents(searchInput, categorySelect, grid);
    ensureModal(catalogRoot);
    bindModalEvents(grid);
  } catch (error) {
    catalogRoot.innerHTML = '<p class="empty-state">No fue posible cargar el catalogo ahora.</p>';
    console.error(error);
  }
}

mountCatalog();
