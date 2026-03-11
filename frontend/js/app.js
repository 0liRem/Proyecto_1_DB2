const API = "http://localhost:3000/api";

let currentChart = null;

/* ===========================
   HELPERS
=========================== */

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function showError(message) {
  const errorEl = document.getElementById("error");
  if (errorEl) {
    errorEl.innerText = message;
  } else {
    console.error(message);
  }
}

function showMessage(message) {
  const container = document.getElementById("data");
  if (container) {
    container.innerHTML = `
      <div class="card">
        <p>${message}</p>
      </div>
    `;
  }
}

function hideBulkMenuPanel() {
  const panel = document.getElementById("bulkMenuPanel");
  if (panel) {
    panel.classList.add("hidden");
  }
}

function clearDashboard() {
  const container = document.getElementById("data");
  if (container) {
    container.innerHTML = "";
  }

  hideBulkMenuPanel();

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

function ensureAuthenticated() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "/";
    return false;
  }

  return true;
}

/* ===========================
   ROLE VIEWS
=========================== */

function initRoleView() {
  const user = getUser();
  if (!user) return;

  const adminView = document.getElementById("adminView");
  const repartidorView = document.getElementById("repartidorView");
  const usuarioView = document.getElementById("usuarioView");
  const cajaView = document.getElementById("cajaView");

  adminView?.classList.add("hidden");
  repartidorView?.classList.add("hidden");
  usuarioView?.classList.add("hidden");
  cajaView?.classList.add("hidden");

  if (user.tipo === "administrador") {
    adminView?.classList.remove("hidden");
  }

  if (user.tipo === "repartidor") {
    repartidorView?.classList.remove("hidden");
  }

  if (user.tipo === "usuario") {
    usuarioView?.classList.remove("hidden");
  }

  if (user.tipo === "caja") {
    cajaView?.classList.remove("hidden");
  }
}

/* ===========================
   LOGIN
=========================== */

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard.html";
      } else {
        showError(data.message || "Login incorrecto");
      }
    } catch (error) {
      showError("No se pudo iniciar sesión");
    }
  });
}

/* ===========================
   DASHBOARD INIT
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard")) {
    if (!ensureAuthenticated()) return;
    initRoleView();
  }
});

/* ===========================
   RESTAURANTES
=========================== */

async function loadRestaurantes() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/restaurantes`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "No se pudieron cargar restaurantes");
      return;
    }

    const container = document.getElementById("data");
    container.innerHTML = "<h2>Restaurantes</h2>";

    if (!data.data || data.data.length === 0) {
      container.innerHTML += `
        <div class="card">
          <p>No hay restaurantes para mostrar.</p>
        </div>
      `;
      return;
    }

    data.data.forEach((r) => {
      container.innerHTML += `
        <div class="card">
          <h3>${r.nombre || "Sin nombre"}</h3>
          <p>${r.direccion || "Sin dirección"}</p>
        </div>
      `;
    });
  } catch (error) {
    showMessage("Error cargando restaurantes");
  }
}

/* ===========================
   USUARIO - RESTAURANTES CERCANOS
=========================== */

async function loadRestaurantesCercanos() {
  clearDashboard();

  if (!navigator.geolocation) {
    showMessage("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const res = await fetch(
          `${API}/analytics/restaurantes-cercanos?lng=${lng}&lat=${lat}`,
          {
            headers: authHeaders()
          }
        );

        const result = await res.json();

        if (!res.ok) {
          showMessage(result.message || "No se pudieron cargar restaurantes cercanos");
          return;
        }

        const container = document.getElementById("data");
        container.innerHTML = "<h2>Restaurantes cercanos</h2>";

        if (!result.data || result.data.length === 0) {
          container.innerHTML += `
            <div class="card">
              <p>No se encontraron restaurantes cercanos.</p>
            </div>
          `;
          return;
        }

        result.data.forEach((r) => {
          container.innerHTML += `
            <div class="card">
              <h3>${r.nombre || "Sin nombre"}</h3>
              <p>${r.direccion || "Sin dirección"}</p>
              <p>Distancia: ${Math.round(r.valor || 0)} m</p>
            </div>
          `;
        });
      } catch (error) {
        showMessage("Error cargando restaurantes cercanos");
      }
    },
    () => {
      showMessage("No se pudo obtener tu ubicación");
    }
  );
}

/* ===========================
   USUARIO - MIS ORDENES
=========================== */

async function loadMisOrdenes() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/ordenes`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "No se pudieron cargar tus órdenes");
      return;
    }

    const container = document.getElementById("data");
    container.innerHTML = "<h2>Mis órdenes</h2>";

    if (!data.data || data.data.length === 0) {
      container.innerHTML += `
        <div class="card">
          <p>No tienes órdenes registradas.</p>
        </div>
      `;
      return;
    }

    data.data.forEach((o) => {
      container.innerHTML += `
        <div class="card">
          <h3>Orden #${o._id}</h3>
          <p>Estado: ${o.estado || "sin estado"}</p>
          <p>Total: Q${o.total || 0}</p>
          <p>Fecha: ${o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleString() : "sin fecha"}</p>
        </div>
      `;
    });
  } catch (error) {
    showMessage("Error cargando tus órdenes");
  }
}

