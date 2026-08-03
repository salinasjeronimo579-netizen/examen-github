/* ============================================================
    BROKER — JavaScript Unificado
    Usuario + Admin + Panel Control + Caché localStorage
 ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ─── DATOS BASE ─────────────────────────────────────────── */
    const DEFAULT_BOOKS = [
        { id: 1, title: "El Principito", author: "Antoine de Saint-Exupéry", category: "Clásico", price: 24.99, disponible: true, description: "Una historia clásica llena de enseñanzas y fantasía inigualable.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", badge: "Best Seller", destacado: true, novedad: false },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling", category: "Fantasía", price: 34.99, disponible: true, description: "Magia, amistad y aventuras inolvidables en Hogwarts.", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop", badge: "Popular", destacado: true, novedad: false },
        { id: 3, title: "1984", author: "George Orwell", category: "Ficción", price: 19.99, disponible: true, description: "Una novela impactante sobre el control y la libertad.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: true },
        { id: 4, title: "Don Quijote", author: "Miguel de Cervantes", category: "Clásico", price: 29.99, disponible: true, description: "La obra maestra más importante de la literatura española.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop", badge: "Clásico", destacado: true, novedad: false },
        { id: 5, title: "El Nombre de la Rosa", author: "Umberto Eco", category: "Misterio", price: 27.99, disponible: true, description: "Intriga medieval en una abadía llena de secretos.", image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop", badge: "", destacado: false, novedad: true },
        { id: 6, title: "Dune", author: "Frank Herbert", category: "Ciencia Ficción", price: 32.99, disponible: true, description: "Una epopeya interestelar de poder y destino.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: false },
        { id: 7, title: "Cien Años de Soledad", author: "Gabriel García Márquez", category: "Realismo mágico", price: 28.99, disponible: true, description: "La historia de la familia Buendía a lo largo de siete generaciones.", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop", badge: "Premio Nobel", destacado: true, novedad: false },
        { id: 8, title: "El Aleph", author: "Jorge Luis Borges", category: "Cuento", price: 22.99, disponible: true, description: "Cuentos que exploran el infinito, el tiempo y la memoria.", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop", badge: "Novedad", destacado: false, novedad: true }
    ];

    const DEFAULT_USERS = [
        { id: 1, name: "Carlos Gómez", since: "12/01/2026", history: [{ title: "Rayuela", status: "Devuelto", statusColor: "#27ae60" }, { title: "Ficciones", status: "En posesión", statusColor: "#e67e22" }] },
        { id: 2, name: "Ana Martínez", since: "24/02/2026", history: [{ title: "Cien Años de Soledad", status: "Devuelto", statusColor: "#27ae60" }] }
    ];

    /* ─── CACHÉ (localStorage) ────────────────────────────────── */
    function loadCache(key, fallback) {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch { return fallback; }
    }
    function saveCache(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
    }

    let booksData = loadCache('booker_books', DEFAULT_BOOKS);
    let favorites = loadCache('booker_favorites', []);
    let solicitudes = loadCache('booker_solicitudes', []);
    let usersData = loadCache('booker_users', DEFAULT_USERS);

    function syncAll() {
        saveCache('booker_books', booksData);
        saveCache('booker_favorites', favorites);
        saveCache('booker_solicitudes', solicitudes);
        saveCache('booker_users', usersData);
    }

    /* ─── ESTADO ──────────────────────────────────────────────── */
    let currentPage = loadCache('booker_lastPage', 'inicio');
    let currentSearch = '';
    let isAdminMode = false;

    /* ─── REFERENCIAS DOM ─────────────────────────────────────── */
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const booksContainer = document.getElementById('booksContainer');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    const viewAllLink = document.getElementById('viewAllLink');
    const heroCarousel = document.getElementById('heroCarousel');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const toastMsg = document.getElementById('toastMsg');
    const cartBadge = document.getElementById('cartBadge');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerBtn = document.getElementById('cartDrawerBtn');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItemsContainer');
    const cartTotal = document.getElementById('cartTotal');
    const accountBtn = document.getElementById('accountBtn');
    const adminIndicator = document.getElementById('adminIndicator');
    const navbarSubtitle = document.getElementById('navbarSubtitle');
    const footerMode = document.getElementById('footerMode');

    /* ─── TOAST ───────────────────────────────────────────────── */
    let toastTimer;
    function showToast(msg, duration = 2500) {
        clearTimeout(toastTimer);
        toastMsg.textContent = msg;
        toastMsg.classList.add('show');
        toastTimer = setTimeout(() => toastMsg.classList.remove('show'), duration);
    }

    /* ─── CUENTA ──────────────── */
    accountBtn.addEventListener('click', () => {
      showToast('👤 Mi cuenta');
    });

    /* ─── NAVEGACIÓN ──────────────────────────────────────────── */
    function setActivePage(pageId) {
        currentPage = pageId;
        saveCache('broker_lastPage', pageId);
        currentSearch = '';
        searchInput.value = '';

        // Mostrar/ocultar hero SOLO en inicio
        const showHero = (pageId === 'inicio');
        heroCarousel.classList.toggle('hidden', !showHero);

        // Marcar activo en menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === pageId);
        });

        if (window.innerWidth <= 900) closeSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderPage();
    }

    // Clics en menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            setActivePage(item.getAttribute('data-page'));
        });
    });

    // "Ver todo →"
    viewAllLink.addEventListener('click', e => {
        e.preventDefault();
        setActivePage('inicio');
    });

    // Botones del slide que navegan
    document.querySelectorAll('.slide-btn[data-nav]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            setActivePage(btn.getAttribute('data-nav'));
        });
    });

    // Links del footer que navegan
    document.querySelectorAll('footer a[data-nav]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            setActivePage(a.getAttribute('data-nav'));
        });
    });

    /* ─── RENDERIZADO PRINCIPAL ───────────────────────────────── */
    function renderPage() {
      booksContainer.classList.add('page-fade');
      setTimeout(() => booksContainer.classList.remove('page-fade'), 400);

      switch(currentPage) {
        case 'inicio':       renderUserCatalog(booksData);                          break;
        case 'destacados':   renderUserCatalog(booksData.filter(b => b.destacado)); break;
        case 'novedades':    renderUserCatalog(booksData.filter(b => b.novedad));   break;
        case 'favoritos':    renderUserCatalog(booksData.filter(b => favorites.includes(b.id))); break;
        case 'contacto':     renderContacto();   break;
        case 'admin':        renderAdminPanel();  break;
        default:             renderUserCatalog(booksData);
      }

      updateSectionHeader();
    }

    function updateSectionHeader() {
      const headers = {
        'inicio':     ['Nuestro Catálogo',         'Explora toda nuestra colección'],
        'destacados': ['Libros Destacados',         'Los más solicitados en préstamo'],
        'novedades':  ['Novedades',                 'Las últimas incorporaciones'],
        'favoritos':  ['Mis Favoritos',             'Libros que guardaste'],
        'contacto':   ['Contáctanos',               'Estamos para ayudarte'],
        'admin':      ['Panel de Administración',   'Gestión de la biblioteca'],
      };
      const [title, subtitle] = headers[currentPage] || ['Catálogo', ''];
      sectionTitle.textContent = title;
      sectionSubtitle.textContent = subtitle;
      viewAllLink.style.display = ['favoritos','contacto','admin'].includes(currentPage) ? 'none' : 'inline-block';
    }

    /* ─── BÚSQUEDA ────────────────────────────────────────────── */
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        renderPage();
    });
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') { searchInput.value = ''; currentSearch = ''; renderPage(); }
    });

    function applySearch(books) {
        if (!currentSearch) return books;
        return books.filter(b =>
            b.title.toLowerCase().includes(currentSearch) ||
            b.author.toLowerCase().includes(currentSearch) ||
            b.category.toLowerCase().includes(currentSearch)
        );
    }

    /* ─── RENDER: CATÁLOGO USUARIO ────────────────────────────── */
    function renderUserCatalog(books) {
      const filtered = applySearch(books);
      if (filtered.length === 0) {
        booksContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No se encontraron libros.</p></div>`;
        return;
      }
      booksContainer.innerHTML = filtered.map(book => `
        <div class="card">
          <div class="card-img-wrapper">
            ${book.badge ? `<span class="card-badge">${book.badge}</span>` : ''}
            <button class="favorite-icon ${favorites.includes(book.id) ? 'active' : ''}" data-id="${book.id}" title="Favorito">❤️</button>
            <img src="${book.image}" alt="${book.title}" loading="lazy">
            <div class="card-overlay">
              <button class="card-overlay-btn quick-view" data-id="${book.id}">Vista Rápida</button>
            </div>
          </div>
          <div class="card-content">
            <span class="card-category">${book.category}</span>
            <h3>${book.title}</h3>
            <p class="card-author">${book.author}</p>
            <p class="card-desc">${book.description.substring(0,80)}…</p>
            <div class="card-footer">
              <span class="status-text" style="font-size:0.8rem;color:${book.disponible ? '#27ae60' : '#c0392b'}">
                ${book.disponible ? '✅ Disponible' : '🔒 Prestado'}
              </span>
              <button class="card-btn add-to-cart" data-id="${book.id}" ${!book.disponible ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
                Solicitar préstamo
              </button>
            </div>
          </div>
        </div>
      `).join('');

      booksContainer.querySelectorAll('.quick-view').forEach(btn =>
        btn.addEventListener('click', () => openUserModal(booksData.find(b => b.id === +btn.dataset.id)))
      );
      booksContainer.querySelectorAll('.add-to-cart').forEach(btn =>
        btn.addEventListener('click', () => {
          const book = booksData.find(b => b.id === +btn.dataset.id);
          if (book && book.disponible) crearSolicitud(book.id);
        })
      );
      booksContainer.querySelectorAll('.favorite-icon').forEach(btn =>
        btn.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(+btn.dataset.id); })
      );
    }

    /* ─── RENDER: CATÁLOGO ADMIN ──────────────────────────────── */
    function renderAdminCatalog(books) {
        const filtered = applySearch(books);
        if (filtered.length === 0) {
            booksContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No se encontraron registros.</p></div>`;
            return;
        }
        booksContainer.innerHTML = filtered.map(book => `
        <div class="card">
          <div class="card-img-wrapper">
            ${book.badge ? `<span class="card-badge">${book.badge}</span>` : ''}
            <button class="favorite-icon ${favorites.includes(book.id) ? 'active' : ''}" data-id="${book.id}">❤️</button>
            <img src="${book.image}" alt="${book.title}" loading="lazy">
            <div class="card-overlay">
              <button class="card-overlay-btn quick-view-admin" data-id="${book.id}">Vista Rápida</button>
            </div>
          </div>
          <div class="card-content">
            <span class="card-category">${book.category}</span>
            <h3>${book.title}</h3>
            <p class="card-author">${book.author}</p>
            <p class="card-desc">${book.description.substring(0, 80)}…</p>
            <div class="card-footer">
              <div class="status-container">
                <span class="status-light ${book.disponible ? 'online' : 'offline'}"></span>
                <span class="status-text">${book.disponible ? 'Disponible' : 'Prestado'}</span>
              </div>
              <button class="card-btn-reserve gen-sol" data-id="${book.id}" ${!book.disponible ? 'disabled' : ''}>
                ${book.disponible ? 'Generar Solicitud' : 'Prestado'}
              </button>
            </div>
          </div>
        </div>
      `).join('');

        booksContainer.querySelectorAll('.quick-view-admin').forEach(btn =>
            btn.addEventListener('click', () => openAdminModal(booksData.find(b => b.id === +btn.dataset.id)))
        );
        booksContainer.querySelectorAll('.favorite-icon').forEach(btn =>
            btn.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(+btn.dataset.id); })
        );
        booksContainer.querySelectorAll('.gen-sol').forEach(btn =>
            btn.addEventListener('click', () => crearSolicitud(+btn.dataset.id))
        );
    }

    /* ─── RENDER: SOLICITUDES ADMIN ───────────────────────────── */
    function renderAdminSolicitudes() {
        if (solicitudes.length === 0) {
            booksContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>🎉 No hay solicitudes pendientes.</p><small>Ve al catálogo y genera una solicitud desde un libro disponible.</small></div>`;
            return;
        }
        booksContainer.innerHTML = solicitudes.map(sol => {
            const book = booksData.find(b => b.id === sol.bookId);
            if (!book) return '';
            return `
          <div class="card">
            <div class="card-img-wrapper" style="height:160px">
              <img src="${book.image}" alt="${book.title}" loading="lazy">
            </div>
            <div class="card-content">
              <small style="color:#c9a96e;font-weight:bold">ID: #${sol.id}</small>
              <h3>${book.title}</h3>
              <p class="card-author">Por: <strong>${sol.usuario}</strong></p>
              <p style="font-size:0.82rem;color:#666;margin-bottom:1rem">📅 ${sol.fecha}</p>
              <div style="display:flex;gap:0.5rem;border-top:1px solid #ece5d8;padding-top:1rem">
                <button class="admin-btn-accept" data-sol="${sol.id}" data-book="${book.id}">✅ Aceptar</button>
                <button class="admin-btn-decline" data-sol="${sol.id}">❌ Declinar</button>
              </div>
            </div>
          </div>
        `;
        }).join('');

        booksContainer.querySelectorAll('.admin-btn-accept').forEach(btn =>
            btn.addEventListener('click', () => aceptarSolicitud(+btn.dataset.sol, +btn.dataset.book))
        );
        booksContainer.querySelectorAll('.admin-btn-decline').forEach(btn =>
            btn.addEventListener('click', () => declinarSolicitud(+btn.dataset.sol))
        );
    }

    /* ─── RENDER: PANEL CONTROL ───────────────────────────────── */
    function renderAdminPanel() {
      booksContainer.className = 'admin-panel-grid';
      booksContainer.innerHTML = `
        <div class="admin-card" data-modal="modal-add-delete">
          <div class="card-content">
            <span>➕ / ❌</span>
            <h3>Agregar / Eliminar</h3>
            <p>Registra nuevos títulos o remueve libros del catálogo.</p>
            <button class="card-btn">Gestionar</button>
          </div>
        </div>
        <div class="admin-card" data-modal="modal-edit-books">
          <div class="card-content">
            <span>📝</span>
            <h3>Editar Libros</h3>
            <p>Modifica títulos, autores y categorías existentes.</p>
            <button class="card-btn">Modificar</button>
          </div>
        </div>
        <div class="admin-card" data-modal="modal-users-list">
          <div class="card-content">
            <span>👥</span>
            <h3>Usuarios Registrados</h3>
            <p>Ver lista de miembros e historiales de préstamo.</p>
            <button class="card-btn">Ver Usuarios</button>
          </div>
        </div>
        <div class="admin-card solicitudes-inline" style="grid-column:1/-1;background:#fff;border-radius:24px;padding:2rem;box-shadow:0 10px 30px rgba(0,0,0,0.06)">
          <div class="card-content" style="padding:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
              <h3 style="font-size:1.4rem">📋 Solicitudes de Préstamo Pendientes <span id="solCount" style="background:#c9a96e;color:#0d1b2a;font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:20px;margin-left:0.5rem">${solicitudes.length}</span></h3>
            </div>
            <div id="inlineSolicitudes">
              ${solicitudes.length === 0
                ? `<div class="empty-state"><p>🎉 No hay solicitudes pendientes.</p><small>Cuando un usuario solicite un préstamo, aparecerá aquí.</small></div>`
                : solicitudes.map(sol => {
                    const book = booksData.find(b => b.id === sol.bookId);
                    if (!book) return '';
                    return `
                      <div class="prestamo-item" id="sol-inline-${sol.id}" style="align-items:center;gap:1rem;padding:1rem;background:#faf9f6;border-radius:16px;margin-bottom:0.8rem;border:none">
                        <img src="${book.image}" style="width:50px;height:65px;object-fit:cover;border-radius:10px;flex-shrink:0">
                        <div class="prestamo-info" style="flex:1">
                          <p class="prestamo-titulo">${book.title}</p>
                          <p class="prestamo-autor">${book.author}</p>
                          <p class="prestamo-fecha">👤 ${sol.usuario} &nbsp;|&nbsp; 📅 ${sol.fecha}</p>
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-shrink:0">
                          <button class="card-btn inline-accept" style="background:#27ae60;color:white" data-sol="${sol.id}" data-book="${book.id}">✅ Aprobar</button>
                          <button class="card-btn inline-decline" style="background:#c0392b;color:white" data-sol="${sol.id}">❌ Rechazar</button>
                        </div>
                      </div>
                    `;
                  }).join('')
              }
            </div>
          </div>
        </div>
      `;

      booksContainer.querySelectorAll('.admin-card:not(.solicitudes-inline)').forEach(card => {
        card.addEventListener('click', () => openAdminPanelModal(card.dataset.modal));
      });
      booksContainer.querySelectorAll('.inline-accept').forEach(btn =>
        btn.addEventListener('click', () => { aceptarSolicitud(+btn.dataset.sol, +btn.dataset.book); renderPage(); })
      );
      booksContainer.querySelectorAll('.inline-decline').forEach(btn =>
        btn.addEventListener('click', () => { declinarSolicitud(+btn.dataset.sol); renderPage(); })
      );
    }

    /* ─── RENDER: CONTACTO ────────────────────────────────────── */
    function renderContacto() {
        booksContainer.innerHTML = `
        <div class="contact-page" style="grid-column:1/-1">
          <h3>✉️ Contáctanos</h3>
          <input type="text" placeholder="Nombre completo" id="cName">
          <input type="email" placeholder="Correo electrónico" id="cEmail">
          <textarea rows="4" placeholder="Mensaje..." id="cMsg"></textarea>
          <button id="cSend">Enviar mensaje</button>
        </div>
      `;
        document.getElementById('cSend').addEventListener('click', () => {
            const n = document.getElementById('cName').value.trim();
            const e = document.getElementById('cEmail').value.trim();
            const m = document.getElementById('cMsg').value.trim();
            if (!n || !e || !m) { showToast('⚠️ Completa todos los campos'); return; }
            showToast('📨 Mensaje enviado. ¡Gracias!');
            document.getElementById('cName').value = '';
            document.getElementById('cEmail').value = '';
            document.getElementById('cMsg').value = '';
        });
    }

    /* ─── MODAL USUARIO ───────────────────────────────────────── */
    function openUserModal(book) {
      if (!book) return;
      modalBody.innerHTML = `
        <div class="modal-img"><img src="${book.image}" alt="${book.title}"></div>
        <div class="modal-info">
          <h2>${book.title}</h2>
          <p><strong>${book.author}</strong> | ${book.category}</p>
          <div style="margin:0.8rem 0">
            <span style="font-size:1rem;font-weight:bold;color:${book.disponible ? '#27ae60' : '#c0392b'}">
              ${book.disponible ? '✅ Disponible para préstamo' : '🔒 Actualmente prestado'}
            </span>
          </div>
          <p class="modal-desc">${book.description}</p>
          <button class="modal-reserve-btn" data-id="${book.id}" ${!book.disponible ? 'disabled' : ''}>
            ${book.disponible ? '📋 Solicitar Préstamo' : '🔒 No disponible'}
          </button>
        </div>
      `;
      modalOverlay.classList.add('active');
      const btn = modalBody.querySelector('.modal-reserve-btn');
      if (btn && book.disponible) {
        btn.addEventListener('click', () => {
          crearSolicitud(book.id);
          modalOverlay.classList.remove('active');
        });
      }
    }

    /* ─── MODAL ADMIN LIBRO ───────────────────────────────────── */
    function openAdminModal(book) {
        if (!book) return;
        modalBody.innerHTML = `
        <div class="modal-img"><img src="${book.image}" alt="${book.title}"></div>
        <div class="modal-info">
          <h2>${book.title}</h2>
          <p><strong>${book.author}</strong> | ${book.category}</p>
          <div class="status-container" style="margin:1rem 0">
            <span class="status-light ${book.disponible ? 'online' : 'offline'}"></span>
            <span class="status-text">${book.disponible ? 'Disponible para Préstamo' : 'No disponible (Prestado)'}</span>
          </div>
          <p class="modal-desc">${book.description}</p>
          <button class="modal-reserve-btn" ${!book.disponible ? 'disabled' : ''}>
            ${book.disponible ? '📋 Simular Solicitud' : '🔒 Bloqueado (En Préstamo)'}
          </button>
        </div>
      `;
        modalOverlay.classList.add('active');
        const btn = modalBody.querySelector('.modal-reserve-btn');
        if (btn && book.disponible) {
            btn.addEventListener('click', () => {
                crearSolicitud(book.id);
                modalOverlay.classList.remove('active');
            });
        }
    }

    /* ─── MODAL PANEL CONTROL ─────────────────────────────────── */
    function openAdminPanelModal(modalId) {
        // Poblar el modal antes de abrirlo
        if (modalId === 'modal-add-delete') populateAddDeleteModal();
        if (modalId === 'modal-edit-books') populateEditBooksModal();
        if (modalId === 'modal-loan-requests') populateLoanModal();
        if (modalId === 'modal-users-list') populateUsersModal();

        const overlay = document.getElementById(modalId);
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Cerrar todos los modales de panel
    document.querySelectorAll('#modal-add-delete .modal-close, #modal-edit-books .modal-close, #modal-loan-requests .modal-close, #modal-users-list .modal-close').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const overlay = btn.closest('.modal-overlay');
            closeAdminPanelModal(overlay);
        });
    });
    ['modal-add-delete', 'modal-edit-books', 'modal-loan-requests', 'modal-users-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => { if (e.target === el) closeAdminPanelModal(el); });
    });

    function closeAdminPanelModal(overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (overlay.id === 'modal-users-list') {
            document.getElementById('user-history-section').style.display = 'none';
        }
        // Re-render panel por si hay cambios
        if (currentPage === 'admin-panel') renderPage();
    }

    /* ─── POBLAR MODAL AGREGAR/ELIMINAR ───────────────────────── */
    function populateAddDeleteModal() {
        const list = document.getElementById('deleteBookList');
        list.innerHTML = booksData.map(b => `
        <div class="prestamo-item">
          <div class="prestamo-info">
            <p class="prestamo-titulo">${b.title}</p>
            <p class="prestamo-autor">${b.author}</p>
          </div>
          <button class="prestamo-remove del-book" data-id="${b.id}">Eliminar</button>
        </div>
      `).join('');
        list.querySelectorAll('.del-book').forEach(btn => {
            btn.addEventListener('click', () => {
                booksData = booksData.filter(b => b.id !== +btn.dataset.id);
                syncAll();
                showToast('🗑️ Libro eliminado del catálogo');
                populateAddDeleteModal();
            });
        });

        document.getElementById('saveNewBook').onclick = () => {
            const title = document.getElementById('newBookTitle').value.trim();
            const author = document.getElementById('newBookAuthor').value.trim();
            const category = document.getElementById('newBookCategory').value.trim();
            const image = document.getElementById('newBookImage').value.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';
            const desc = document.getElementById('newBookDesc').value.trim();
            if (!title || !author || !category) { showToast('⚠️ Título, autor y categoría son obligatorios'); return; }
            const newBook = { id: Date.now(), title, author, category, price: 0, disponible: true, description: desc || 'Sin descripción.', image, badge: '', destacado: false, novedad: true };
            booksData.push(newBook);
            syncAll();
            showToast(`✅ "${title}" agregado al catálogo`);
            ['newBookTitle', 'newBookAuthor', 'newBookCategory', 'newBookImage', 'newBookDesc'].forEach(id => document.getElementById(id).value = '');
            populateAddDeleteModal();
        };
    }

    /* ─── POBLAR MODAL EDITAR ─────────────────────────────────── */
    function populateEditBooksModal() {
        const list = document.getElementById('editBookList');
        const form = document.getElementById('editBookForm');
        form.style.display = 'none';
        list.innerHTML = booksData.map(b => `
        <div class="prestamo-item">
          <div class="prestamo-info">
            <p class="prestamo-titulo">${b.title}</p>
            <p class="prestamo-autor">${b.author}</p>
          </div>
          <button class="card-btn edit-book-btn" data-id="${b.id}" style="padding:0.3rem 1rem;font-size:0.8rem">Editar</button>
        </div>
      `).join('');
        list.querySelectorAll('.edit-book-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = booksData.find(b => b.id === +btn.dataset.id);
                document.getElementById('editBookId').value = book.id;
                document.getElementById('editBookTitle').value = book.title;
                document.getElementById('editBookAuthor').value = book.author;
                document.getElementById('editBookCategory').value = book.category;
                document.getElementById('editingBookName').textContent = book.title;
                form.style.display = 'block';
                form.scrollIntoView({ behavior: 'smooth' });
            });
        });
        document.getElementById('saveEditBook').onclick = () => {
            const id = +document.getElementById('editBookId').value;
            const book = booksData.find(b => b.id === id);
            if (!book) return;
            book.title = document.getElementById('editBookTitle').value.trim() || book.title;
            book.author = document.getElementById('editBookAuthor').value.trim() || book.author;
            book.category = document.getElementById('editBookCategory').value.trim() || book.category;
            syncAll();
            showToast(`✏️ "${book.title}" actualizado`);
            populateEditBooksModal();
        };
    }

    /* ─── POBLAR MODAL PRÉSTAMOS ──────────────────────────────── */
    function populateLoanModal() {
        const container = document.getElementById('loanRequestsList');
        if (solicitudes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:2rem">No hay solicitudes pendientes.</p>';
            return;
        }
        container.innerHTML = solicitudes.map(sol => {
            const book = booksData.find(b => b.id === sol.bookId);
            if (!book) return '';
            return `
          <div class="prestamo-item" style="flex-direction:column;gap:0.4rem" id="sol-${sol.id}">
            <div style="display:flex;justify-content:space-between;width:100%">
              <p class="prestamo-titulo">${book.title}</p>
              <span style="font-size:0.85rem;color:#c9a96e;font-weight:bold">${sol.usuario}</span>
            </div>
            <p class="prestamo-autor">${book.author}</p>
            <p class="prestamo-fecha">📅 ${sol.fecha}</p>
            <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
              <button class="card-btn" style="background:#27ae60;color:white" data-sol="${sol.id}" data-book="${book.id}">✅ Aprobar</button>
              <button class="card-btn" style="background:#c0392b;color:white" data-sol-decline="${sol.id}">❌ Rechazar</button>
            </div>
          </div>
        `;
        }).join('');

        container.querySelectorAll('[data-sol]').forEach(btn =>
            btn.addEventListener('click', () => { aceptarSolicitud(+btn.dataset.sol, +btn.dataset.book); populateLoanModal(); })
        );
        container.querySelectorAll('[data-sol-decline]').forEach(btn =>
            btn.addEventListener('click', () => { declinarSolicitud(+btn.dataset.solDecline); populateLoanModal(); })
        );
    }

    /* ─── POBLAR MODAL USUARIOS ───────────────────────────────── */
    function populateUsersModal() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = usersData.map(u => `
        <tr>
          <td>${u.name}</td>
          <td>${u.since}</td>
          <td><button class="card-btn btn-history" data-uid="${u.id}" style="padding:0.3rem 0.8rem;font-size:0.8rem">Ver Historial</button></td>
        </tr>
      `).join('');
        tbody.querySelectorAll('.btn-history').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const user = usersData.find(u => u.id === +btn.dataset.uid);
                const section = document.getElementById('user-history-section');
                document.getElementById('history-username').textContent = user.name;
                document.getElementById('userHistoryContent').innerHTML = user.history.map(h => `
            <div class="prestamo-item">
              <div class="prestamo-info">
                <p class="prestamo-titulo">${h.title}</p>
                <p class="prestamo-fecha">Estado: <span style="color:${h.statusColor};font-weight:bold">${h.status}</span></p>
              </div>
            </div>
          `).join('');
                section.style.display = 'block';
                section.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    /* ─── LÓGICA SOLICITUDES ──────────────────────────────────── */
    function crearSolicitud(bookId) {
      const book = booksData.find(b => b.id === bookId);
      if (!book || !book.disponible) return;
      const sol = {
        id: Date.now(),
        bookId,
        usuario: 'usuario_' + Math.floor(Math.random() * 900 + 100),
        fecha: new Date().toLocaleDateString('es-CO')
      };
      solicitudes.push(sol);
      syncAll();
      showToast(`📋 Solicitud enviada para "${book.title}". El admin la revisará pronto.`);
    }

    function aceptarSolicitud(solId, bookId) {
        const book = booksData.find(b => b.id === bookId);
        if (book) { book.disponible = false; }
        solicitudes = solicitudes.filter(s => s.id !== solId);
        syncAll();
        showToast(`✅ Préstamo aprobado: "${book ? book.title : ''}"`);
        if (currentPage === 'admin-solicitudes') renderPage();
    }

    function declinarSolicitud(solId) {
        solicitudes = solicitudes.filter(s => s.id !== solId);
        syncAll();
        showToast('❌ Solicitud rechazada');
        if (currentPage === 'admin-solicitudes') renderPage();
    }

    /* ─── FAVORITOS ───────────────────────────────────────────── */
    function toggleFavorite(bookId) {
        if (favorites.includes(bookId)) {
            favorites = favorites.filter(id => id !== bookId);
            showToast('💔 Eliminado de favoritos');
        } else {
            favorites.push(bookId);
            showToast('❤️ Añadido a favoritos');
        }
        saveCache('broker_favorites', favorites);
        renderPage();
    }

    /* ─── CARRITO ─────────────────────────────────────────────── */
    function addToCart(book) {
        if (!book) return;
        const ex = cart.find(i => i.id === book.id);
        if (ex) ex.quantity++;
        else cart.push({ ...book, quantity: 1 });
        updateCart();
        showToast(`📚 "${book.title}" añadido al carrito`);
    }

    function removeFromCart(id) {
        cart = cart.filter(i => i.id !== id);
        updateCart();
    }

    function updateCart() {
        const total = cart.reduce((s, i) => s + i.quantity, 0);
        cartBadge.textContent = total;
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-state">Tu carrito está vacío</div>';
            cartTotal.textContent = '$0.00';
            return;
        }
        let sum = 0;
        cartItems.innerHTML = cart.map(item => {
            sum += item.price * item.quantity;
            return `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
              <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
            </div>
          </div>
        `;
        }).join('');
        cartTotal.textContent = `$${sum.toFixed(2)}`;
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn =>
            btn.addEventListener('click', () => removeFromCart(+btn.dataset.id))
        );
    }

    cartDrawerBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
    cartClose.addEventListener('click', () => cartDrawer.classList.remove('open'));
    document.getElementById('cartCheckout').addEventListener('click', () => {
        if (cart.length === 0) { showToast('⚠️ El carrito está vacío'); return; }
        showToast('🎉 ¡Compra realizada! Gracias por tu pedido');
        cart = [];
        updateCart();
        cartDrawer.classList.remove('open');
    });

    /* ─── MODAL LIBRO (cerrar) ────────────────────────────────── */
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

    /* ─── CARRUSEL ────────────────────────────────────────────── */
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    let autoplay;

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }
    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }
    function startAuto() { autoplay = setInterval(nextSlide, 6000); }
    function stopAuto() { clearInterval(autoplay); }
    function resetAuto() { stopAuto(); startAuto(); }

    document.getElementById('carouselPrev').addEventListener('click', () => { prevSlide(); resetAuto(); });
    document.getElementById('carouselNext').addEventListener('click', () => { nextSlide(); resetAuto(); });
    indicators.forEach((ind, i) => ind.addEventListener('click', () => { goToSlide(i); resetAuto(); }));
    heroCarousel.addEventListener('mouseenter', stopAuto);
    heroCarousel.addEventListener('mouseleave', startAuto);
    startAuto();

    /* ─── SIDEBAR TOGGLE ──────────────────────────────────────── */
    function closeSidebar() {
        if (window.innerWidth <= 900) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
            menuToggle.classList.remove('active');
        }
    }
    menuToggle.addEventListener('click', e => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        menuToggle.classList.toggle('active');
    });
    document.addEventListener('click', e => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth <= 900) closeSidebar();
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            menuToggle.classList.remove('active');
        }
    });

    /* ─── LOGO → INICIO ───────────────────────────────────────── */
    document.getElementById('logoText').addEventListener('click', () => {
      setActivePage('inicio');
      searchInput.value = '';
      currentSearch = '';
    });

    /* ─── NAVBAR SCROLL SHADOW ────────────────────────────────── */
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    /* ─── INIT ────────────────────────────────────────────────── */
    // Restaurar página guardada (solo si es válida para el modo actual)
    viewAllLink.addEventListener('click', e => {
      e.preventDefault();
      setActivePage('inicio');
    });

    const validPages = ['inicio','destacados','novedades','favoritos','contacto','admin'];
    if (!validPages.includes(currentPage)) currentPage = 'inicio';
    setActivePage(currentPage);
    updateCart();
});