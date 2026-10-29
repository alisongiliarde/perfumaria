const products = [
  {
    id: "ez-black",
    name: "EZ Black",
    short: "Eau de Parfum · linha EZ",
    price: 55,
    image: "assets/ez-black.jpg",
    description: "Uma opção de perfil elegante e marcante, com apresentação escura e visual sofisticado. Ideal para quem procura uma fragrância que acompanhe ocasiões especiais ou momentos em que quer transmitir presença. Consulte a embalagem para conferir as notas oficiais e as orientações do fabricante.",
    tag: "Presença marcante"
  },
  {
    id: "ez-vip-black",
    name: "EZ VIP Black",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "assets/ez-vip-black.jpg",
    description: "Com frasco em degradê preto e cinza e a assinatura “Define the Moment”, é uma escolha de estilo moderno para quem gosta de uma apresentação sofisticada. Uma opção para usar em encontros, saídas e ocasiões especiais. Consulte a embalagem para conferir as notas oficiais e as orientações do fabricante.",
    tag: "Estilo sofisticado"
  },
  {
    id: "ez-vip-men",
    name: "EZ VIP Men",
    short: "Eau de Parfum · linha EZ VIP",
    price: 55,
    image: "assets/ez-vip-men.jpg",
    description: "Uma fragrância da linha EZ VIP com frasco branco de visual limpo e contemporâneo. Combina com quem prefere uma apresentação discreta, versátil e elegante, seja para o dia a dia ou para ocasiões especiais. Consulte a embalagem para conferir as notas oficiais e as orientações do fabricante.",
    tag: "Versátil"
  }
];

let selectedProduct = null;
const money = value => value.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});

function renderProducts() {
  document.getElementById("products").innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image" onclick="openDetails('${p.id}')" role="button" tabindex="0" aria-label="Ver detalhes de ${p.name}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.tag}</span>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3><p class="product-subtitle">${p.short}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span><button class="text-btn" onclick="openDetails('${p.id}')">Ver detalhes ↗</button></div>
        <button class="primary-btn full" onclick="chooseProduct('${p.id}')">Quero esse <span>→</span></button>
      </div>
    </article>`).join("");
}

function openDetails(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById("detail-img").src = p.image;
  document.getElementById("detail-img").alt = p.name;
  document.getElementById("detail-title").textContent = p.name;
  document.getElementById("detail-price").textContent = money(p.price);
  document.getElementById("detail-description").textContent = p.description;
  document.getElementById("detail-buy").onclick = () => chooseProduct(id);
  showModal("detail-modal");
}
function chooseProduct(id) {
  selectedProduct = products.find(x => x.id === id);
  if (!selectedProduct) return;
  closeModal("detail-modal");
  document.getElementById("checkout-img").src = selectedProduct.image;
  document.getElementById("checkout-img").alt = selectedProduct.name;
  document.getElementById("checkout-product-name").textContent = selectedProduct.name;
  document.getElementById("checkout-product-price").textContent = money(selectedProduct.price);
  document.getElementById("gift-bag").checked = false;
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-note").value = "";
  updateTotal();
  showModal("checkout-modal");
}
function updateTotal() {
  if (!selectedProduct) return;
  const total = selectedProduct.price + (document.getElementById("gift-bag").checked ? 7 : 0);
  document.getElementById("checkout-total").textContent = money(total);
  document.getElementById("cart-count").textContent = selectedProduct ? "1" : "0";
}
function openCheckout() {
  if (selectedProduct) showModal("checkout-modal");
  else document.getElementById("colecao").scrollIntoView({behavior:"smooth"});
}
function showModal(id) {
  const el = document.getElementById(id);
  el.classList.add("open"); el.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("open"); el.setAttribute("aria-hidden","true");
  if (!document.querySelector(".modal-backdrop.open")) document.body.style.overflow="";
}
function sendOrder() {
  if (!selectedProduct) return;
  if (WHATSAPP_NUMBER.includes("DDDNÚMERO")) {
    alert("O site está quase pronto! Configure seu número de WhatsApp no arquivo script.js antes de publicar.");
    return;
  }
  const gift = document.getElementById("gift-bag").checked;
  const name = document.getElementById("customer-name").value.trim();
  const note = document.getElementById("customer-note").value.trim();
  const total = selectedProduct.price + (gift ? 7 : 0);
  const lines = [
    "Olá! Vim pelo site da perfumaria e gostaria de fazer um pedido:",
    `Produto: ${selectedProduct.name}`,
    `Preço: ${money(selectedProduct.price)}`,
    `Bolsa para presente Hinode tamanho P: ${gift ? "Sim (+R$ 7,00)" : "Não"}`,
    `Total estimado: ${money(total)}`,
    name ? `Nome: ${name}` : "",
    note ? `Observação: ${note}` : "",
    "Pode confirmar a disponibilidade, por favor?"
  ].filter(Boolean);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
}
document.querySelectorAll(".modal-backdrop").forEach(el => el.addEventListener("click", e => {
  if (e.target === el) closeModal(el.id);
}));
document.addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".modal-backdrop.open").forEach(el => closeModal(el.id)); });
renderProducts();