/* ===========================
   CAJA - ORDENES
=========================== */

async function loadOrdenesCaja() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/ordenes`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "No se pudieron cargar las órdenes");
      return;
    }

    const container = document.getElementById("data");
    container.innerHTML = "<h2>Órdenes del restaurante</h2>";

    if (!data.data || data.data.length === 0) {
      container.innerHTML += `
        <div class="card">
          <p>No hay órdenes disponibles.</p>
        </div>
      `;
      return;
    }

    data.data.forEach((o) => {
      container.innerHTML += `
        <div class="card">
          <h3>Orden #${o._id}</h3>
          <p>Estado: ${o.estado || "sin estado"}</p>
          <p>Total: Q${o.total || 0}</p>
          <p>Fecha: ${o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleString() : "sin fecha"}</p>
        </div>
      `;
    });
  } catch (error) {
    showMessage("Error cargando órdenes");
  }
}

/* ===========================
   REPARTIDOR - MIS PEDIDOS
=========================== */

async function loadOrdenesRepartidor() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/ordenes`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "No se pudieron cargar los pedidos");
      return;
    }

    const container = document.getElementById("data");
    container.innerHTML = "<h2>Pedidos del repartidor</h2>";

    if (!data.data || data.data.length === 0) {
      container.innerHTML += `
        <div class="card">
          <p>No tienes pedidos asignados.</p>
        </div>
      `;
      return;
    }

    data.data.forEach((o) => {
      container.innerHTML += `
        <div class="card">
          <h3>Orden #${o._id}</h3>
          <p>Estado: ${o.estado || "sin estado"}</p>
          <p>Total: Q${o.total || 0}</p>
          <p>Fecha: ${o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleString() : "sin fecha"}</p>

          <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="actualizarEstadoOrden('${o._id}', 'aceptada')">Aceptar</button>
            <button onclick="actualizarEstadoOrden('${o._id}', 'en camino')">En camino</button>
            <button onclick="actualizarEstadoOrden('${o._id}', 'entregada')">Entregada</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    showMessage("Error cargando pedidos");
  }
}

async function actualizarEstadoOrden(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/ordenes/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        estado: nuevoEstado
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo actualizar la orden");
      return;
    }

    alert("Estado actualizado");
    loadOrdenesRepartidor();
  } catch (error) {
    alert("Error actualizando orden");
  }
}

/* ===========================
   ANALYTICS - TOP PRODUCTOS
=========================== */

async function loadAnalytics() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/analytics/top-productos`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(error.message || "Error cargando analytics");
      return;
    }

    const result = await res.json();

    const labels = result.data.map((x) => x.nombre);
    const values = result.data.map((x) => x.valor);

    const ctx = document.getElementById("chart");

    currentChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Top Productos",
            data: values
          }
        ]
      }
    });
  } catch (error) {
    showMessage("Error cargando top productos");
  }
}

/* ===========================
   ANALYTICS - VENTAS RESTAURANTES
=========================== */

async function ventasRestaurantes() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/analytics/ventas-restaurantes`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(error.message || "Error cargando analytics");
      return;
    }

    const result = await res.json();

    const labels = result.data.map((x) => x.nombre);
    const values = result.data.map((x) => x.valor);

    const ctx = document.getElementById("chart");

    currentChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Ventas por Restaurante",
            data: values
          }
        ]
      }
    });
  } catch (error) {
    showMessage("Error cargando ventas por restaurante");
  }
}

/* ===========================
   ANALYTICS - CLIENTES FRECUENTES
=========================== */

async function clientesFrecuentes() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/analytics/segmentacion-clientes`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(error.message || "Error cargando analytics");
      return;
    }

    const result = await res.json();

    const labels = result.data.map((x) => x.nombre);
    const values = result.data.map((x) => x.valor);

    const ctx = document.getElementById("chart");

    currentChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Segmentación de Clientes",
            data: values
          }
        ]
      }
    });
  } catch (error) {
    showMessage("Error cargando segmentación de clientes");
  }
}

