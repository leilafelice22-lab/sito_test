(function () {
  'use strict';

  /* ---------- Dati prodotto ---------- */
  var PRODUCTS = [
    { id: 'P001', name: 'Candela alla lavanda', price: 14.90, category: 'Profumi', color: '#B482AA', desc: 'Candela di cera vegetale con profumo di lavanda, circa 40 ore di durata.' },
    { id: 'P002', name: 'Tazza in ceramica', price: 11.50, category: 'Cucina', color: '#8F9AA5', desc: 'Tazza fatta a mano, finitura opaca, adatta alla lavastoviglie.' },
    { id: 'P003', name: 'Plaid in lana', price: 49.00, category: 'Tessili', color: '#2C2A30', desc: 'Plaid morbido da 130 x 170 cm, ideale per il divano.' },
    { id: 'P004', name: 'Diffusore di essenze', price: 24.90, category: 'Profumi', color: '#B482AA', desc: 'Diffusore a bastoncini con essenza di fiori bianchi.' },
    { id: 'P005', name: 'Quaderno a righe', price: 8.90, category: 'Cartoleria', color: '#8F9AA5', desc: 'Quaderno con copertina rigida e 160 pagine a righe.' },
    { id: 'P006', name: 'Borraccia termica', price: 19.90, category: 'Cucina', color: '#2C2A30', desc: 'Borraccia in acciaio da 500 ml, mantiene la temperatura per 12 ore.' }
  ];

  var CART_KEY = 'casalilla_cart';
  var CURRENCY = 'EUR';

  /* ---------- Utilità ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function fmt(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
  function findProduct(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  /* ---------- dataLayer ---------- */
  function dlPush(obj) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(obj);
  }

  // Per gli eventi ecommerce si svuota prima l'oggetto precedente
  function dlEcommerce(eventName, ecommerce, extra) {
    dlPush({ ecommerce: null });
    var payload = { event: eventName, ecommerce: ecommerce };
    if (extra) { for (var k in extra) { payload[k] = extra[k]; } }
    dlPush(payload);
  }

  function toItem(p, qty, index, listName) {
    var item = {
      item_id: p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      quantity: qty || 1
    };
    if (typeof index === 'number') { item.index = index; }
    if (listName) { item.item_list_name = listName; }
    return item;
  }

  /* ---------- Carrello ---------- */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
  }
  function cartCount() {
    return getCart().reduce(function (s, r) { return s + r.qty; }, 0);
  }
  function updateBadge() {
    var b = $('#cart-badge');
    if (b) { b.textContent = cartCount(); }
  }

  function addToCart(id, qty, listName) {
    var p = findProduct(id);
    if (!p) { return; }
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    var row = cart.filter(function (r) { return r.id === id; })[0];
    if (row) { row.qty += qty; } else { cart.push({ id: id, qty: qty }); }
    saveCart(cart);

    dlEcommerce('add_to_cart', {
      currency: CURRENCY,
      value: +(p.price * qty).toFixed(2),
      items: [toItem(p, qty, undefined, listName)]
    });
  }

  function removeFromCart(id) {
    var p = findProduct(id);
    var cart = getCart();
    var row = cart.filter(function (r) { return r.id === id; })[0];
    if (!row || !p) { return; }
    saveCart(cart.filter(function (r) { return r.id !== id; }));
    dlEcommerce('remove_from_cart', {
      currency: CURRENCY,
      value: +(p.price * row.qty).toFixed(2),
      items: [toItem(p, row.qty)]
    });
  }

  function setQty(id, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    cart.forEach(function (r) { if (r.id === id) { r.qty = qty; } });
    saveCart(cart);
  }

  /* ---------- Header e footer ---------- */
  function renderHeader() {
    var page = document.body.getAttribute('data-page');
    function cls(names) { return names.indexOf(page) > -1 ? ' class="active"' : ''; }
    var el = $('#site-header');
    if (!el) { return; }
    el.innerHTML =
      '<header class="site-header"><div class="container header-inner">' +
      '<a class="logo" href="index.html">Casa <span>Lilla</span></a>' +
      '<nav class="nav" aria-label="Principale">' +
      '<a href="index.html"' + cls(['home']) + '>Home</a>' +
      '<a href="plp.html"' + cls(['plp', 'pdp']) + '>Prodotti</a>' +
      '<a href="contact.html"' + cls(['contact']) + '>Contatti</a>' +
      '<a href="cart.html"' + cls(['cart']) + '>Carrello<span class="badge" id="cart-badge">0</span></a>' +
      '</nav></div></header>';
    updateBadge();
  }

  function renderFooter() {
    var el = $('#site-footer');
    if (!el) { return; }
    el.innerHTML =
      '<footer class="site-footer"><div class="container footer-inner">' +
      '<div><h4>Casa Lilla</h4><p>Sito di test per prove di tagging,<br>dataLayer e gestione del consenso.</p></div>' +
      '<div><h4>Naviga</h4><ul>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="plp.html">Prodotti</a></li>' +
      '<li><a href="cart.html">Carrello</a></li>' +
      '<li><a href="contact.html">Contatti</a></li></ul></div>' +
      '<div><h4>Privacy</h4><ul>' +
      '<li><a href="#" id="open-privacy">Gestisci le preferenze sui cookie</a></li></ul></div>' +
      '</div><div class="container footer-bottom">&copy; ' + new Date().getFullYear() + ' Casa Lilla, sito di test. Nessun acquisto reale.</div></footer>';
  }

  /* ---------- Componenti ---------- */
  function cardHtml(p, listName) {
    return '<article class="card" data-id="' + p.id + '">' +
      '<a href="product.html?id=' + p.id + '" class="thumb" style="background:' + p.color + '" data-select-item="' + p.id + '" data-list="' + listName + '" aria-label="' + p.name + '">' + p.name.charAt(0) + '</a>' +
      '<div class="card-body">' +
      '<p class="cat">' + p.category + '</p>' +
      '<h3><a href="product.html?id=' + p.id + '" data-select-item="' + p.id + '" data-list="' + listName + '">' + p.name + '</a></h3>' +
      '<p class="price">' + fmt(p.price) + '</p>' +
      '<button type="button" class="btn btn-small" data-add="' + p.id + '" data-list="' + listName + '">Aggiungi al carrello</button>' +
      '</div></article>';
  }

  function renderList(containerId, products) {
    var box = $(containerId);
    if (!box) { return; }
    var listName = box.getAttribute('data-list-name');
    box.innerHTML = products.map(function (p) { return cardHtml(p, listName); }).join('');

    dlEcommerce('view_item_list', {
      item_list_name: listName,
      items: products.map(function (p, i) { return toItem(p, 1, i, listName); })
    });
  }

  /* ---------- Pagine ---------- */
  function initHome() { renderList('#featured-list', PRODUCTS.slice(0, 3)); }
  function initPlp() { renderList('#product-list', PRODUCTS); }

  function initPdp() {
    var box = $('#product-detail');
    var id = new URLSearchParams(window.location.search).get('id');
    var p = findProduct(id);
    if (!p) {
      box.innerHTML = '<div class="empty"><h2>Prodotto non trovato</h2><p><a class="btn" href="plp.html">Torna ai prodotti</a></p></div>';
      return;
    }
    document.title = p.name + ' | Casa Lilla';
    box.innerHTML =
      '<p class="breadcrumb"><a href="index.html">Home</a> / <a href="plp.html">Prodotti</a> / ' + p.name + '</p>' +
      '<div class="pdp">' +
      '<div class="thumb" style="background:' + p.color + '">' + p.name.charAt(0) + '</div>' +
      '<div>' +
      '<p class="cat">' + p.category + ' &middot; Codice ' + p.id + '</p>' +
      '<h1>' + p.name + '</h1>' +
      '<p class="pdp-price">' + fmt(p.price) + '</p>' +
      '<p>' + p.desc + '</p>' +
      '<div class="qty"><label for="qty" style="margin:0">Quantità</label>' +
      '<input type="number" id="qty" value="1" min="1" max="10"></div>' +
      '<button type="button" class="btn" id="pdp-add" data-add="' + p.id + '" data-list="Scheda prodotto">Aggiungi al carrello</button>' +
      '<div class="notice" id="added-notice" role="status">Prodotto aggiunto. <a href="cart.html">Vai al carrello</a></div>' +
      '</div></div>';

    dlEcommerce('view_item', {
      currency: CURRENCY,
      value: p.price,
      items: [toItem(p, 1)]
    });
  }

  function initCart() {
    var box = $('#cart-content');
    var cart = getCart();

    if (!cart.length) {
      box.innerHTML = '<div class="empty"><h2>Il carrello è vuoto</h2><p>Aggiungi un prodotto per vederlo qui.</p>' +
        '<a class="btn" href="plp.html" data-cta="Vai ai prodotti" data-cta-location="cart_empty">Vai ai prodotti</a></div>';
      return;
    }

    var total = 0;
    var items = [];
    var rows = cart.map(function (r, i) {
      var p = findProduct(r.id);
      if (!p) { return ''; }
      var sub = p.price * r.qty;
      total += sub;
      items.push(toItem(p, r.qty, i));
      return '<div class="cart-row" data-id="' + p.id + '">' +
        '<div class="thumb" style="background:' + p.color + '">' + p.name.charAt(0) + '</div>' +
        '<div><strong>' + p.name + '</strong><br><span class="cat">' + p.category + ' &middot; ' + fmt(p.price) + '</span></div>' +
        '<input type="number" min="1" max="10" value="' + r.qty + '" data-qty="' + p.id + '" aria-label="Quantità di ' + p.name + '" style="width:80px">' +
        '<strong>' + fmt(sub) + '</strong>' +
        '<button type="button" class="link-btn" data-remove="' + p.id + '">Rimuovi</button>' +
        '</div>';
    }).join('');

    box.innerHTML = rows +
      '<div class="cart-total"><span>Totale</span><span>' + fmt(total) + '</span></div>' +
      '<div class="cart-actions">' +
      '<a class="btn btn-outline" href="plp.html">Continua gli acquisti</a>' +
      '<button type="button" class="btn" id="checkout-btn">Procedi al checkout</button></div>' +
      '<p class="feedback" id="checkout-msg" role="status"></p>';

    dlEcommerce('view_cart', { currency: CURRENCY, value: +total.toFixed(2), items: items });
  }

  function initContact() {
    var form = $('#contact-form');
    var fb = $('#form-feedback');
    var started = false;
    if (!form) { return; }

    form.addEventListener('focusin', function () {
      if (!started) {
        started = true;
        dlPush({ event: 'form_start', form_id: 'contact-form', form_name: 'Contatto' });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fb.className = 'feedback';
      if (!form.checkValidity()) {
        fb.className = 'feedback err';
        fb.textContent = 'Controlla i campi: sono tutti obbligatori e l\'email deve essere valida.';
        dlPush({ event: 'form_error', form_id: 'contact-form', form_name: 'Contatto' });
        return;
      }
      // Nessun dato personale nel dataLayer: si invia solo l'argomento scelto
      dlPush({
        event: 'form_submit',
        form_id: 'contact-form',
        form_name: 'Contatto',
        form_topic: form.topic.value
      });
      fb.className = 'feedback ok';
      fb.textContent = 'Grazie, messaggio ricevuto. In questo sito di test non viene inviato a nessuno.';
      form.reset();
      started = false;
    });
  }

  /* ---------- Eventi globali ---------- */
  function bindGlobalEvents() {
    document.addEventListener('click', function (e) {
      var t = e.target;

      // Apertura delle preferenze cookie (Commanders Act CMP)
      var privacy = t.closest('#open-privacy');
      if (privacy) {
        e.preventDefault();
        if (window.tC && tC.privacy && typeof tC.privacy.showPrivacyCenter === 'function') {
          tC.privacy.showPrivacyCenter();
        } else {
          console.warn('CMP Commanders Act non ancora caricata.');
        }
        return;
      }

      // CTA
      var cta = t.closest('[data-cta]');
      if (cta) {
        dlPush({
          event: 'cta_click',
          cta_text: cta.getAttribute('data-cta'),
          cta_location: cta.getAttribute('data-cta-location') || 'n/d',
          cta_url: cta.getAttribute('href') || ''
        });
      }

      // Link esterni
      var out = t.closest('[data-outbound]');
      if (out) {
        dlPush({
          event: 'outbound_click',
          link_url: out.href,
          link_domain: out.hostname,
          link_text: out.textContent.trim()
        });
      }

      // Selezione prodotto da lista
      var sel = t.closest('[data-select-item]');
      if (sel) {
        var sp = findProduct(sel.getAttribute('data-select-item'));
        var list = sel.getAttribute('data-list');
        if (sp) {
          dlEcommerce('select_item', { item_list_name: list, items: [toItem(sp, 1, undefined, list)] });
        }
      }

      // Aggiungi al carrello
      var add = t.closest('[data-add]');
      if (add) {
        var qtyInput = $('#qty');
        var qty = (add.id === 'pdp-add' && qtyInput) ? qtyInput.value : 1;
        addToCart(add.getAttribute('data-add'), qty, add.getAttribute('data-list'));
        var notice = $('#added-notice');
        if (notice) { notice.classList.add('show'); }
        var original = add.textContent;
        add.textContent = 'Aggiunto';
        setTimeout(function () { add.textContent = original; }, 1200);
      }

      // Rimuovi dal carrello
      var rem = t.closest('[data-remove]');
      if (rem) {
        removeFromCart(rem.getAttribute('data-remove'));
        initCart();
      }

      // Checkout
      if (t.closest('#checkout-btn')) {
        var cart = getCart();
        var total = 0;
        var items = cart.map(function (r, i) {
          var p = findProduct(r.id);
          total += p.price * r.qty;
          return toItem(p, r.qty, i);
        });
        dlEcommerce('begin_checkout', { currency: CURRENCY, value: +total.toFixed(2), items: items });
        var msg = $('#checkout-msg');
        msg.className = 'feedback ok';
        msg.textContent = 'Il checkout non è disponibile: questo è un sito di test.';
      }
    });

    // Modifica quantità nel carrello
    document.addEventListener('change', function (e) {
      var q = e.target.closest('[data-qty]');
      if (q) {
        setQty(q.getAttribute('data-qty'), q.value);
        initCart();
      }
    });
  }

  /* ---------- Avvio ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    bindGlobalEvents();

    var page = document.body.getAttribute('data-page');
    if (page === 'home') { initHome(); }
    if (page === 'plp') { initPlp(); }
    if (page === 'pdp') { initPdp(); }
    if (page === 'cart') { initCart(); }
    if (page === 'contact') { initContact(); }
  });
})();
