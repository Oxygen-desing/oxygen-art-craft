// Replace with your 10-digit WhatsApp number prefixed with country code (no +, spaces, or dashes)
const OWNER_WHATSAPP_NUMBER = "919876543210";

const CATEGORIES = [
  "All",
  "Mandala Art",
  "Lippan Art",
  "Charcoal",
  "Water Color",
  "Mehndi Art",
  "Alpona"
];

const DEFAULT_ARTWORKS = [
  {
    id: "art-1",
    title: "Sacred Lotus Mandala",
    category: "Mandala Art",
    collection: "MANDALA ART",
    medium: "Pen and Ink",
    size: '12" x 12"',
    price: 3125,
    artist: "Aatmica Ojha",
    location: "India",
    sold: false,
    image: "images/mandala-1.svg",
    description: "Intricate hand-drawn geometric lotus mandala on heavy archival sheet."
  },
  {
    id: "art-2",
    title: "Mirror Clay Lippan Panel",
    category: "Lippan Art",
    collection: "LUXURY ART",
    medium: "Mixed medium",
    size: '18" x 18"',
    price: 63000,
    artist: "Abdulla Pathan",
    location: "India",
    sold: true,
    image: "images/lippan-1.svg",
    description: "Textured mud-and-mirror relief wall art crafted for living or entrance spaces."
  },
  {
    id: "art-3",
    title: "Expressive Charcoal Study",
    category: "Charcoal",
    collection: "PAINTINGS",
    medium: "Pen and Pencil",
    size: '14" x 10"',
    price: 2800,
    artist: "Anand Panchal",
    location: "India",
    sold: false,
    image: "images/charcoal-1.svg",
    description: "Deep matte charcoal shading with high-contrast highlights on textured paper."
  },
  {
    id: "art-4",
    title: "Monsoon Wash Landscape",
    category: "Water Color",
    collection: "PAINTINGS",
    medium: "Water colour on paper",
    size: '10" x 10"',
    price: 3125,
    artist: "Andreas Johansson",
    location: "India",
    sold: false,
    image: "images/watercolor-1.svg",
    description: "Soft transparent watercolor washes capturing calm nature scenery."
  },
  {
    id: "art-5",
    title: "Bridal & Festive Motif Sheet",
    category: "Mehndi Art",
    collection: "AFFORDABLE ART",
    medium: "Pen and Ink",
    size: "S",
    price: 1250,
    artist: "Anjali Rajkumar",
    location: "India",
    sold: true,
    image: "images/mehndi-1.svg",
    description: "Detailed traditional henna pattern design sheet for festive reference or framing."
  },
  {
    id: "art-6",
    title: "Traditional Festive Alpona",
    category: "Alpona",
    collection: "AFFORDABLE ART",
    medium: "Acrylic on canvas",
    size: "M",
    price: 500000,
    artist: "Anshu Pancholi",
    location: "India",
    sold: false,
    image: "images/alpona-1.svg",
    description: "Classic folk floral and swirl alpona artwork inspired by Bengal traditions."
  }
];

const MEDIUM_OPTIONS = [
  "Pastel on paper",
  "Acrylic",
  "Acrylic on board",
  "Acrylic on canvas",
  "Acrylic on Paper",
  "Blow Glass",
  "Brass",
  "Fibre Glass",
  "Mixed media on canvas",
  "Mixed media on paper",
  "Mixed medium",
  "Oil on Canvas",
  "Pen and Ink",
  "Pen and Pencil",
  "Photograph",
  "Photographic mixed media",
  "Water colour on paper"
];

const SIZE_OPTIONS = [
  '18" x 18"',
  '60" x 36"',
  '10" x 10"',
  '12" x 12"',
  '13" x 13"',
  '14" x 10"',
  '14" x 19"',
  '14" x 21"',
  '18" x 14"',
  '18" x 16"',
  "L",
  "M",
  "S"
];

const STORAGE_KEYS = {
  userId: "oac_anon_user_id",
  profile: "oac_user_profile",
  loggedIn: "oac_is_logged_in",
  orders: "oac_user_orders",
  artworks: "oac_custom_artworks",
  region: "oac_region_pref"
};

let state = {
  activePage: "home",
  buyCollection: "SHOP",
  buySort: "price-asc",
  selectedPrices: [],
  selectedArtists: [],
  selectedMediums: [],
  selectedSizes: [],
  authMode: "login",
  searchQuery: "",
  cart: [],
  pendingOrderItems: [],
  activeDetailId: null,
  region: safeStorageGet(STORAGE_KEYS.region, {
    flag: "🇮🇳",
    country: "India",
    currency: "INR",
    symbol: "₹",
    rate: 1
  })
};

function safeStorageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues safely
  }
}

