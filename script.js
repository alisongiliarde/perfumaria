(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5581999365569";
  const GIFT_PRICE = 7;
  const products = [
    {id:"ez-vip-black",name:"EZ VIP Black",short:"Eau de Parfum · linha EZ VIP",price:60,image:"./Assets/ez-vip-black.jpg",description:"Uma opção de estilo moderno e sofisticado, com apresentação marcante.
Topo: Absinto, anis e erva-doce.
Coração: Lavanda.
Fundo: Casca de baunilha negra e almíscar.
Perfil: aromático, especiado e levemente adocicado.",category:"masculino",tag:"Presença marcante"
},
    {id:"ez-black",name:"EZ Black",short:"Eau de Parfum · linha EZ",price:60,image:"./Assets/ez-black.jpg",description:"Uma fragrância de perfil elegante e marcante, com visual sofisticado.",category:"masculino",tag:"Estilo sofisticado"},
    {id:"ez-vip-men",name:"EZ VIP Men",short:"Eau de Parfum · linha EZ VIP",price:55,image:"./Assets/ez-vip-men.jpg",description:"Uma fragrância contemporânea e versátil para diferentes ocasiões.",category:"masculino",tag:"Versátil"}
  ];

  const $ = id => document.getElementById(id);
  const money = value => Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const requiredIds = ["products","filters","productOverlay","modalClose","modalImg","modalTitle","modalShort","modalPrice","modalDescription","qtyValue","qtyMinus","qtyPlus","addToCart","buyNow","cartBtn","cartOverlay","cartClose","cartItems","cartFooter","cartCount","giftCheck","cartTotal","checkoutBtn","menuBtn","mobileNav"];
  const missing = requiredIds.filter(id => !$(id));
  if (missing.length) {
    console.error("Alison Perfumaria: elementos HTML ausentes:", missing.join(", "));
    return;
  }

  let cart = [];
  let selected = null;
  let quantity = 1;

  function renderProducts(filter="todos") {
    const list = products.filter(p => filter==="todos" || p.category===filter);
    $("products").innerHTML = list.length ? list.map(p => `
      <article class="product-card">
        <button class="product-photo" type="button" data-details="${p.id}" aria-label="Ver detalhes de ${p.name}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.closest('.product-photo').classList.add('image-missing');this.remove();">
          <span class="product-tag">${p.tag}</span>
        </button>
        <div class="product-content">
          <p class="product-kicker">${p.short}</p><h3>${p.name}</h3>
          <div class="product-card-bottom"><strong>${money(p.price)}</strong><button class="details-link" type="button" data-details="${p.id}">Ver detalhes ↗</button></div>
          <button class="button button-dark full" type="button" data-add="${p.id}">Adicionar à sacola</button>
        </div>
      </article>`).join("") : `<p class="empty-catalog">Nenhum perfume cadastrado nesta categoria no momento.</p>`;
  }

  function openProduct(id) {
    selected = products.find(p => p.id === id);
    if (!selected) return;
    quantity = 1;
    $("qtyValue").textContent = String(quantity);
    $("modalImg").src = selected.image;
    $("modalImg").alt = selected.name;
    $("modalTitle").textContent = selected.name;
    $("modalShort").textContent = selected.short;
    $("modalPrice").textContent = money(selected.price);
    $("modalDescription").textContent = selected.description;
    $("productOverlay").classList.add("open");
    $("productOverlay").setAttribute("aria-hidden","false");
    document.body.classList.add("locked");
  }

  function closeProduct() {
    $("productOverlay").classList.remove("open");
    $("productOverlay").setAttribute("aria-hidden","true");
    unlockIfClosed();
  }

  function addToCart(id, qty=1) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const amount = Math.max(1,Math.min(99,Number(qty)||1));
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty = Math.min(99,existing.qty+amount);
    else cart.push({...product,qty:amount});
    renderCart();
    closeProduct();
    openCart();
  }

  function renderCart() {
    const count = cart.reduce((sum,item) => sum+item.qty,0);
    $("cartCount").textContent = String(count);
    $("cartItems").innerHTML = cart.length ? cart.map(item => `
      <div class="cart-row">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-row-info"><b>${item.name}</b><small>${item.qty} × ${money(item.price)}</small><button type="button" data-remove="${item.id}" class="remove-link">Remover</button></div>
        <strong>${money(item.price*item.qty)}</strong>
      </div>`).join("") : `<p class="empty-cart">Sua sacola está vazia.</p>`;
    $("cartFooter").hidden = !cart.length;
    updateTotal();
  }

  function updateTotal() {
    const subtotal = cart.reduce((sum,item) => sum+item.price*item.qty,0);
    $("cartTotal").textContent = money(subtotal+($("giftCheck").checked ? GIFT_PRICE : 0));
  }

  function openCart() {
    $("cartOverlay").classList.add("open");
    $("cartOverlay").setAttribute("aria-hidden","false");
    document.body.classList.add("locked");
  }

  function closeCart() {
    $("cartOverlay").classList.remove("open");
    $("cartOverlay").setAttribute("aria-hidden","true");
    unlockIfClosed();
  }

  function unlockIfClosed() {
    if (!$("cartOverlay").classList.contains("open") && !$("productOverlay").classList.contains("open")) {
      document.body.classList.remove("locked");
    }
  }

  function sendOrder(items=cart) {
    if (!items.length) {
      alert("Adicione pelo menos um perfume à sacola.");
      return;
    }
    const gift = $("giftCheck").checked;
    const name = $("clientName")?.value.trim() || "";
    const note = $("clientNote")?.value.trim() || "";
    const subtotal = items.reduce((sum,item) => sum+item.price*item.qty,0);
    const total = subtotal+(gift ? GIFT_PRICE : 0);
    const lines = [
      "Olá! Vim pelo site da Alison Perfumaria e gostaria de fazer um pedido:",
      ...items.map(item => `${item.name} — ${item.qty} un. — ${money(item.price*item.qty)}`),
      `Embalagem para presente: ${gift ? "Sim (+ R$ 7,00)" : "Não"}`,
      `Total estimado: ${money(total)}`,
      name ? `Nome: ${name}` : "",
      note ? `Observação: ${note}` : "",
      "Pode confirmar a disponibilidade, por favor?"
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    const opened = window.open(url,"_blank");
    if (!opened) window.location.href = url;
  }

  $("products").addEventListener("click",event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const details = target.closest("[data-details]");
    const add = target.closest("[data-add]");
    if (details) openProduct(details.dataset.details);
    else if (add) addToCart(add.dataset.add);
  });

  $("filters").addEventListener("click",event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-filter]");
    if (!button) return;
    $("filters").querySelectorAll(".filter-btn").forEach(item => {
      const active = item === button;
      item.classList.toggle("active",active);
      item.setAttribute("aria-pressed",String(active));
    });
    renderProducts(button.dataset.filter);
  });

  $("modalClose").addEventListener("click",closeProduct);
  $("productOverlay").addEventListener("click",event => {
    if (event.target === $("productOverlay")) closeProduct();
  });
  $("qtyMinus").addEventListener("click",() => {
    quantity = Math.max(1,quantity-1);
    $("qtyValue").textContent = String(quantity);
  });
  $("qtyPlus").addEventListener("click",() => {
    quantity = Math.min(99,quantity+1);
    $("qtyValue").textContent = String(quantity);
  });
  $("addToCart").addEventListener("click",() => {
    if (selected) addToCart(selected.id,quantity);
  });
  $("buyNow").addEventListener("click",() => {
    if (selected) sendOrder([{...selected,qty:quantity}]);
  });
  $("cartBtn").addEventListener("click",openCart);
  $("cartClose").addEventListener("click",closeCart);
  $("cartOverlay").addEventListener("click",event => {
    if (event.target === $("cartOverlay")) closeCart();
  });
  $("cartItems").addEventListener("click",event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-remove]");
    if (!button) return;
    cart = cart.filter(item => item.id !== button.dataset.remove);
    renderCart();
  });
  $("giftCheck").addEventListener("change",updateTotal);
  $("checkoutBtn").addEventListener("click",() => sendOrder());
  $("menuBtn").addEventListener("click",() => {
    const opened = $("mobileNav").classList.toggle("open");
    $("menuBtn").setAttribute("aria-expanded",String(opened));
  });
  $("mobileNav").addEventListener("click",event => {
    if (event.target instanceof Element && event.target.closest("a")) {
      $("mobileNav").classList.remove("open");
      $("menuBtn").setAttribute("aria-expanded","false");
    }
  });
  document.addEventListener("keydown",event => {
    if (event.key === "Escape") {
      closeProduct();
      closeCart();
      $("mobileNav").classList.remove("open");
      $("menuBtn").setAttribute("aria-expanded","false");
    }
  });

  renderProducts();
  renderCart();
})();