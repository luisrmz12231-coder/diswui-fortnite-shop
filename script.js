const API_URL = "https://prod.fn-api.cc/v1/itemshop";

const PRECIOS = [
  { vb: 500, mxn: 70 },
  { vb: 800, mxn: 100 },
  { vb: 1000, mxn: 140 },
  { vb: 1200, mxn: 150 },
  { vb: 1500, mxn: 170 },
  { vb: 2000, mxn: 270 }
];

const tienda = document.getElementById("shop");
const buscador = document.getElementById("search");
const estado = document.getElementById("status");
const actualizado = document.getElementById("updated");

function precioDISWUI(vbucks) {
  const paquete = PRECIOS.find(p => p.vb >= vbucks);

  if (paquete) return paquete.mxn;

  return Math.ceil(vbucks / 2000) * 270;
}

function obtenerNombre(item) {
  return (
    item.name ||
    item.displayName ||
    item.title ||
    item.devName ||
    "Objeto de Fortnite"
  );
}

function obtenerImagen(item) {
  return (
    item.images?.icon ||
    item.images?.featured ||
    item.images?.smallIcon ||
    item.icon ||
    item.image ||
    ""
  );
}

function obtenerPrecio(item) {
  return (
    item.price?.finalPrice ||
    item.price?.regularPrice ||
    item.finalPrice ||
    item.vbucks ||
    item.price ||
    0
  );
}

function obtenerRareza(item) {
  return (
    item.rarity?.displayValue ||
    item.rarity?.name ||
    item.series?.displayValue ||
    "Fortnite"
  );
}

function mostrarTienda(items) {
  if (!tienda) return;

  tienda.innerHTML = "";

  items.forEach(item => {
    const nombre = obtenerNombre(item);
    const imagen = obtenerImagen(item);
    const vbucks = Number(obtenerPrecio(item)) || 0;
    const mxn = precioDISWUI(vbucks);
    const rareza = obtenerRareza(item);

    const tarjeta = document.createElement("article");
    tarjeta.className = "item";

    tarjeta.innerHTML = `
      <div class="item-image">
        ${
          imagen
            ? <img src="${imagen}" alt="${nombre}" loading="lazy">
            : <div class="no-image">SIN IMAGEN</div>
        }
      </div>

      <div class="item-info">
        <h3>${nombre}</h3>
        <p>${rareza}</p>

        <div class="prices">
          <span>🪙 ${vbucks.toLocaleString()} V-Bucks</span>
          <strong>$${mxn.toLocaleString()} MXN</strong>
        </div>
      </div>
    `;

    tienda.appendChild(tarjeta);
  });
}

async function cargarTienda() {
  if (!tienda) return;

  if (estado) {
    estado.textContent = "Cargando la tienda...";
  }

  try {
    const respuesta = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error(Error HTTP ${respuesta.status});
    }

    const datos = await respuesta.json();

    console.log("Respuesta de Fortnite:", datos);

    let items = [];

    if (Array.isArray(datos)) {
      items = datos;
    } else if (Array.isArray(datos.items)) {
      items = datos.items;
    } else if (Array.isArray(datos.offers)) {
      items = datos.offers;
    } else if (Array.isArray(datos.data)) {
      items = datos.data;
    } else if (Array.isArray(datos.shop)) {
      items = datos.shop;
    }

    if (!items.length) {
      throw new Error("La API no devolvió objetos.");
    }

    mostrarTienda(items);

    if (estado) {
      estado.textContent = ${items.length} objetos encontrados;
    }

    if (actualizado) {
      actualizado.textContent =
        "Actualizado: " +
        new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });
    }

  } catch (error) {
    console.error("Error cargando la tienda:", error);

    if (estado) {
      estado.textContent =
        "No se pudo cargar la tienda. Intenta actualizar la página.";
    }

    tienda.innerHTML = `
      <div class="error">
        <h3>⚠️ No se pudo cargar la tienda</h3>
        <p>La fuente de datos no respondió correctamente.</p>
      </div>
    `;
  }
}

if (buscador) {
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    document.querySelectorAll(".item").forEach(item => {
      const nombre = item.innerText.toLowerCase();

      item.style.display = nombre.includes(texto)
        ? ""
        : "none";
    });
  });
}

cargarTienda();

// Actualizar cada 30 minutos
setInterval(cargarTienda, 30 * 60 * 1000);
