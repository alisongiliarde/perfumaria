
const WHATSAPP_NUMBER = "5581999365569";

let products = [];
let selectedProduct = null;

const money = value =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function getElement(id) {
  return document.getElementById(id);
}

const fallbackProducts = [
  {
    id: "ez-vip-black",
    name: "EZ VIP Black",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "Assets/ez-vip-black.jpg",
    description: "Uma opção de estilo moderno e sofisticado.",
    tag: "Estilo sofisticado",
    stock: 0
  },
  {
    id: "ez-black",
    name: "EZ Black",
    short: "Eau de Parfum · linha EZ",
    price: 55,
    image: "Assets/ez-black.jpg",
    description: "Uma opção de perfil elegante e marcante.",
    tag: "Presença marcante",
    stock: 0
  },
  {
    id: "ez-vip-men",
    name: "EZ VIP Men",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "Assets/ez-vip-men.jpg",
    description: "Uma fragrância com visual contemporâneo.",
    tag: "Versátil",
    stock: 0
  }
];

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

function normalizarProduto(p, i) {
  return {
    id: String(p.id || "produto-" + i),
    name: String(p.nome || p.name || "Perfume"),
    short: p.short || "Fragrância selecionada",
    price: Number(p.preco ?? p.price ?? 0),
    image: p.imagem || p.image || "",
    description: p.descricao || p.description || "Consulte a embalagem para conferir as informações do fabricante.",
    tag: p.tag || "Alison Perfumaria",
    stock: Number(p.estoque ?? p.stock ?? 0)
  };
}

async function carregarCatalogo() {
  try {
    const resposta = await fetch("./catalogo.json?v=" + Date.now(), {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error("Catálogo ainda não publicado");
    }

    const dados = await resposta.json();

    if (!dados || !Array.isArray(dados.produtos)) {
      throw new Error("Formato de catálogo inválido");
    }

    products = dados.produtos.map(normalizarProduto);
  } catch (erro) {
    console.warn("Não foi possível carregar o catálogo:", erro);
    products = fallbackProducts;
  }

  renderProducts();
}

function renderProducts() {
  const container = getElement("products");
  if (!container) return;

  if (!products.length) {
    container.innerHTML =
      '<p class="section-note">Novas fragrâncias em breve. Fale conosco pelo WhatsApp.</p>';
    return;
  }

  container.innerHTML = products.map(p => {
    const indisponivel = p.stock <= 0;
    const id = escaparHTML(p.id);
    const nome = escaparHTML(p.name);
    const tag = escaparHTML(p.tag);
    const short = escaparHTML(p.short);
    const imagem = escaparHTML(p.image);

    return `
      <article class="product-card">
        <div class="product-image"
             onclick="openDetails('${id}')"
             role="button"
             tabindex="0"
             aria-label="Ver detalhes de ${nome}">
          ${
            imagem
              ? `<img src="${imagem}" alt="${nome}" loading="lazy"
                     onerror="this.onerror=null;this.alt='Foto indisponível';">`
              : '<div class="no-product-image">Foto em breve</div>'
          }
          <span class="product-tag">${tag}</span>
        </div>

        <div class="product-info">
          <h3>${nome}</h3>
          <p class="product-subtitle">${short}</p>

          <div class="product-bottom">
            <span class="price">${money(p.price)}</span>
            <button class="text-btn" onclick="openDetails('${id}')">
              Ver detalhes ↗
            </button>
          </div>

          ${
            indisponivel
              ? '<button class="primary-btn full" disabled>Indisponível no momento</button>'
              : `<button class="primary-btn full" onclick="chooseProduct('${id}')">Quero esse →</button>`
          }
        </div>
      </article>
    `;
  }).join("");
}

function produtoPorId(id) {
  return products.find(item => item.id === id);
}

function openDetails(id) {
  const p = produtoPorId(id);
  if (!p) return;

  const img = getElement("detail-img");

  if (img) {
    img.src = p.image || "";
    img.alt = p.name;
    img.style.display = p.image ? "block" : "none";
  }

  if (getElement("detail-title"))
    getElement("detail-title").textContent = p.name;

  if (getElement("detail-price"))
    getElement("detail-price").textContent = money(p.price);

  if (getElement("detail-description"))
    getElement("detail-description").textContent = p.description;

  const buyButton = getElement("detail-buy");

  if (buyButton) {
    buyButton.disabled = p.stock <= 0;
    buyButton.textContent = p.stock <= 0
      ? "Indisponível no momento"
      : "Quero esse →";

    buyButton.onclick = () => chooseProduct(id);
  }

  showModal("detail-modal");
}

function chooseProduct(id) {
  selectedProduct = produtoPorId(id);

  if (!selectedProduct || selectedProduct.stock <= 0) return;

  closeModal("detail-modal");

  const img = getElement("checkout-img");

  if (img) {
    img.src = selectedProduct.image || "";
    img.alt = selectedProduct.name;
  }

  if (getElement("checkout-product-name"))
    getElement("checkout-product-name").textContent = selectedProduct.name;

  if (getElement("checkout-product-price"))
    getElement("checkout-product-price").textContent = money(selectedProduct.price);

  if (getElement("gift-bag"))
    getElement("gift-bag").checked = false;

  if (getElement("customer-name"))
    getElement("customer-name").value = "";

  if (getElement("customer-note"))
    getElement("customer-note").value = "";

  updateTotal();
  showModal("checkout-modal");
}

function updateTotal() {
  if (!selectedProduct) return;

  const hasGift = getElement("gift-bag")?.checked || false;
  const total = selectedProduct.price + (hasGift ? 7 : 0);

  if (getElement("checkout-total"))
    getElement("checkout-total").textContent = money(total);

  if (getElement("cart-count"))
    getElement("cart-count").textContent = "1";
}

function openCheckout() {
  if (selectedProduct) {
    showModal("checkout-modal");
  } else {
    getElement("colecao")?.scrollIntoView({ behavior: "smooth" });
  }
}

function showModal(id) {
  const modal = getElement(id);
  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const modal = getElement(id);
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".modal-backdrop.open")) {
    document.body.style.overflow = "";
  }
}

function sendOrder() {
  if (!selectedProduct) {
    alert("Escolha um perfume antes de continuar.");
    return;
  }

  const hasGift = getElement("gift-bag")?.checked || false;
  const name = getElement("customer-name")?.value.trim() || "";
  const note = getElement("customer-note")?.value.trim() || "";
  const total = selectedProduct.price + (hasGift ? 7 : 0);

  const lines = [
    "Olá! Vim pelo site da Alison Perfumaria e gostaria de fazer um pedido:",
    `Produto: ${selectedProduct.name}`,
    `Preço: ${money(selectedProduct.price)}`,
    `Bolsa para presente Hinode tamanho P: ${hasGift ? "Sim (+R$ 7,00)" : "Não"}`,
    `Total estimado: ${money(total)}`,
    name ? `Nome: ${name}` : "",
    note ? `Observação: ${note}` : "",
    "Pode confirmar a disponibilidade, por favor?"
  ].filter(Boolean);

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
    "_blank"
  );
}

document.querySelectorAll(".modal-backdrop").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.open").forEach(modal => {
      closeModal(modal.id);
    });
  }
});

carregarCatalogo();
