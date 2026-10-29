
const WHATSAPP_NUMBER = "5581999365569";

const products = [
  {
    id: "ez-vip-black",
    name: "EZ VIP Black",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "Assets/ez-vip-black.jpg",
    description: "Com frasco em degradê preto e cinza e a assinatura Define the Moment, é uma opção de estilo moderno e sofisticado. Consulte a embalagem para conferir as informações oficiais do fabricante.",
    tag: "Estilo sofisticado"
  },
  {
    id: "ez-black",
    name: "EZ Black",
    short: "Eau de Parfum · linha EZ",
    price: 55,
    image: "Assets/ez-black.jpg",
    description: "Uma opção de perfil elegante e marcante, com apresentação escura e visual sofisticado. Consulte a embalagem para conferir as informações oficiais do fabricante.",
    tag: "Presença marcante"
  },
  {
    id: "ez-vip-men",
    name: "EZ VIP Men",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "Assets/ez-vip-men.jpg",
    description: "Uma fragrância da linha EZ VIP com frasco branco e visual contemporâneo. Consulte a embalagem para conferir as informações oficiais do fabricante.",
    tag: "Versátil"
  }
];

let selectedProduct = null;

const money = value =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function getElement(id) {
  return document.getElementById(id);
}

function renderProducts() {
  const container = getElement("products");
  if (!container) return;

  container.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image"
           onclick="openDetails('${p.id}')"
           role="button"
           tabindex="0"
           aria-label="Ver detalhes de ${p.name}">
        <img src="${p.image}"
             alt="${p.name}"
             loading="lazy"
             onerror="this.onerror=null;this.alt='Foto indisponível';">
        <span class="product-tag">${p.tag}</span>
      </div>

      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-subtitle">${p.short}</p>

        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="text-btn"
                  onclick="openDetails('${p.id}')">
            Ver detalhes ↗
          </button>
        </div>

        <button class="primary-btn full"
                onclick="chooseProduct('${p.id}')">
          Quero esse <span>→</span>
        </button>
      </div>
    </article>
  `).join("");
}

function openDetails(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  const img = getElement("detail-img");
  if (img) {
    img.src = p.image;
    img.alt = p.name;
  }

  if (getElement("detail-title"))
    getElement("detail-title").textContent = p.name;

  if (getElement("detail-price"))
    getElement("detail-price").textContent = money(p.price);

  if (getElement("detail-description"))
    getElement("detail-description").textContent = p.description;

  const buyButton = getElement("detail-buy");
  if (buyButton) buyButton.onclick = () => chooseProduct(id);

  showModal("detail-modal");
}

function chooseProduct(id) {
  selectedProduct = products.find(item => item.id === id);
  if (!selectedProduct) return;

  closeModal("detail-modal");

  const img = getElement("checkout-img");
  if (img) {
    img.src = selectedProduct.image;
    img.alt = selectedProduct.name;
  }

  if (getElement("checkout-product-name"))
    getElement("checkout-product-name").textContent =
      selectedProduct.name;

  if (getElement("checkout-product-price"))
    getElement("checkout-product-price").textContent =
      money(selectedProduct.price);

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

  const gift = getElement("gift-bag");
  const hasGift = gift ? gift.checked : false;
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
    const collection = getElement("colecao");
    if (collection) {
      collection.scrollIntoView({ behavior: "smooth" });
    }
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

  const gift = getElement("gift-bag");
  const hasGift = gift ? gift.checked : false;

  const name = getElement("customer-name")?.value.trim() || "";
  const note = getElement("customer-note")?.value.trim() || "";

  const total = selectedProduct.price + (hasGift ? 7 : 0);

  const lines = [
    "Olá! Vim pelo site da Alison Perfumaria e gostaria de fazer um pedido:",
    `Produto: ${selectedProduct.name}`,
    `Preço: ${money(selectedProduct.price)}`,
    `Bolsa para presente Hinode tamanho P: ${
      hasGift ? "Sim (+R$ 7,00)" : "Não"
    }`,
    `Total estimado: ${money(total)}`,
    name ? `Nome: ${name}` : "",
    note ? `Observação: ${note}` : "",
    "Pode confirmar a disponibilidade, por favor?"
  ].filter(Boolean);

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${
      encodeURIComponent(lines.join("\n"))
    }`;

  window.open(url, "_blank");
}

document.querySelectorAll(".modal-backdrop").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.open")
      .forEach(modal => closeModal(modal.id));
  }
});

renderProducts();
