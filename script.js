const WHATSAPP_NUMBER = "5581999365569";
const GIFT_PRICE = 7;
const products = [
  { id:"ez-vip-black", name:"EZ VIP Black", short:"Eau de Parfum · linha EZ VIP", price:60, image:"Assets/ez-vip-black.jpg", description:"Uma opção de estilo moderno e sofisticado, com apresentação marcante." , category:"masculino", tag:"Presença marcante" },
  { id:"ez-black", name:"EZ Black", short:"Eau de Parfum · linha EZ", price:60, image:"Assets/ez-black.jpg", description:"Uma fragrância de perfil elegante e marcante, com visual sofisticado.", category:"masculino", tag:"Estilo sofisticado" },
  { id:"ez-vip-men", name:"EZ VIP Men", short:"Eau de Parfum · linha EZ VIP", price:55, image:"Assets/ez-vip-men.jpg", description:"Uma fragrância contemporânea e versátil para diferentes ocasiões.", category:"masculino", tag:"Versátil" }
];
const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let cart = [];
let selected = null;
let quantity = 1;

function renderProducts(filter="todos") {
  const list = products.filter(p => filter==="todos" || p.category===filter);
  $("products").innerHTML = list.map(p => `
    <article class="product-card">
      <button class="product-photo" data-details="${p.id}" aria-label="Ver ${p.name}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.12';">
        <span class="product-tag">${p.tag}</span>
      </button>
      <div class="product-content">
        <p class="product-kicker">${p.short}</p><h3>${p.name}</h3>
        <div class="product-card-bottom"><strong>${money(p.price)}</strong><button class="details-link" data-details="${p.id}">Ver detalhes ↗</button></div>
        <button class="button button-dark full" data-add="${p.id}">Adicionar à sacola</button>
      </div>
    </article>`).join("");
}
function openProduct(id) {
  selected=products.find(p=>p.id===id); if(!selected)return;
  quantity=1; $("qtyValue").textContent=quantity;
  $("modalImg").src=selected.image; $("modalImg").alt=selected.name;
  $("modalTitle").textContent=selected.name; $("modalShort").textContent=selected.short;
  $("modalPrice").textContent=money(selected.price); $("modalDescription").textContent=selected.description;
  $("productOverlay").classList.add("open"); $("productOverlay").setAttribute("aria-hidden","false");
  document.body.classList.add("locked");
}
function closeProduct(){ $("productOverlay").classList.remove("open"); $("productOverlay").setAttribute("aria-hidden","true"); unlockIfClosed(); }
function addToCart(id,qty=1) {
  const p=products.find(x=>x.id===id); if(!p)return;
  const existing=cart.find(x=>x.id===id);
  if(existing)existing.qty+=qty; else cart.push({...p,qty});
  renderCart(); closeProduct(); openCart();
}
function renderCart(){
  const count=cart.reduce((s,p)=>s+p.qty,0); $("cartCount").textContent=count;
  $("cartItems").innerHTML=cart.length?cart.map(p=>`
    <div class="cart-row"><img src="${p.image}" alt=""><div class="cart-row-info"><b>${p.name}</b><small>${p.qty} × ${money(p.price)}</small><button data-remove="${p.id}" class="remove-link">Remover</button></div><strong>${money(p.price*p.qty)}</strong></div>`).join(""):`<p class="empty-cart">Sua sacola está vazia.</p>`;
  $("cartFooter").hidden=!cart.length; updateTotal();
}
function updateTotal(){const subtotal=cart.reduce((s,p)=>s+p.price*p.qty,0);const total=subtotal+($("giftCheck").checked?GIFT_PRICE:0);$("cartTotal").textContent=money(total);}
function openCart(){ $("cartOverlay").classList.add("open"); $("cartOverlay").setAttribute("aria-hidden","false"); document.body.classList.add("locked");}
function closeCart(){ $("cartOverlay").classList.remove("open"); $("cartOverlay").setAttribute("aria-hidden","true"); unlockIfClosed();}
function unlockIfClosed(){if(!$("cartOverlay").classList.contains("open")&&!$("productOverlay").classList.contains("open"))document.body.classList.remove("locked");}
function sendOrder(items=cart){
  if(!items.length){alert("Adicione pelo menos um perfume à sacola.");return;}
  const gift=$("giftCheck").checked, name=$("clientName").value.trim(), note=$("clientNote").value.trim();
  const subtotal=items.reduce((s,p)=>s+p.price*p.qty,0), total=subtotal+(gift?GIFT_PRICE:0);
  const lines=["Olá! Vim pelo site da Alison Perfumaria e gostaria de fazer um pedido:",...items.map(p=>`${p.name} — ${p.qty} un. — ${money(p.price*p.qty)}`),`Embalagem para presente: ${gift?"Sim (+ R$ 7,00)":"Não"}`,`Total estimado: ${money(total)}`,name?`Nome: ${name}`:"",note?`Observação: ${note}`:"","Pode confirmar a disponibilidade, por favor?"].filter(Boolean);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank","noopener");
}
$("products").addEventListener("click",e=>{const d=e.target.closest("[data-details]"),a=e.target.closest("[data-add]");if(d)openProduct(d.dataset.details);if(a)addToCart(a.dataset.add);});
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;document.querySelectorAll(".filter-btn").forEach(x=>x.classList.toggle("active",x===b));renderProducts(b.dataset.filter);});
$("modalClose").onclick=closeProduct;
$("productOverlay").addEventListener("click",e=>{if(e.target===$("productOverlay"))closeProduct();});
$("qtyMinus").onclick=()=>{quantity=Math.max(1,quantity-1);$("qtyValue").textContent=quantity;};
$("qtyPlus").onclick=()=>{quantity=Math.min(99,quantity+1);$("qtyValue").textContent=quantity;};
$("addToCart").onclick=()=>selected&&addToCart(selected.id,quantity);
$("buyNow").onclick=()=>selected&&sendOrder([{...selected,qty:quantity}]);
$("cartBtn").onclick=openCart; $("cartClose").onclick=closeCart;
$("cartOverlay").addEventListener("click",e=>{if(e.target===$("cartOverlay"))closeCart();});
$("cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(b){cart=cart.filter(p=>p.id!==b.dataset.remove);renderCart();}});
$("giftCheck").onchange=updateTotal; $("checkoutBtn").onclick=()=>sendOrder();
$("menuBtn").onclick=()=> $("mobileNav").classList.toggle("open");
$("mobileNav").addEventListener("click",e=>{if(e.target.tagName==="A")$("mobileNav").classList.remove("open");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeProduct();closeCart();}});
renderProducts();renderCart();