/* ==========================================================================
   FORNECEDORES TOP BRÁS — APLICATIVO CENTRAL DE FORNECEDORES
   Tela Inicial com 4 Fornecedores em Destaque & Rota GPS Direta
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DATA SOURCE
  const allSuppliers = (typeof FORNECEDORES_DATA !== 'undefined') ? FORNECEDORES_DATA : [];

  // 2. STATE
  let state = {
    currentView: 'home', // 'home' or 'detail'
    activeSupplierId: null,
    search: '',
    category: '',
    onlyFavorites: false,
    favorites: JSON.parse(localStorage.getItem('top_bras_favs') || '[]'),
    mySuppliers: JSON.parse(localStorage.getItem('top_bras_my_suppliers') || '[]'),
    page: 1,
    pageSize: 36,
    initialCount: 4 // Deixa apenas 4 na tela inicial!
  };

  // 3. DOM ELEMENTS
  const homeView = document.getElementById('homeView');
  const detailView = document.getElementById('detailView');
  const btnBackToHome = document.getElementById('btnBackToHome');
  const brandLogoLink = document.getElementById('brandLogoLink');

  // Home elements
  const suppliersGrid = document.getElementById('suppliersGrid');
  const mainSearchInput = document.getElementById('mainSearchInput');
  const heroSearchForm = document.getElementById('heroSearchForm');
  const suppliersTitle = document.getElementById('suppliersTitle');
  const suppliersSubtitle = document.getElementById('suppliersSubtitle');
  const activeFilterBadge = document.getElementById('activeFilterBadge');
  const btnLimparFiltro = document.getElementById('btnLimparFiltro');
  const btnCarregarMais = document.getElementById('btnCarregarMais');
  const loadMoreBox = document.getElementById('loadMoreBox');
  const categoryCards = document.querySelectorAll('.category-photo-card');
  const btnVerTodas = document.getElementById('btnVerTodas');
  const desktopFavCount = document.getElementById('desktopFavCount');
  const navFavoritos = document.getElementById('navFavoritos');
  const bottomNavFavoritos = document.getElementById('bottomNavFavoritos');
  const bottomNavInicio = document.getElementById('bottomNavInicio');
  const bottomNavBuscar = document.getElementById('bottomNavBuscar');
  const bottomNavFornecedores = document.getElementById('bottomNavFornecedores');
  const toast = document.getElementById('toast');

  // Detail elements
  const detailAvatar = document.getElementById('detailAvatar');
  const detailTitle = document.getElementById('detailTitle');
  const detailBadge = document.getElementById('detailBadge');
  const detailItemsList = document.getElementById('detailItemsList');
  const detailZapBtn = document.getElementById('detailZapBtn');
  const detailInstaBtn = document.getElementById('detailInstaBtn');
  const detailGpsBtn = document.getElementById('detailGpsBtn');
  const detailAddMeusFornecedoresBtn = document.getElementById('detailAddMeusFornecedoresBtn');
  const detailToggleFavBtn = document.getElementById('detailToggleFavBtn');
  const detailClassifySelect = document.getElementById('detailClassifySelect');
  const detailNoteTextarea = document.getElementById('detailNoteTextarea');
  const detailSaveNoteBtn = document.getElementById('detailSaveNoteBtn');

  // 4. URL ROUTING & NAVIGATION
  function checkUrlRoute() {
    const path = window.location.pathname;
    const hash = window.location.hash;

    let supplierId = null;
    if (path.startsWith('/fornecedores/')) {
      supplierId = decodeURIComponent(path.replace('/fornecedores/', ''));
    } else if (hash.startsWith('#/fornecedores/')) {
      supplierId = decodeURIComponent(hash.replace('#/fornecedores/', ''));
    }

    if (supplierId) {
      showDetailView(supplierId, false);
    } else {
      showHomeView(false);
    }
  }

  function showHomeView(pushHistory = true) {
    state.currentView = 'home';
    state.activeSupplierId = null;
    homeView.style.display = 'block';
    detailView.style.display = 'none';

    if (pushHistory) {
      window.history.pushState({ view: 'home' }, '', '/');
    }
    renderSuppliers();
  }

  function showDetailView(supplierId, pushHistory = true) {
    const s = allSuppliers.find(item => item.id == supplierId || item.id === supplierId);
    if (!s) {
      showHomeView(true);
      return;
    }

    state.currentView = 'detail';
    state.activeSupplierId = s.id;
    homeView.style.display = 'none';
    detailView.style.display = 'block';

    if (pushHistory) {
      window.history.pushState({ view: 'detail', id: s.id }, '', `/fornecedores/${s.id}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    populateDetailView(s);
  }

  // 5. POPULATE DETAIL VIEW
  function populateDetailView(s) {
    const initials = (s.nome || 'SP').slice(0, 2).toUpperCase();
    detailAvatar.textContent = initials;
    detailTitle.textContent = s.nome;
    detailBadge.textContent = s.categoria_principal || 'Atacado';

    // Address & GPS
    const rawAddr = s.endereco || (s.location || 'Brás — São Paulo / SP');
    let destination = rawAddr;
    if (!destination.toLowerCase().includes('são paulo') && !destination.toLowerCase().includes('sp')) {
      destination += ', São Paulo, SP';
    }
    const mapsUrl = s.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

    // Build Detail Items (Exact Vercel layout)
    const prods = (s.produtos && s.produtos.length > 0) ? s.produtos.join(', ') : 'Veja o catálogo nos canais do fornecedor';
    const subcats = (s.subcategorias && s.subcategorias.length > 0) ? s.subcategorias.join(', ') : 'Consulte as opções disponíveis';
    const tel = s.telefone_principal || s.whatsapp || 'Não informado';
    const zap = s.whatsapp || 'Não informado';
    const insta = s.instagram ? `@${s.instagram}` : 'Não informado';
    const endereco = s.endereco || 'Brás — São Paulo / SP';
    const minOrder = s.pedido_minimo || 'Confirme diretamente antes da compra';
    const priceRange = s.faixa_preco || 'Solicite a tabela atual ao fornecedor';
    const payments = (s.formas_pagamento && s.formas_pagamento.length > 0) ? s.formas_pagamento.join(', ') : 'Confirme durante a negociação';
    const shipping = (s.formas_envio && s.formas_envio.length > 0) ? s.formas_envio.join(', ') : 'Consulte as opções de entrega';
    const location = (s.cidade ? `${s.cidade} - ${s.estado || 'SP'}` : 'São Paulo - SP');
    const type = s.atacado_varejo || 'Atacado';

    detailItemsList.innerHTML = `
      <div class="detail-item"><span>Produtos</span><b>${prods}</b></div>
      <div class="detail-item"><span>Subcategorias</span><b>${subcats}</b></div>
      <div class="detail-item"><span>Telefone</span><b>${tel}</b></div>
      <div class="detail-item"><span>WhatsApp</span><b>${zap}</b></div>
      <div class="detail-item"><span>Instagram</span><b>${insta}</b></div>
      <div class="detail-item"><span>Endereço</span><b>${endereco}</b></div>
      <div class="detail-item"><span>Pedido mínimo</span><b>${minOrder}</b></div>
      <div class="detail-item"><span>Faixa de preço</span><b>${priceRange}</b></div>
      <div class="detail-item"><span>Formas de pagamento</span><b>${payments}</b></div>
      <div class="detail-item"><span>Formas de envio</span><b>${shipping}</b></div>
      <div class="detail-item"><span>Localização</span><b>${location}</b></div>
      <div class="detail-item"><span>Atacado / varejo</span><b>${type}</b></div>
    `;

    // Action buttons
    if (s.whatsapp) {
      const cleanZap = s.whatsapp.replace(/\D/g, '');
      detailZapBtn.href = `https://wa.me/${cleanZap.startsWith('55') ? cleanZap : '55' + cleanZap}`;
      detailZapBtn.style.display = 'inline-flex';
    } else {
      detailZapBtn.style.display = 'none';
    }

    if (s.instagram) {
      detailInstaBtn.href = `https://instagram.com/${s.instagram.replace('@', '')}`;
      detailInstaBtn.style.display = 'inline-flex';
    } else {
      detailInstaBtn.style.display = 'none';
    }

    // GPS Navigation Button
    detailGpsBtn.href = mapsUrl;
    detailGpsBtn.setAttribute('title', `Traçar rota GPS até ${s.nome}`);

    // Update Favorites button state
    const isFav = state.favorites.includes(s.id);
    detailToggleFavBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#d05e66' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
      ${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    `;

    // Update My Suppliers button state
    const isMySupplier = state.mySuppliers.includes(s.id);
    detailAddMeusFornecedoresBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-check"><path d="m16 16 2 2 4-4"></path><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="m7.5 4.27 9 5.15"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" x2="12" y1="22" y2="12"></line></svg>
      ${isMySupplier ? 'Remover dos meus fornecedores' : 'Adicionar aos meus fornecedores'}
    `;

    // Load saved notes & status
    const savedNote = localStorage.getItem(`top_bras_note_${s.id}`) || '';
    detailNoteTextarea.value = savedNote;

    const savedStatus = localStorage.getItem(`top_bras_status_${s.id}`) || '';
    if (savedStatus) {
      detailClassifySelect.value = savedStatus;
    } else {
      detailClassifySelect.selectedIndex = 0;
    }
  }

  // 6. FILTERING LOGIC
  function getFilteredList() {
    let list = allSuppliers;

    if (state.onlyFavorites) {
      list = list.filter(s => state.favorites.includes(s.id));
    } else if (state.category) {
      const catLower = state.category.toLowerCase().trim();
      list = list.filter(s => 
        (s.categoria_principal && s.categoria_principal.toLowerCase().includes(catLower)) ||
        (s.category && s.category.toLowerCase().includes(catLower)) ||
        (s.subcategorias && s.subcategorias.some(sub => sub.toLowerCase().includes(catLower)))
      );
    }

    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(s => 
        (s.nome && s.nome.toLowerCase().includes(q)) ||
        (s.categoria_principal && s.categoria_principal.toLowerCase().includes(q)) ||
        (s.instagram && s.instagram.toLowerCase().includes(q)) ||
        (s.whatsapp && s.whatsapp.includes(q)) ||
        (s.endereco && s.endereco.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // 7. RENDER SINGLE CARD (EXACT TO USER SCREENSHOT)
  function renderCard(s) {
    const isFav = state.favorites.includes(s.id);
    const initials = (s.nome || 'SP').slice(0, 2).toUpperCase();
    const hasZap = Boolean(s.whatsapp);
    const hasInsta = Boolean(s.instagram);

    // Links
    const cleanZap = s.whatsapp ? s.whatsapp.replace(/\D/g, '') : '';
    const zapHref = cleanZap ? `https://wa.me/${cleanZap.startsWith('55') ? cleanZap : '55' + cleanZap}` : '#';
    const instaHref = s.instagram ? `https://instagram.com/${s.instagram.replace('@', '')}` : '#';

    // GPS route destination
    const rawAddr = s.endereco || (s.location || 'Brás — São Paulo / SP');
    let destination = rawAddr;
    if (!destination.toLowerCase().includes('são paulo') && !destination.toLowerCase().includes('sp')) {
      destination += ', São Paulo, SP';
    }
    const mapsHref = s.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

    return `
      <article class="supplier-card" data-id="${s.id}">
        <div class="card-head">
          <div class="avatar">${initials}</div>
          <button type="button" aria-label="Favoritar" class="heart ${isFav ? 'on' : ''}" data-fav-id="${s.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </button>
        </div>

        <span class="eyebrow">${s.categoria_principal || 'MODA FEMININA'}</span>
        <h3>${s.nome}</h3>

        <div class="availability">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            WhatsApp
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
            Instagram
          </span>
        </div>

        <div class="card-actions">
          <a class="button secondary btn-open-supplier" href="/fornecedores/${s.id}" data-id="${s.id}">
            Ver fornecedor
          </a>

          <!-- Botão WhatsApp com fundo amarelo suave -->
          <a class="icon-button yellow" href="${zapHref}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="Chamar no WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
          </a>

          <!-- Botão Instagram com fundo rosa suave -->
          <a class="icon-button pink" href="${instaHref}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Ver Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
          </a>

          <!-- Botão GPS (Send / Navigate) com fundo rosa suave levando ao destino exato -->
          <a class="icon-button pink" href="${mapsHref}" target="_blank" rel="noopener noreferrer" aria-label="Como chegar (GPS)" title="Traçar rota no GPS">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>
        </div>
      </article>
    `;
  }

  // 8. RENDER SUPPLIERS GRID
  function renderSuppliers() {
    const list = getFilteredList();

    const isInitialScreen = !state.search && !state.category && !state.onlyFavorites;

    // Headers & Labels
    if (state.onlyFavorites) {
      suppliersTitle.textContent = 'Meus Fornecedores Favoritos';
      suppliersSubtitle.textContent = `${list.length} lojas salvas no seu dispositivo.`;
      activeFilterBadge.style.display = 'inline-block';
      activeFilterBadge.textContent = '⭐ Favoritos';
      btnLimparFiltro.style.display = 'inline-block';
    } else if (state.category) {
      suppliersTitle.textContent = state.category;
      suppliersSubtitle.textContent = `Mostrando fornecedores do segmento (${list.length} encontrados).`;
      activeFilterBadge.style.display = 'inline-block';
      activeFilterBadge.textContent = state.category;
      btnLimparFiltro.style.display = 'inline-block';
    } else if (state.search) {
      suppliersTitle.textContent = `Busca por "${state.search}"`;
      suppliersSubtitle.textContent = `${list.length} fornecedores encontrados.`;
      activeFilterBadge.style.display = 'inline-block';
      activeFilterBadge.textContent = `Busca: ${state.search}`;
      btnLimparFiltro.style.display = 'inline-block';
    } else {
      suppliersTitle.textContent = 'Comece sua pesquisa';
      suppliersSubtitle.textContent = 'Encontre opções para sua loja.';
      activeFilterBadge.style.display = 'none';
      btnLimparFiltro.style.display = 'none';
    }

    // Empty state
    if (list.length === 0) {
      suppliersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px dashed var(--line);">
          <div style="font-size: 40px; margin-bottom: 12px;">🔎</div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">Nenhum fornecedor encontrado</h3>
          <p style="color: var(--muted); font-size: 14px; max-width: 400px; margin: 0 auto 20px;">Tente pesquisar por outro termo ou limpe os filtros para ver todas as opções disponíveis.</p>
          <button type="button" class="button orange" id="btnResetEmpty">Ver todos os fornecedores</button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetEmpty');
      if (btnReset) btnReset.addEventListener('click', resetAllFilters);
      loadMoreBox.style.display = 'none';
      return;
    }

    // "DEIXA APENAS 4 NA TELA INICIAL DO APP"
    let visibleCount = 0;
    if (isInitialScreen) {
      visibleCount = state.page === 1 ? state.initialCount : state.page * state.pageSize;
    } else {
      visibleCount = state.page * state.pageSize;
    }

    const items = list.slice(0, visibleCount);
    suppliersGrid.innerHTML = items.map(renderCard).join('');

    // Load More Button
    if (visibleCount < list.length) {
      loadMoreBox.style.display = 'block';
      btnCarregarMais.textContent = `Carregar mais fornecedores (${list.length - visibleCount} restantes)`;
    } else {
      loadMoreBox.style.display = 'none';
    }

    attachCardEvents();
  }

  // 9. ATTACH CARD EVENTS
  function attachCardEvents() {
    // Open Supplier Detail
    suppliersGrid.querySelectorAll('.btn-open-supplier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        showDetailView(id, true);
      });
    });

    // Heart Favorite Button
    suppliersGrid.querySelectorAll('.heart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fav-id');
        toggleFavorite(id);
      });
    });
  }

  // 10. FAVORITES LOGIC
  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx === -1) {
      state.favorites.push(id);
      showToast('⭐ Fornecedor adicionado aos favoritos!');
    } else {
      state.favorites.splice(idx, 1);
      showToast('Fornecedor removido dos favoritos.');
    }
    localStorage.setItem('top_bras_favs', JSON.stringify(state.favorites));
    updateFavBadges();
    
    if (state.currentView === 'detail' && state.activeSupplierId === id) {
      const s = allSuppliers.find(item => item.id === id);
      if (s) populateDetailView(s);
    } else {
      renderSuppliers();
    }
  }

  function toggleMySuppliers(id) {
    const idx = state.mySuppliers.indexOf(id);
    if (idx === -1) {
      state.mySuppliers.push(id);
      showToast('📦 Adicionado aos seus fornecedores!');
    } else {
      state.mySuppliers.splice(idx, 1);
      showToast('Removido dos seus fornecedores.');
    }
    localStorage.setItem('top_bras_my_suppliers', JSON.stringify(state.mySuppliers));
    const s = allSuppliers.find(item => item.id === id);
    if (s) populateDetailView(s);
  }

  function updateFavBadges() {
    const count = state.favorites.length;
    if (desktopFavCount) desktopFavCount.textContent = count;
  }

  // 11. DETAIL VIEW EVENTS
  if (btnBackToHome) {
    btnBackToHome.addEventListener('click', (e) => {
      e.preventDefault();
      showHomeView(true);
    });
  }

  if (brandLogoLink) {
    brandLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetAllFilters();
      showHomeView(true);
    });
  }

  if (detailToggleFavBtn) {
    detailToggleFavBtn.addEventListener('click', () => {
      if (state.activeSupplierId) toggleFavorite(state.activeSupplierId);
    });
  }

  if (detailAddMeusFornecedoresBtn) {
    detailAddMeusFornecedoresBtn.addEventListener('click', () => {
      if (state.activeSupplierId) toggleMySuppliers(state.activeSupplierId);
    });
  }

  if (detailClassifySelect) {
    detailClassifySelect.addEventListener('change', () => {
      if (state.activeSupplierId) {
        localStorage.setItem(`top_bras_status_${state.activeSupplierId}`, detailClassifySelect.value);
        showToast(`Status definido: ${detailClassifySelect.value}`);
      }
    });
  }

  if (detailSaveNoteBtn) {
    detailSaveNoteBtn.addEventListener('click', () => {
      if (state.activeSupplierId) {
        localStorage.setItem(`top_bras_note_${state.activeSupplierId}`, detailNoteTextarea.value);
        showToast('📝 Anotação salva com sucesso!');
      }
    });
  }

  // 12. TOAST NOTIFICATION
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 13. FILTER TRIGGERS
  function resetAllFilters() {
    state.search = '';
    state.category = '';
    state.onlyFavorites = false;
    state.page = 1;
    if (mainSearchInput) mainSearchInput.value = '';
    renderSuppliers();
  }

  if (btnLimparFiltro) btnLimparFiltro.addEventListener('click', resetAllFilters);
  if (btnVerTodas) {
    btnVerTodas.addEventListener('click', (e) => {
      e.preventDefault();
      state.page = 2; // Expande para ver todos
      resetAllFilters();
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Category Cards Click
  categoryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = card.getAttribute('data-cat');
      state.category = cat;
      state.onlyFavorites = false;
      state.search = '';
      state.page = 1;
      if (mainSearchInput) mainSearchInput.value = '';
      if (state.currentView !== 'home') showHomeView(true);
      renderSuppliers();
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search input & form
  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      state.page = 1;
      if (state.currentView !== 'home') showHomeView(true);
      renderSuppliers();
    });
  }

  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.search = mainSearchInput.value;
      state.page = 1;
      if (state.currentView !== 'home') showHomeView(true);
      renderSuppliers();
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Load more
  if (btnCarregarMais) {
    btnCarregarMais.addEventListener('click', () => {
      state.page++;
      renderSuppliers();
    });
  }

  // Navigation Links
  if (navFavoritos) {
    navFavoritos.addEventListener('click', (e) => {
      e.preventDefault();
      state.onlyFavorites = true;
      state.category = '';
      state.search = '';
      state.page = 1;
      if (state.currentView !== 'home') showHomeView(true);
      renderSuppliers();
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (bottomNavFavoritos) {
    bottomNavFavoritos.addEventListener('click', (e) => {
      e.preventDefault();
      state.onlyFavorites = true;
      state.category = '';
      state.search = '';
      state.page = 1;
      if (state.currentView !== 'home') showHomeView(true);
      renderSuppliers();
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (bottomNavInicio) {
    bottomNavInicio.addEventListener('click', (e) => {
      e.preventDefault();
      resetAllFilters();
      showHomeView(true);
    });
  }

  if (bottomNavBuscar) {
    bottomNavBuscar.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.currentView !== 'home') showHomeView(true);
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
      if (mainSearchInput) mainSearchInput.focus();
    });
  }

  if (bottomNavFornecedores) {
    bottomNavFornecedores.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.currentView !== 'home') showHomeView(true);
      document.getElementById('fornecedoresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Browser Back/Forward navigation
  window.addEventListener('popstate', (e) => {
    checkUrlRoute();
  });

  // INITIAL BOOTSTRAP
  updateFavBadges();
  checkUrlRoute();
});