function getAllArtworks() {
  const customArts = safeStorageGet(STORAGE_KEYS.artworks, []);
  return [...DEFAULT_ARTWORKS, ...customArts];
}

function getOrCreateAnonymousUserId() {
  try {
    let existing = localStorage.getItem(STORAGE_KEYS.userId);
    if (!existing) {
      const randomPart = crypto.randomUUID
        ? crypto.randomUUID().split("-")[0]
        : Math.random().toString(36).slice(2, 10);
      existing = `OAC-${randomPart.toUpperCase()}`;
      localStorage.setItem(STORAGE_KEYS.userId, existing);
    }
    return existing;
  } catch {
    return "OAC-GUEST";
  }
}

const currentUserId = getOrCreateAnonymousUserId();

function formatPrice(inrAmount) {
  const base = Number(inrAmount || 0);
  if (state.region.currency === "INR") {
    return `₹ ${base.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR`;
  }
  const converted = (base * Number(state.region.rate || 1)).toFixed(2);
  return `${state.region.symbol}${converted} ${state.region.currency}`;
}

function escapeText(value) {
  return String(value ?? "");
}

/* LIVE WATERCOLOR-LIKE SPLASH CANVAS ON HOME HERO */
function initLiveSplashCanvas() {
  const canvas = document.getElementById("liveSplashCanvas");
  const hero = document.getElementById("heroStage");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const splatters = [
    { xRatio: 0.42, yRatio: 0.56, r: 125, color: "rgba(244, 63, 94, 0.34)", dx: 0.22, dy: -0.14 },
    { xRatio: 0.48, yRatio: 0.44, r: 95, color: "rgba(251, 113, 133, 0.30)", dx: -0.18, dy: 0.16 },
    { xRatio: 0.56, yRatio: 0.40, r: 120, color: "rgba(250, 204, 21, 0.36)", dx: -0.2, dy: -0.12 },
    { xRatio: 0.60, yRatio: 0.52, r: 90, color: "rgba(251, 146, 60, 0.28)", dx: 0.16, dy: 0.18 },
    { xRatio: 0.50, yRatio: 0.50, r: 78, color: "rgba(168, 85, 247, 0.18)", dx: 0.12, dy: -0.1 }
  ];

  let blobs = [];

  function resize() {
    canvas.width = hero.clientWidth || window.innerWidth;
    canvas.height = hero.clientHeight || 520;
    blobs = splatters.map((s) => ({
      x: canvas.width * s.xRatio,
      y: canvas.height * s.yRatio,
      r: s.r,
      color: s.color,
      dx: s.dx,
      dy: s.dy,
      phase: Math.random() * Math.PI * 2
    }));
  }

  resize();
  window.addEventListener("resize", resize);

  function drawOrganicBlob(b) {
    ctx.save();
    ctx.beginPath();
    const points = 14;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * 3 + b.phase) * 0.16 + Math.cos(angle * 2 - b.phase) * 0.1;
      const rad = b.r * wobble;
      const px = b.x + Math.cos(angle) * rad;
      const py = b.y + Math.sin(angle) * rad * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = b.color;
    ctx.filter = "blur(8px)";
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of blobs) {
      b.phase += 0.015;
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < canvas.width * 0.25 || b.x > canvas.width * 0.75) b.dx *= -1;
      if (b.y < canvas.height * 0.2 || b.y > canvas.height * 0.8) b.dy *= -1;
      drawOrganicBlob(b);
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* CLEAN SEPARATE-PAGE SWITCHER */
function switchPage(pageName) {
  const validPages = ["home", "artists", "buy", "sell", "about"];
  const targetPage = validPages.includes(pageName) ? pageName : "home";
  state.activePage = targetPage;

  document.querySelectorAll(".page-view").forEach((sec) => {
    sec.classList.add("hidden");
    sec.classList.remove("page-enter");
  });

  const activeEl = document.getElementById(`view-${targetPage}`);
  if (activeEl) {
    activeEl.classList.remove("hidden");
    void activeEl.offsetWidth;
    activeEl.classList.add("page-enter");
  }

  document.querySelectorAll(".page-nav-btn").forEach((btn) => {
    const isCurrent = btn.dataset.page === targetPage;
    btn.classList.toggle("text-slate-950", isCurrent);
    btn.classList.toggle("underline", isCurrent);
    btn.classList.toggle("underline-offset-8", isCurrent);
  });

  if (targetPage === "home") renderHomeShowcase();
  if (targetPage === "artists") renderArtistsPage();
  if (targetPage === "buy") {
    populateBuyFilterPanels();
    renderBuyCatalog();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildArtworkImageElement(item, heightClass = "h-56") {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.className = `relative w-full ${heightClass} bg-slate-50 overflow-hidden text-left focus:outline-none block`;
  wrap.addEventListener("click", () => openDetailModal(item.id, state.activePage === "buy"));

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.title;
  img.className = "w-full h-full object-cover";
  img.addEventListener("error", () => {
    img.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
          <rect width="480" height="320" fill="#f8fafc"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="16">
            ${escapeText(item.title)}
          </text>
        </svg>`
      );
  });

  wrap.appendChild(img);

  if (item.sold) {
    const soldBadge = document.createElement("span");
    soldBadge.className =
      "absolute top-3 left-3 w-11 h-11 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider";
    soldBadge.textContent = "SOLD";
    wrap.appendChild(soldBadge);
  }

  return wrap;
}

/* CLEAN HOME SHOWCASE (EXHIBIT OF THE MONTH + FEATURED PIECES) */
function renderHomeShowcase() {
  const exhibitBox = document.getElementById("homeExhibitContainer");
  const featuredGrid = document.getElementById("homeFeaturedGrid");
  if (!exhibitBox || !featuredGrid) return;

  const q = state.searchQuery.trim().toLowerCase();
  const arts = getAllArtworks().filter((item) => {
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.artist && item.artist.toLowerCase().includes(q))
    );
  });

  exhibitBox.textContent = "";
  const exhibitItem = arts[0];
  if (exhibitItem) {
    const card = document.createElement("div");
    card.className = "gallery-clean-card space-y-3";

    const imgWrap = buildArtworkImageElement(exhibitItem, "h-72 sm:h-80");
    const artistLine = document.createElement("p");
    artistLine.className = "text-sm font-medium text-slate-800";
    artistLine.textContent = exhibitItem.artist || "Oxygen art & craft";

    const viewLink = document.createElement("button");
    viewLink.type = "button";
    viewLink.className = "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1";
    viewLink.textContent = "VIEW WORK →";
    viewLink.addEventListener("click", () => openDetailModal(exhibitItem.id, false));

    card.append(imgWrap, artistLine, viewLink);
    exhibitBox.appendChild(card);
  }

  featuredGrid.textContent = "";
  const featuredList = arts.slice(1, 5);
  featuredList.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gallery-clean-card flex flex-col items-center text-center space-y-2";

    const imgWrap = buildArtworkImageElement(item, "h-52");

    const titleBtn = document.createElement("button");
    titleBtn.type = "button";
    titleBtn.className = "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 hover:text-slate-950 pt-1";
    titleBtn.textContent = item.title;
    titleBtn.addEventListener("click", () => openDetailModal(item.id, false));

    const artistEl = document.createElement("p");
    artistEl.className = "text-xs italic text-slate-600";
    artistEl.textContent = item.artist || "Oxygen art & craft";

    const priceEl = document.createElement("p");
    priceEl.className = "text-[11px] tracking-wider text-slate-500";
    priceEl.textContent = formatPrice(item.price);

    card.append(imgWrap, titleBtn, artistEl, priceEl);
    featuredGrid.appendChild(card);
  });
}

/* ARTISTS PAGE */
function renderArtistsPage() {
  const grid = document.getElementById("artistsDirectoryGrid");
  if (!grid) return;
  grid.textContent = "";

  const q = state.searchQuery.trim().toLowerCase();
  const arts = getAllArtworks().filter((item) => {
    if (!q) return true;
    return (
      (item.artist && item.artist.toLowerCase().includes(q)) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  arts.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gallery-clean-card bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col";

    const imgWrap = buildArtworkImageElement(item, "h-56");

    const labelBox = document.createElement("div");
    labelBox.className = "py-3 px-4 text-center bg-white";

    const artistNameEl = document.createElement("p");
    artistNameEl.className = "text-xs font-bold uppercase tracking-[0.14em] text-slate-800";
    artistNameEl.textContent = item.artist || "OXYGEN ARTIST";

    labelBox.appendChild(artistNameEl);
    card.append(imgWrap, labelBox);
    grid.appendChild(card);
  });
}

/* BUY PAGE + LEFT SEARCH BY FILTERS */
function populateBuyFilterPanels() {
  const arts = getAllArtworks();
  const artistPanel = document.getElementById("artistPanel");
  const mediumPanel = document.getElementById("mediumPanel");
  const sizePanel = document.getElementById("sizePanel");

  if (artistPanel) {
    artistPanel.textContent = "";
    const uniqueArtists = Array.from(new Set(arts.map((a) => a.artist).filter(Boolean)));
    uniqueArtists.forEach((artistName) => {
      const lbl = document.createElement("label");
      lbl.className = "flex items-center gap-2 cursor-pointer";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "buy-artist-filter rounded";
      cb.value = artistName;
      cb.checked = state.selectedArtists.includes(artistName);
      cb.addEventListener("change", () => {
        state.selectedArtists = Array.from(document.querySelectorAll(".buy-artist-filter:checked")).map((el) => el.value);
        renderBuyCatalog();
      });
      const span = document.createElement("span");
      span.textContent = artistName;
      lbl.append(cb, span);
      artistPanel.appendChild(lbl);
    });
  }

  if (mediumPanel) {
    mediumPanel.textContent = "";
    const uniqueMediums = Array.from(new Set([...MEDIUM_OPTIONS, ...arts.map((a) => a.medium).filter(Boolean)]));
    uniqueMediums.forEach((med) => {
      const lbl = document.createElement("label");
      lbl.className = "flex items-center gap-2 cursor-pointer";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "buy-medium-filter rounded";
      cb.value = med;
      cb.checked = state.selectedMediums.includes(med);
      cb.addEventListener("change", () => {
        state.selectedMediums = Array.from(document.querySelectorAll(".buy-medium-filter:checked")).map((el) => el.value);
        renderBuyCatalog();
      });
      const span = document.createElement("span");
      span.textContent = med;
      lbl.append(cb, span);
      mediumPanel.appendChild(lbl);
    });
  }

  if (sizePanel) {
    sizePanel.textContent = "";
    const uniqueSizes = Array.from(new Set([...SIZE_OPTIONS, ...arts.map((a) => a.size).filter(Boolean)]));
    uniqueSizes.forEach((sz) => {
      const lbl = document.createElement("label");
      lbl.className = "flex items-center gap-2 cursor-pointer";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "buy-size-filter rounded";
      cb.value = sz;
      cb.checked = state.selectedSizes.includes(sz);
      cb.addEventListener("change", () => {
        state.selectedSizes = Array.from(document.querySelectorAll(".buy-size-filter:checked")).map((el) => el.value);
        renderBuyCatalog();
      });
      const span = document.createElement("span");
      span.textContent = sz;
      lbl.append(cb, span);
      sizePanel.appendChild(lbl);
    });
  }
}

function getFilteredBuyArtworks() {
  const q = state.searchQuery.trim().toLowerCase();
  const list = getAllArtworks().filter((item) => {
    const col = state.buyCollection;
    if (col && col !== "SHOP" && col !== "ALL") {
      if (col === "AFFORDABLE ART") {
        if (Number(item.price) > 3500) return false;
      } else if (col === "LUXURY ART") {
        if (Number(item.price) < 4000 && item.collection !== "LUXURY ART") return false;
      } else if (col === "MANDALA ART") {
        if (item.category !== "Mandala Art") return false;
      } else if (item.collection && item.collection !== col) {
        return false;
      }
    }

    if (state.selectedPrices.length > 0) {
      const p = Number(item.price || 0);
      const matchesAnyPrice = state.selectedPrices.some((r) => p >= r.min && p <= r.max);
      if (!matchesAnyPrice) return false;
    }

    if (state.selectedArtists.length > 0 && !state.selectedArtists.includes(item.artist)) {
      return false;
    }

    if (state.selectedMediums.length > 0 && !state.selectedMediums.includes(item.medium)) {
      return false;
    }

    if (state.selectedSizes.length > 0 && !state.selectedSizes.includes(item.size)) {
      return false;
    }

    if (q) {
      const hay = `${item.title} ${item.category} ${item.artist || ""} ${item.medium || ""} ${item.size || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  if (state.buySort === "price-asc") {
    list.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (state.buySort === "price-desc") {
    list.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (state.buySort === "title-asc") {
    list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }

  return list;
}

function createBuyArtworkCard(item) {
  const card = document.createElement("article");
  card.className = "gallery-clean-card bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between";

  const imgWrap = buildArtworkImageElement(item, "h-56");

  const body = document.createElement("div");
  body.className = "p-4 text-center space-y-1";

  const titleBtn = document.createElement("button");
  titleBtn.type = "button";
  titleBtn.className = "block w-full text-center text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-blue-600";
  titleBtn.textContent = item.title;
  titleBtn.addEventListener("click", () => openDetailModal(item.id, true));

  const artistEl = document.createElement("p");
  artistEl.className = "text-xs text-slate-500";
  artistEl.textContent = item.artist || "Oxygen art & craft";

  const priceEl = document.createElement("p");
  priceEl.className = "text-xs font-semibold text-slate-700 pt-0.5";
  priceEl.textContent = formatPrice(item.price);

  const actions = document.createElement("div");
  actions.className = "flex gap-2 pt-3";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "flex-1 py-2 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800";
  addBtn.textContent = "Add to Bag";
  addBtn.addEventListener("click", () => addToCart(item.id, 1));

  const orderBtn = document.createElement("button");
  orderBtn.type = "button";
  orderBtn.className = "flex-1 py-2 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700";
  orderBtn.textContent = "Buy";
  orderBtn.addEventListener("click", () => openOrderModal([{ ...item, qty: 1 }]));

  actions.append(addBtn, orderBtn);
  body.append(titleBtn, artistEl, priceEl, actions);
  card.append(imgWrap, body);
  return card;
}

function renderBuyCatalog() {
  const catalogContainer = document.getElementById("buyCatalogContainer");
  const crumbEl = document.getElementById("buyBreadcrumbCollection");
  if (!catalogContainer) return;

  if (crumbEl) crumbEl.textContent = state.buyCollection;

  catalogContainer.textContent = "";
  const filtered = getFilteredBuyArtworks();

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm";
    empty.textContent = "No drawings matched your selected filters.";
    catalogContainer.appendChild(empty);
    return;
  }

  filtered.forEach((item) => catalogContainer.appendChild(createBuyArtworkCard(item)));
}

/* CART & ORDER FLOW */
function addToCart(artworkId, qtyToAdd = 1) {
  const art = getAllArtworks().find((a) => a.id === artworkId);
  if (!art) return;

  const existing = state.cart.find((c) => c.id === artworkId);
  if (existing) existing.qty += qtyToAdd;
  else state.cart.push({ ...art, qty: qtyToAdd });
  updateCartBadge();
}

function updateCartBadge() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = String(totalQty);
}

function openCartModal() {
  const list = document.getElementById("cartItemsList");
  list.textContent = "";

  if (state.cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-slate-500 text-center py-6";
    empty.textContent = "Your bag is currently empty.";
    list.appendChild(empty);
    document.getElementById("cartTotalText").textContent = formatPrice(0);
    document.getElementById("cartCheckoutBtn").disabled = true;
  } else {
    document.getElementById("cartCheckoutBtn").disabled = false;
    let total = 0;

    state.cart.forEach((item, idx) => {
      total += item.price * item.qty;

      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-2 border border-slate-200 rounded-xl p-3";

      const info = document.createElement("div");
      const name = document.createElement("p");
      name.className = "font-bold text-slate-900";
      name.textContent = item.title;
      const sub = document.createElement("p");
      sub.className = "text-xs text-slate-500";
      sub.textContent = `${formatPrice(item.price)} × ${item.qty}`;
      info.append(name, sub);

      const controls = document.createElement("div");
      controls.className = "flex items-center gap-1.5";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "w-7 h-7 rounded-lg bg-slate-200 font-bold";
      minusBtn.textContent = "-";
      minusBtn.addEventListener("click", () => {
        if (item.qty > 1) item.qty -= 1;
        else state.cart.splice(idx, 1);
        updateCartBadge();
        openCartModal();
      });

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "w-7 h-7 rounded-lg bg-slate-200 font-bold";
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", () => {
        item.qty += 1;
        updateCartBadge();
        openCartModal();
      });

      controls.append(minusBtn, plusBtn);
      row.append(info, controls);
      list.appendChild(row);
    });

    document.getElementById("cartTotalText").textContent = formatPrice(total);
  }

  toggleModal("cartModal", true);
}

function openDetailModal(artworkId, showBuyButtons = true) {
  const item = getAllArtworks().find((a) => a.id === artworkId);
  if (!item) return;

  state.activeDetailId = item.id;
  document.getElementById("detailImg").src = item.image;
  document.getElementById("detailImg").alt = item.title;
  document.getElementById("detailCategory").textContent = item.category;
  document.getElementById("detailPrice").textContent = formatPrice(item.price);
  document.getElementById("detailTitle").textContent = item.title;
  document.getElementById("detailDesc").textContent =
    `${item.description} (Artist: ${item.artist || "Oxygen art & craft"} | Size: ${item.size || "Standard"} | Medium: ${item.medium || item.category})`;

  const buyActions = document.getElementById("detailBuyActions");
  if (buyActions) buyActions.classList.toggle("hidden", !showBuyButtons);

  toggleModal("detailModal", true);
}

function openOrderModal(items) {
  state.pendingOrderItems = items.map((i) => ({ ...i }));
  const profile = safeStorageGet(STORAGE_KEYS.profile, {});

  document.getElementById("clientName").value = profile.name || "";
  document.getElementById("clientPhone").value = profile.phone || "";
  document.getElementById("clientAddress").value = profile.address || "";
  document.getElementById("clientPincode").value = profile.pincode || "";
  document.getElementById("whatsappReadyBox").classList.add("hidden");

  const summary = document.getElementById("orderItemsSummary");
  summary.textContent = "";
  let total = 0;
  state.pendingOrderItems.forEach((it) => {
    total += it.price * it.qty;
    const line = document.createElement("p");
    line.textContent = `• ${it.title} (${it.category}) × ${it.qty} = ${formatPrice(it.price * it.qty)}`;
    summary.appendChild(line);
  });
  const totalLine = document.createElement("p");
  totalLine.className = "font-bold pt-1 text-slate-900";
  totalLine.textContent = `Total: ${formatPrice(total)}`;
  summary.appendChild(totalLine);

  toggleModal("orderModal", true);
}

function setAuthModalMode(mode) {
  state.authMode = mode;
  const nameWrap = document.getElementById("createAccountNameWrap");
  const submitBtn = document.getElementById("loginSubmitBtn");
  const feedbackBox = document.getElementById("loginFeedbackBox");

  if (feedbackBox) feedbackBox.classList.add("hidden");

  if (mode === "create") {
    if (nameWrap) nameWrap.classList.remove("hidden");
    if (submitBtn) submitBtn.textContent = "CREATE ACCOUNT";
  } else if (mode === "signup") {
    if (nameWrap) nameWrap.classList.remove("hidden");
    if (submitBtn) submitBtn.textContent = "SIGN UP";
  } else {
    if (nameWrap) nameWrap.classList.add("hidden");
    if (submitBtn) submitBtn.textContent = "LOGIN";
  }
}

function openVaultModal() {
  document.getElementById("userUniqueIdDisplay").textContent = currentUserId;
  const profile = safeStorageGet(STORAGE_KEYS.profile, {});
  const loggedIn = Boolean(safeStorageGet(STORAGE_KEYS.loggedIn, false));

  const statusEl = document.getElementById("loginStatusBadge");
  if (statusEl) {
    statusEl.textContent = loggedIn && profile.email
      ? `Logged in as ${profile.name || profile.email} (${profile.email})`
      : "Not logged in — enter Email and Password to Login.";
  }

  document.getElementById("loginFullName").value = profile.name || "";
  document.getElementById("loginEmail").value = profile.email || "";
  document.getElementById("loginPassword").value = "";
  setAuthModalMode("login");

  const ordersList = document.getElementById("vaultOrdersList");
  ordersList.textContent = "";
  const orders = safeStorageGet(STORAGE_KEYS.orders, []);

  if (orders.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No orders placed yet under this ID.";
    ordersList.appendChild(empty);
  } else {
    orders.slice().reverse().forEach((ord) => {
      const card = document.createElement("div");
      card.className = "border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-1";
      const top = document.createElement("p");
      top.className = "font-bold text-slate-800";
      top.textContent = `${ord.itemsText} — ${formatPrice(ord.total)}`;
      const addr = document.createElement("p");
      addr.textContent = `Deliver to: ${ord.client.name} (${ord.client.phone}), ${ord.client.address} - ${ord.client.pincode}`;
      card.append(top, addr);
      ordersList.appendChild(card);
    });
  }

  toggleModal("vaultModal", true);
}

function toggleModal(modalId, show) {
  const el = document.getElementById(modalId);
  if (!el) return;
  if (show) {
    el.classList.remove("hidden");
    el.classList.add("flex");
  } else {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }
}

function updateRegionButtonUI() {
  document.getElementById("regionFlag").textContent = state.region.flag;
  document.getElementById("regionCode").textContent = state.region.currency;
}

document.addEventListener("DOMContentLoaded", () => {
  initLiveSplashCanvas();
  updateRegionButtonUI();
  updateCartBadge();
  renderHomeShowcase();

  document.querySelectorAll(".page-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.page;
      if (target === "home") {
        state.searchQuery = "";
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";
      }
      if (target === "buy") {
        state.buyCollection = "SHOP";
      }
      switchPage(target);
    });
  });

  document.getElementById("brandHomeBtn").addEventListener("click", () => {
    switchPage("home");
  });

  const buyArrowBtn = document.getElementById("buyDropdownArrowBtn");
  const buyDropdownMenu = document.getElementById("buyDropdownMenu");
  if (buyArrowBtn && buyDropdownMenu) {
    buyArrowBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = buyDropdownMenu.classList.toggle("hidden");
      buyArrowBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#buyNavDropdownWrap")) {
        buyDropdownMenu.classList.add("hidden");
        buyArrowBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".buy-dropdown-item").forEach((itemBtn) => {
      itemBtn.addEventListener("click", () => {
        state.buyCollection = itemBtn.dataset.buyFilter || "SHOP";
        buyDropdownMenu.classList.add("hidden");
        switchPage("buy");
      });
    });
  }

  document.querySelectorAll(".filter-accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.filterToggle);
      const signEl = document.getElementById(btn.dataset.signId);
      if (!panel) return;
      const nowHidden = panel.classList.toggle("hidden");
      if (signEl) signEl.textContent = nowHidden ? "+" : "-";
    });
  });

  document.querySelectorAll(".buy-price-filter").forEach((cb) => {
    cb.addEventListener("change", () => {
      state.selectedPrices = Array.from(document.querySelectorAll(".buy-price-filter:checked")).map((el) => ({
        min: Number(el.dataset.min),
        max: Number(el.dataset.max)
      }));
      renderBuyCatalog();
    });
  });

  document.getElementById("clearBuyFiltersBtn").addEventListener("click", () => {
    state.buyCollection = "SHOP";
    state.selectedPrices = [];
    state.selectedArtists = [];
    state.selectedMediums = [];
    state.selectedSizes = [];
    document.querySelectorAll(".buy-price-filter, .buy-artist-filter, .buy-medium-filter, .buy-size-filter").forEach((el) => {
      el.checked = false;
    });
    renderBuyCatalog();
  });

  document.getElementById("buySortSelect").addEventListener("change", (e) => {
    state.buySort = e.target.value;
    renderBuyCatalog();
  });

  document.getElementById("toggleSearchBarBtn").addEventListener("click", () => {
    const panel = document.getElementById("searchBarPanel");
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      document.getElementById("searchInput").focus();
    }
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (state.activePage === "buy") renderBuyCatalog();
    else if (state.activePage === "artists") renderArtistsPage();
    else renderHomeShowcase();
  });

  const regionBtn = document.getElementById("regionBtn");
  const regionMenu = document.getElementById("regionMenu");
  regionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    regionMenu.classList.toggle("hidden");
  });

  document.querySelectorAll(".region-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      state.region = {
        flag: opt.dataset.flag,
        country: opt.dataset.country,
        currency: opt.dataset.currency,
        symbol: opt.dataset.symbol,
        rate: Number(opt.dataset.rate || 1)
      };
      safeStorageSet(STORAGE_KEYS.region, state.region);
      updateRegionButtonUI();
      regionMenu.classList.add("hidden");
      renderHomeShowcase();
      renderBuyCatalog();
      updateCartBadge();
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#regionBtn") && !e.target.closest("#regionMenu")) {
      regionMenu.classList.add("hidden");
    }
  });

  document.getElementById("sellSubmissionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const statusBox = document.getElementById("sellStatusMessage");

    const artistName = document.getElementById("sellArtistName").value.trim();
    const sellerLocation = document.getElementById("sellArtistLocation").value.trim();
    const artSize = document.getElementById("sellArtSize").value.trim();
    const artMedium = document.getElementById("sellArtMedium").value.trim();
    const expectedPrice = Number(document.getElementById("sellArtPrice").value);
    const agreed = document.getElementById("sellCriteriaAgree").checked;
    const yourName = document.getElementById("sellYourName").value.trim();
    const yourPhone = document.getElementById("sellYourPhone").value.trim();
    const yourEmail = document.getElementById("sellYourEmail").value.trim();
    const notes = document.getElementById("sellAdditionalNotes").value.trim();

    if (!agreed || !artistName || !sellerLocation || !artSize || !artMedium || !expectedPrice || !yourName || !yourPhone || !yourEmail) {
      statusBox.className = "text-xs font-semibold p-3 rounded-xl bg-rose-100 text-rose-900";
      statusBox.textContent = "Please fill in all required fields and check the confirmation box.";
      statusBox.classList.remove("hidden");
      return;
    }

    const categoryGuess = CATEGORIES.find((c) => c !== "All" && artMedium.toLowerCase().includes(c.toLowerCase().split(" ")[0])) || "Mandala Art";
    const newArtwork = {
      id: `sell-${Date.now().toString().slice(-6)}`,
      title: `${artistName} — ${artMedium}`,
      category: categoryGuess,
      collection: "ALL",
      artist: artistName,
      location: sellerLocation,
      size: artSize,
      medium: artMedium,
      price: expectedPrice,
      sold: false,
      image: "images/mandala-1.jpg",
      description: `${notes || "Submitted via Sell form."} | Seller: ${yourName} (${yourPhone}, ${yourEmail}) | Location: ${sellerLocation}`
    };

    const existingCustom = safeStorageGet(STORAGE_KEYS.artworks, []);
    existingCustom.push(newArtwork);
    safeStorageSet(STORAGE_KEYS.artworks, existingCustom);

    e.target.reset();
    statusBox.className = "text-xs font-semibold p-3 rounded-xl bg-emerald-100 text-emerald-900";
    statusBox.textContent = "Artwork submission saved and added to the gallery!";
    statusBox.classList.remove("hidden");

    populateBuyFilterPanels();
    renderHomeShowcase();
    renderBuyCatalog();
    renderArtistsPage();
  });

  document.getElementById("closeDetailBtn").addEventListener("click", () => toggleModal("detailModal", false));
  document.getElementById("detailAddCartBtn").addEventListener("click", () => {
    if (state.activeDetailId) {
      addToCart(state.activeDetailId, 1);
      toggleModal("detailModal", false);
    }
  });
  document.getElementById("detailOrderNowBtn").addEventListener("click", () => {
    const item = getAllArtworks().find((a) => a.id === state.activeDetailId);
    if (item) {
      toggleModal("detailModal", false);
      openOrderModal([{ ...item, qty: 1 }]);
    }
  });

  document.getElementById("openCartBtn").addEventListener("click", openCartModal);
  document.getElementById("closeCartBtn").addEventListener("click", () => toggleModal("cartModal", false));
  document.getElementById("cartCheckoutBtn").addEventListener("click", () => {
    if (state.cart.length > 0) {
      toggleModal("cartModal", false);
      openOrderModal(state.cart);
    }
  });

  document.getElementById("closeOrderBtn").addEventListener("click", () => toggleModal("orderModal", false));

  document.getElementById("orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const client = {
      name: document.getElementById("clientName").value.trim(),
      phone: document.getElementById("clientPhone").value.trim(),
      address: document.getElementById("clientAddress").value.trim(),
      pincode: document.getElementById("clientPincode").value.trim()
    };

    const existingProfile = safeStorageGet(STORAGE_KEYS.profile, {});
    safeStorageSet(STORAGE_KEYS.profile, { ...existingProfile, ...client });

    const total = state.pendingOrderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const itemsText = state.pendingOrderItems
      .map((i) => `${i.title} [${i.category}] x${i.qty} (${formatPrice(i.price * i.qty)})`)
      .join(", ");

    const orders = safeStorageGet(STORAGE_KEYS.orders, []);
    orders.push({
      id: `ORD-${Date.now().toString().slice(-6)}`,
      userId: currentUserId,
      client,
      itemsText,
      total,
      createdAt: new Date().toISOString()
    });
    safeStorageSet(STORAGE_KEYS.orders, orders);

    const photoLines = state.pendingOrderItems
      .map((i) => `- ${i.title}: ${window.location.origin}/${escapeText(i.image)}`)
      .join("\n");

    const message = [
      "New Order — Oxygen art & craft",
      `User ID: ${currentUserId}`,
      `Client Name: ${client.name}`,
      `Phone: ${client.phone}`,
      `Address: ${client.address}`,
      `PIN Code: ${client.pincode}`,
      `Drawings: ${itemsText}`,
      `Total Amount: ${formatPrice(total)}`,
      `Region/Currency: ${state.region.flag} ${state.region.country} (${state.region.currency})`,
      "Drawing Photo Links:",
      photoLines
    ].join("\n");

    document.getElementById("whatsappPreviewText").textContent = message;
    document.getElementById("whatsappSendLink").href =
      `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    document.getElementById("whatsappReadyBox").classList.remove("hidden");
  });

  document.getElementById("vaultBtn").addEventListener("click", openVaultModal);
  document.getElementById("closeVaultBtn").addEventListener("click", () => toggleModal("vaultModal", false));
  document.getElementById("returnToStoreBtn").addEventListener("click", () => {
    toggleModal("vaultModal", false);
    switchPage("home");
  });

  document.getElementById("switchToSignUpBtn").addEventListener("click", () => setAuthModalMode("signup"));
  document.getElementById("switchToCreateAccountBtn").addEventListener("click", () => setAuthModalMode("create"));

  document.getElementById("forgotPasswordBtn").addEventListener("click", () => {
    const emailVal = document.getElementById("loginEmail").value.trim();
    const feedbackBox = document.getElementById("loginFeedbackBox");
    if (!feedbackBox) return;
    feedbackBox.classList.remove("hidden");
    feedbackBox.textContent = emailVal
      ? `Password reset instructions prepared for ${emailVal}.`
      : "Enter your Email first and then click Forgot Password.";
  });

  document.getElementById("loginAuthForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const fullName = document.getElementById("loginFullName").value.trim();
    const feedbackBox = document.getElementById("loginFeedbackBox");

    if (!email || !password) return;

    const existingProfile = safeStorageGet(STORAGE_KEYS.profile, {});
    const updatedProfile = {
      ...existingProfile,
      name: fullName || existingProfile.name || email.split("@")[0],
      email
    };
    safeStorageSet(STORAGE_KEYS.profile, updatedProfile);
    safeStorageSet(STORAGE_KEYS.loggedIn, true);

    if (feedbackBox) {
      feedbackBox.classList.remove("hidden");
      const actionText =
        state.authMode === "create"
          ? "Account created and logged in"
          : state.authMode === "signup"
            ? "Signed up and logged in"
            : "Logged in successfully";
      feedbackBox.textContent = `${actionText} as ${updatedProfile.name} (${email}).`;
    }

    const statusEl = document.getElementById("loginStatusBadge");
    if (statusEl) {
      statusEl.textContent = `Logged in as ${updatedProfile.name} (${email})`;
    }
  });
});