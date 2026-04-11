const productos = [
  {
    id: 1,
    nombre: "Kit IoT Inicial",
    categoria: "Kits",
    precio: 49.9,
    rating: 4.8,
    descripcion: "Incluye microcontrolador, sensores base y guía rápida para tus primeras automatizaciones."
  },
  {
    id: 2,
    nombre: "Multimetro Pro X200",
    categoria: "Instrumentacion",
    precio: 35.5,
    rating: 4.6,
    descripcion: "Mediciones estables para voltaje, continuidad y resistencia con pantalla de alto contraste."
  },
  {
    id: 3,
    nombre: "Sensor Ambiental SHT31",
    categoria: "Sensores",
    precio: 12.75,
    rating: 4.7,
    descripcion: "Control preciso de temperatura y humedad para proyectos domoticos y monitoreo remoto."
  },
  {
    id: 4,
    nombre: "Fuente Regulable MiniLab",
    categoria: "Instrumentacion",
    precio: 67,
    rating: 4.9,
    descripcion: "Salida ajustable y proteccion de sobrecorriente, ideal para banco de pruebas compacto."
  },
  {
    id: 5,
    nombre: "Pack Cables Dupont",
    categoria: "Accesorios",
    precio: 8.9,
    rating: 4.5,
    descripcion: "Juego surtido macho-hembra para conexiones rapidas en protoboards y placas de desarrollo."
  },
  {
    id: 6,
    nombre: "Placa ESP32 Dev",
    categoria: "Kits",
    precio: 14.2,
    rating: 4.8,
    descripcion: "WiFi y Bluetooth integrados para aplicaciones de control, telemetria y prototipado agil."
  }
];

const money = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

function productCard(producto) {
  return `
    <article class="product-card">
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

    fillCategoryFilter(categorySelect, productos);
    renderProducts(grid, productos);
    bindCatalogEvents(searchInput, categorySelect, grid);
  } catch (error) {
    catalogRoot.innerHTML = '<p class="empty-state">No fue posible cargar el catalogo ahora.</p>';
    console.error(error);
  }
}

mountCatalog();
