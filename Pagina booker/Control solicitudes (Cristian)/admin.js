/* ============================================================
   BROKER - Librería Clásica | JavaScript de Administración
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- REFERENCIAS ----------
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');
    const searchInput = document.getElementById('searchInput');
    const booksContainer = document.getElementById('booksContainer');
    const menuItems = document.querySelectorAll('.menu-item');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const toastMsg = document.getElementById('toastMsg');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    const viewAllLink = document.getElementById('viewAllLink');

    // ---------- BASE DE DATOS (Todos los libros inicializados en disponible: true) ----------
    const defaultBooks = [
        { id: 1, title: "El Principito", author: "Antoine de Saint-Exupéry", category: "Clásico", disponible: true, description: "Una historia clásica llena de enseñanzas y fantasía inigualable.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", badge: "Best Seller", destacado: true, novedad: false },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling", category: "Fantasía", disponible: true, description: "Magia, amistad y aventuras inolvidables en Hogwarts.", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop", badge: "Popular", destacado: true, novedad: false },
        { id: 3, title: "1984", author: "George Orwell", category: "Ficción", disponible: true, description: "Una novela impactante sobre el control y la libertad.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: true },
        { id: 4, title: "Don Quijote", author: "Miguel de Cervantes", category: "Clásico", disponible: true, description: "La obra maestra más importante de la literatura española.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop", badge: "Clásico", destacado: true, novedad: false },
        { id: 5, title: "El Nombre de la Rosa", author: "Umberto Eco", category: "Misterio", disponible: true, description: "Intriga medieval en una abadía llena de secretos.", image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop", badge: "", destacado: false, novedad: true },
        { id: 6, title: "Dune", author: "Frank Herbert", category: "Ciencia Ficción", disponible: true, description: "Una epopeya interestelar de poder y destino.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: false },
        { id: 7, title: "Cien Años de Soledad", author: "Gabriel García Márquez", category: "Realismo mágico", disponible: true, description: "La historia de la familia Buendía a lo largo de siete generaciones.", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop", badge: "Premio Nobel", destacado: true, novedad: false },
        { id: 8, title: "El Aleph", author: "Jorge Luis Borges", category: "Cuento", disponible: true, description: "Cuentos que exploran el infinito, el tiempo y la memoria.", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop", badge: "Novedad", destacado: false, novedad: true }
    ];

    // Fuerza la actualización si el localStorage tenía estados antiguos "no disponibles" guardados
    let booksData = JSON.parse(localStorage.getItem('broker_admin_books'));
    if (!booksData || booksData.some(b => b.disponible === false && !localStorage.getItem('broker_forced_reset'))) {
        booksData = defaultBooks;
        localStorage.setItem('broker_forced_reset', 'true');
        localStorage.setItem('broker_admin_books', JSON.stringify(booksData));
    }

    let favorites = JSON.parse(localStorage.getItem('broker_favorites')) || [];
    let solicitudes = JSON.parse(localStorage.getItem('broker_admin_solicitudes')) || [];

    let currentPage = 'inicio';
    let currentSearchTerm = '';

    // ---------- FUNCIONES DE PERSISTENCIA Y TOAST ----------
    function syncLocalStorage() {
        localStorage.setItem('broker_admin_books', JSON.stringify(booksData));
        localStorage.setItem('broker_admin_solicitudes', JSON.stringify(solicitudes));
    }

    function showToast(message, duration = 2000) {
        toastMsg.textContent = message;
        toastMsg.classList.add('show');
        setTimeout(() => toastMsg.classList.remove('show'), duration);
    }

    function isFavorite(bookId) { return favorites.includes(bookId); }
    function toggleFavorite(bookId) {
        if (favorites.includes(bookId)) {
            favorites = favorites.filter(id => id !== bookId);
            showToast('❌ Quitado de marcadores de control');
        } else {
            favorites.push(bookId);
            showToast('❤️ Marcado para revisión prioritaria');
        }
        localStorage.setItem('broker_favorites', JSON.stringify(favorites));
        renderBooks();
    }

    // ---------- CONTROLADOR DE SOLICITUDES (ACEPTAR / DECLINAR) ----------
    function aceptarSolicitud(idSolicitud, bookId) {
        const libro = booksData.find(b => b.id === bookId);
        if (libro) {
            libro.disponible = false; // Se marca como NO disponible al otorgar el préstamo
            solicitudes = solicitudes.filter(s => s.idSolicitud !== idSolicitud);
            syncLocalStorage();
            showToast(`✅ Préstamo ACEPTADO para: "${libro.title}"`);
            renderBooks();
        }
    }

    function declinarSolicitud(idSolicitud) {
        solicitudes = solicitudes.filter(s => s.idSolicitud !== idSolicitud);
        syncLocalStorage();
        showToast(`❌ Solicitud denegada y removida de la lista`);
        renderBooks();
    }

    function crearSimulacionSolicitud(bookId) {
        const libro = booksData.find(b => b.id === bookId);
        if (libro && libro.disponible) {
            const nuevaSol = {
                idSolicitud: Date.now() + Math.floor(Math.random() * 100),
                bookId: bookId,
                usuario: "simulador_usuario_" + Math.floor(Math.random() * 100),
                fecha: "Justo ahora"
            };
            solicitudes.push(nuevaSol);
            syncLocalStorage();
            showToast(`🎟️ Solicitud creada para "${libro.title}". Revisa la sección 'Solicitudes'`);
        }
    }

    // ---------- VISTA RÁPIDA (MODAL) ----------
    function openModal(book) {
        modalBody.innerHTML = `
            <div class="modal-img"><img src="${book.image}" alt="${book.title}"></div>
            <div class="modal-info">
                <h2>${book.title}</h2>
                <p><strong>${book.author}</strong> | ${book.category}</p>
                <div class="status-container" style="margin: 1rem 0;">
                    <span class="status-light ${book.disponible ? 'online' : 'offline'}"></span>
                    <span class="status-text">${book.disponible ? 'Disponible para Préstamo' : 'No disponible (Prestado)'}</span>
                </div>
                <p class="modal-desc">${book.description}</p>
                <button class="modal-reserve-btn" ${!book.disponible ? 'disabled' : ''}>
                    ${book.disponible ? 'Simular Entrada de Solicitud' : 'Bloqueado (En Préstamo)'}
                </button>
            </div>
        `;
        modalOverlay.classList.add('active');
        
        const testBtn = modalBody.querySelector('.modal-reserve-btn');
        if (testBtn && book.disponible) {
            testBtn.addEventListener('click', () => {
                crearSimulacionSolicitud(book.id);
                modalOverlay.classList.remove('active');
            });
        }
    }

    // ---------- RENDERIZADO GENERAL ----------
    function renderBooks() {
        let filteredBooks = [...booksData];
        
        // --- VISTA ESPECÍFICA: PANEL DE SOLICITUDES ---
        if (currentPage === 'solicitudes') {
            sectionTitle.textContent = 'Solicitudes de Préstamo Entrantes';
            sectionSubtitle.textContent = 'Cola de aprobación de usuarios para salida de libros';
            viewAllLink.style.display = 'none';

            if (solicitudes.length === 0) {
                booksContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <p style="font-size: 1.3rem; margin-bottom: 0.5rem;">🎉 No hay solicitudes pendientes de aprobación.</p>
                        <small>Puedes ir al catálogo y pulsar "Generar Solicitud" en cualquier libro disponible.</small>
                    </div>`;
                return;
            }

            booksContainer.innerHTML = solicitudes.map(sol => {
                const book = booksData.find(b => b.id === sol.bookId);
                if (!book) return '';
                return `
                    <div class="card spec-admin-card">
                        <div class="card-img-wrapper" style="height: 180px;">
                            <img src="${book.image}" alt="${book.title}">
                        </div>
                        <div class="card-content">
                            <small style="color: #c9a96e; font-weight: bold;">ID SOLICITUD: #${sol.idSolicitud}</small>
                            <h3>${book.title}</h3>
                            <p class="card-author">Solicitado por: <strong>${sol.usuario}</strong></p>
                            <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">Fecha: ${sol.fecha}</p>
                            <div style="display: flex; gap: 0.5rem; border-top: 1px solid #ece5d8; padding-top: 1rem;">
                                <button class="admin-btn-accept" data-sol="${sol.idSolicitud}" data-book="${book.id}">Aceptar</button>
                                <button class="admin-btn-decline" data-sol="${sol.idSolicitud}">Declinar</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.admin-btn-accept').forEach(btn => {
                btn.addEventListener('click', () => {
                    aceptarSolicitud(parseInt(btn.dataset.sol), parseInt(btn.dataset.book));
                });
            });

            document.querySelectorAll('.admin-btn-decline').forEach(btn => {
                btn.addEventListener('click', () => {
                    declinarSolicitud(parseInt(btn.dataset.sol));
                });
            });
            return;
        }

        // --- FILTROS DE PÁGINAS ESTÁNDAR ---
        if (currentPage === 'destacados') {
            filteredBooks = filteredBooks.filter(book => book.destacado);
            sectionTitle.textContent = 'Control de Libros Destacados';
            sectionSubtitle.textContent = 'Verificación de obras de alta rotación';
            viewAllLink.style.display = 'inline-block';
        } else if (currentPage === 'novedades') {
            filteredBooks = filteredBooks.filter(book => book.novedad);
            sectionTitle.textContent = 'Control de Novedades';
            sectionSubtitle.textContent = 'Monitoreo de ingresos recientes al almacén';
            viewAllLink.style.display = 'inline-block';
        } else if (currentPage === 'favoritos') {
            filteredBooks = filteredBooks.filter(book => favorites.includes(book.id));
            sectionTitle.textContent = 'Libros Bajo Observación';
            sectionSubtitle.textContent = 'Lista filtrada por ti para seguimiento';
            viewAllLink.style.display = 'none';
        } else {
            sectionTitle.textContent = 'Catálogo de Control General';
            sectionSubtitle.textContent = 'Verificación del estado físico y disponibilidad de libros';
            viewAllLink.style.display = 'inline-block';
        }

        if (currentSearchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) || 
                book.author.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
        }

        if (filteredBooks.length === 0) {
            booksContainer.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No se encontraron registros de libros</div>';
            return;
        }

        booksContainer.innerHTML = filteredBooks.map(book => `
            <div class="card">
                <div class="card-img-wrapper">
                    ${book.badge ? `<span class="card-badge">${book.badge}</span>` : ''}
                    <button class="favorite-icon ${isFavorite(book.id) ? 'active' : ''}" data-id="${book.id}">❤️</button>
                    <img src="${book.image}" alt="${book.title}">
                    <div class="card-overlay">
                        <button class="card-overlay-btn" data-id="${book.id}">Vista Rápida</button>
                    </div>
                </div>
                <div class="card-content">
                    <span class="card-category">${book.category}</span>
                    <h3>${book.title}</h3>
                    <p class="card-author">${book.author}</p>
                    <p class="card-desc">${book.description}</p>
                    <div class="card-footer">
                        <div class="status-container">
                            <span class="status-light ${book.disponible ? 'online' : 'offline'}"></span>
                            <span class="status-text">${book.disponible ? 'Disponible' : 'No disponible'}</span>
                        </div>
                        <button class="card-btn-reserve" data-id="${book.id}" ${!book.disponible ? 'disabled' : ''}>
                            ${book.disponible ? 'Generar Solicitud' : 'Prestado'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.favorite-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(parseInt(btn.dataset.id));
            });
        });

        document.querySelectorAll('.card-overlay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = booksData.find(b => b.id === parseInt(btn.dataset.id));
                openModal(book);
            });
        });

        document.querySelectorAll('.card-btn-reserve').forEach(btn => {
            btn.addEventListener('click', () => {
                crearSimulacionSolicitud(parseInt(btn.dataset.id));
            });
        });
    }

    // ---------- SIDEBAR INTERACCIÓN ----------
    function toggleSidebar() { sidebar.classList.toggle('collapsed'); mainContent.classList.toggle('sidebar-collapsed'); if (menuToggle) menuToggle.classList.toggle('active'); }
    function closeSidebar() { if (!sidebar.classList.contains('collapsed')) { sidebar.classList.add('collapsed'); mainContent.classList.add('sidebar-collapsed'); if (menuToggle) menuToggle.classList.remove('active'); } }
    if (menuToggle) menuToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
    document.addEventListener('click', (e) => { if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target) && window.innerWidth <= 900) closeSidebar(); });

    // ---------- NAVEGACIÓN EN MENÚ ----------
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentPage = item.dataset.page;
            renderBooks();
        });
    });

    // ---------- CAJA DE BÚSQUEDA ----------
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderBooks();
    });

    if (modalClose) modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));

    // ---------- INICIALIZACIÓN ----------
    renderBooks();
});