/* ===========================
   ANALYTICS - ORDENES POR DIA
=========================== */

async function ordenesPorDia() {
  clearDashboard();

  try {
    const res = await fetch(`${API}/analytics/ventas-dia`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(error.message || "Error cargando analytics");
      return;
    }

    const result = await res.json();

    const labels = result.data.map((x) => x.nombre);
    const values = result.data.map((x) => x.totalOrdenes);

    const ctx = document.getElementById("chart");

    currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Órdenes por Día",
            data: values
          }
        ]
      }
    });
  } catch (error) {
    showMessage("Error cargando órdenes por día");
  }
}

/* ===========================
   EXPORTAR REPORTE
=========================== */

async function exportarReporteVentas() {
  try {
    const res = await fetch(`${API}/reports/ventas`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!res.ok) {
      let mensaje = "No se pudo exportar el reporte";
      try {
        const error = await res.json();
        mensaje = error.message || mensaje;
      } catch (_) {}
      alert(mensaje);
      return;
    }

    const blob = await res.blob();

    const contentDisposition = res.headers.get("Content-Disposition");
    let fileName = "reporte_ventas.xlsx";

    if (contentDisposition && contentDisposition.includes("filename=")) {
      fileName = contentDisposition
        .split("filename=")[1]
        .replace(/"/g, "")
        .trim();
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Error descargando el reporte");
    console.error(error);
  }
}

/* ===========================
   BULK MENU
=========================== */

function showBulkMenuForm() {
  clearDashboard();

  const panel = document.getElementById("bulkMenuPanel");
  if (panel) {
    panel.classList.remove("hidden");
  }

  const textarea = document.getElementById("bulkMenuJson");
  if (textarea && !textarea.value.trim()) {
    textarea.value = JSON.stringify(
      [
        {
          nombre: "Hamburguesa Clásica",
          descripcion: "Pan artesanal, carne y queso",
          precio: 35,
          categoria: "hamburguesas",
          disponible: true,
          ingredientes: ["pan", "carne", "queso"],
          personalizaciones: ["sin cebolla", "extra queso"]
        },
        {
          nombre: "Pizza Pepperoni",
          descripcion: "Pizza mediana con pepperoni",
          precio: 75,
          categoria: "pizzas",
          disponible: true,
          ingredientes: ["masa", "queso", "pepperoni"],
          personalizaciones: ["extra queso", "sin orilla"]
        },
        {
          nombre: "Pasta Alfredo",
          descripcion: "Pasta con salsa cremosa",
          precio: 48,
          categoria: "pastas",
          disponible: true,
          ingredientes: ["pasta", "crema", "queso parmesano"],
          personalizaciones: ["pollo", "tocino"]
        }
      ],
      null,
      2
    );
  }
}

async function submitBulkMenu() {
  try {
    const user = getUser();
    const restauranteId = document.getElementById("bulkMenuRestauranteId")?.value.trim();
    const rawJson = document.getElementById("bulkMenuJson")?.value.trim();

    if (!rawJson) {
      alert("Debes ingresar el JSON del menú.");
      return;
    }

    let parsedData;

    try {
      parsedData = JSON.parse(rawJson);
    } catch (error) {
      alert("El JSON del menú no es válido.");
      return;
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      alert("Debes enviar un arreglo con uno o más items.");
      return;
    }

    const body = {
      data: parsedData
    };

    if (user?.tipo === "administrador") {
      if (!restauranteId) {
        alert("Como administrador debes ingresar un restauranteId.");
        return;
      }
      body.restauranteId = restauranteId;
    }

    const res = await fetch(`${API}/bulk/menu-items`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "No se pudo insertar el menú masivo.");
      return;
    }

    alert(`Carga masiva completada. Insertados: ${result.inserted}`);
    clearDashboard();
    showMessage(`Carga masiva completada. Insertados: ${result.inserted}`);
  } catch (error) {
    console.error(error);
    alert("Error insertando menú masivo.");
  }
}

/* ===========================
   LOGOUT
=========================== */

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}