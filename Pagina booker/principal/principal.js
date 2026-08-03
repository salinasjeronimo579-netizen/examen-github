/* ============================================================
   BROKER - Librería Clásica | JavaScript Completo
   Carrusel · Búsqueda · Sidebar · Modal · Carrito · Favoritos · Páginas dinámicas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- REFERENCIAS ----------
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const booksContainer = document.getElementById('booksContainer');
    const menuItems = document.querySelectorAll('.menu-item');
    const cartBadge = document.getElementById('cartBadge');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerBtn = document.getElementById('cartDrawerBtn');
    const cartClose = document.getElementById('cartClose');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalSpan = document.getElementById('cartTotal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const toastMsg = document.getElementById('toastMsg');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    const viewAllLink = document.getElementById('viewAllLink');

    // ---------- DATOS DE LIBROS (8 libros con información completa) ----------
    const booksData = [
        { id: 1, title: "El Principito", author: "Antoine de Saint-Exupéry", category: "Clásico", price: 24.99, description: "Una historia clásica llena de enseñanzas y fantasía inigualable.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", badge: "Best Seller", destacado: true, novedad: false },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling", category: "Fantasía", price: 34.99, description: "Magia, amistad y aventuras inolvidables en Hogwarts.", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop", badge: "Popular", destacado: true, novedad: false },
        { id: 3, title: "1984", author: "George Orwell", category: "Ficción", price: 19.99, description: "Una novela impactante sobre el control y la libertad.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: true },
        { id: 4, title: "Don Quijote", author: "Miguel de Cervantes", category: "Clásico", price: 29.99, description: "La obra maestra más importante de la literatura española.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop", badge: "Clásico", destacado: true, novedad: false },
        { id: 5, title: "El Nombre de la Rosa", author: "Umberto Eco", category: "Misterio", price: 27.99, description: "Intriga medieval en una abadía llena de secretos.", image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop", badge: "", destacado: false, novedad: true },
        { id: 6, title: "Dune", author: "Frank Herbert", category: "Ciencia Ficción", price: 32.99, description: "Una epopeya interestelar de poder y destino.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop", badge: "", destacado: true, novedad: false },
        { id: 7, title: "Cien Años de Soledad", author: "Gabriel García Márquez", category: "Realismo mágico", price: 28.99, description: "La historia de la familia Buendía a lo largo de siete generaciones.", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop", badge: "Premio Nobel", destacado: true, novedad: false },
        { id: 8, title: "El Aleph", author: "Jorge Luis Borges", category: "Cuento", price: 22.99, description: "Cuentos que exploran el infinito, el tiempo y la memoria.", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop", badge: "Novedad", destacado: false, novedad: true }
    ];

    // ---------- ESTADO GLOBAL ----------
    let cart = []; // { id, title, price, image }
    let favorites = JSON.parse(localStorage.getItem('broker_favorites')) || [];
    let currentPage = 'inicio';
    let currentSearchTerm = '';

    // ---------- FUNCIONES AUXILIARES ----------
    function showToast(message, duration = 2000) {
        toastMsg.textContent = message;
        toastMsg.classList.add('show');
        setTimeout(() => toastMsg.classList.remove('show'), duration);
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        renderCartDrawer();
    }

    function saveFavorites() {
        localStorage.setItem('broker_favorites', JSON.stringify(favorites));
    }

    function isFavorite(bookId) {
        return favorites.includes(bookId);
    }

    function toggleFavorite(bookId) {
        if (favorites.includes(bookId)) {
            favorites = favorites.filter(id => id !== bookId);
            showToast('❌ Eliminado de favoritos');
        } else {
            favorites.push(bookId);
            showToast('❤️ Añadido a favoritos');
        }
        saveFavorites();
        renderBooks(); // Re-renderizar para actualizar íconos
    }

    function addToCart(book) {
        const existing = cart.find(item => item.id === book.id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...book, quantity: 1 });
        }
        updateCartBadge();
        showToast(`📚 "${book.title}" añadido al carrito`);
    }

    function removeFromCart(bookId) {
        cart = cart.filter(item => item.id !== bookId);
        updateCartBadge();
        showToast('🗑️ Producto eliminado');
    }

    function renderCartDrawer() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-state">Tu carrito está vacío</div>';
            cartTotalSpan.textContent = '$0.00';
            return;
        }
        let total = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img class="cart-item-img" src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                        <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
        cartTotalSpan.textContent = `$${total.toFixed(2)}`;
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                removeFromCart(id);
            });
        });
    }

    function openModal(book) {
        modalBody.innerHTML = `
            <div class="modal-img"><img src="${book.image}" alt="${book.title}"></div>
            <div class="modal-info">
                <h2>${book.title}</h2>
                <p><strong>${book.author}</strong> | ${book.category}</p>
                <p class="modal-price">$${book.price.toFixed(2)}</p>
                <p class="modal-desc">${book.description}</p>
                <button class="modal-addcart" data-id="${book.id}">Añadir al carrito</button>
            </div>
        `;
        modalOverlay.classList.add('active');
        const addBtn = modalBody.querySelector('.modal-addcart');
        if (addBtn) addBtn.addEventListener('click', () => { addToCart(book); modalOverlay.classList.remove('active'); });
    }

    // ---------- RENDERIZADO DE LIBROS (con filtro por página y búsqueda) ----------
    function renderBooks() {
        let filteredBooks = [...booksData];
        // Filtro por página
        if (currentPage === 'destacados') {
            filteredBooks = filteredBooks.filter(book => book.destacado === true);
            sectionTitle.textContent = 'Libros Destacados';
            sectionSubtitle.textContent = 'Los más vendidos y aclamados por nuestros lectores';
            viewAllLink.style.display = 'inline-block';
        } else if (currentPage === 'novedades') {
            filteredBooks = filteredBooks.filter(book => book.novedad === true);
            sectionTitle.textContent = 'Novedades';
            sectionSubtitle.textContent = 'Los últimos lanzamientos que no te puedes perder';
            viewAllLink.style.display = 'inline-block';
        } else if (currentPage === 'favoritos') {
            filteredBooks = filteredBooks.filter(book => favorites.includes(book.id));
            sectionTitle.textContent = 'Mis Favoritos';
            sectionSubtitle.textContent = 'Libros que has guardado como favoritos';
            viewAllLink.style.display = 'none';
        } else if (currentPage === 'contacto') {
            // Mostrar formulario de contacto
            booksContainer.innerHTML = `
                <div class="contact-form">
                    <h3>Contáctanos</h3>
                    <input type="text" placeholder="Nombre completo" id="contactName">
                    <input type="email" placeholder="Correo electrónico" id="contactEmail">
                    <textarea rows="4" placeholder="Mensaje..." id="contactMsg"></textarea>
                    <button id="sendContactBtn">Enviar mensaje</button>
                </div>
            `;
            const sendBtn = document.getElementById('sendContactBtn');
            if (sendBtn) sendBtn.addEventListener('click', () => {
                alert('Mensaje enviado (simulación). Gracias por contactarnos.');
                document.getElementById('contactName').value = '';
                document.getElementById('contactEmail').value = '';
                document.getElementById('contactMsg').value = '';
            });
            return; 
        } else {
            // Catálogo completo (inicio)
            sectionTitle.textContent = 'Nuestro Catálogo';
            sectionSubtitle.textContent = 'Explora toda nuestra colección de libros';
            viewAllLink.style.display = 'inline-block';
        }

        // Filtro por búsqueda (si hay texto)
        if (currentSearchTerm.trim() !== '') {
            filteredBooks = filteredBooks.filter(book => book.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) || book.author.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        }

        if (filteredBooks.length === 0 && currentPage !== 'contacto') {
            booksContainer.innerHTML = '<div class="empty-state">No se encontraron libros que coincidan con tu búsqueda.</div>';
            return;
        }

        booksContainer.innerHTML = filteredBooks.map(book => `
            <div class="card" data-id="${book.id}">
                <div class="card-img-wrapper">
                    <img src="${book.image}" alt="${book.title}" loading="lazy">
                    <div class="card-overlay">
                        <div class="card-overlay-btn quick-view" data-id="${book.id}">Vista Rápida</div>
                    </div>
                    ${book.badge ? `<span class="card-badge">${book.badge}</span>` : ''}
                    <div class="favorite-icon ${isFavorite(book.id) ? 'active' : ''}" data-id="${book.id}">❤️</div>
                </div>
                <div class="card-content">
                    <span class="card-category">${book.category}</span>
                    <h3>${book.title}</h3>
                    <p class="card-author">${book.author}</p>
                    <p class="card-desc">${book.description.substring(0, 80)}...</p>
                    <div class="card-footer">
                        <span class="card-price">$${book.price.toFixed(2)}</span>
                        <div class="card-btn add-to-cart" data-id="${book.id}">Agregar al Carrito</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Eventos dinámicos
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const book = booksData.find(b => b.id === id);
                if (book) openModal(book);
            });
        });
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const book = booksData.find(b => b.id === id);
                if (book) addToCart(book);
            });
        });
        document.querySelectorAll('.favorite-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(icon.dataset.id);
                toggleFavorite(id);
            });
        });
    }

    // ---------- NAVEGACIÓN POR PÁGINAS ----------
    function setActivePage(pageId) {
        currentPage = pageId;
        renderBooks();
        menuItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === pageId) item.classList.add('active');
            else item.classList.remove('active');
        });
        if (window.innerWidth <= 900) closeSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            setActivePage(page);
        });
    });

    viewAllLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActivePage('inicio');
    });

    // ---------- BÚSQUEDA ----------
    function handleSearch() {
        currentSearchTerm = searchInput.value.trim();
        renderBooks();
    }
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchInput.value = ''; handleSearch(); searchInput.blur(); } });

    // ---------- CARRUSEL ----------
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    let carouselInterval;

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }
    function nextSlide() { goToSlide(currentSlide + 1); resetAutoPlay(); }
    function prevSlide() { goToSlide(currentSlide - 1); resetAutoPlay(); }
    function startAutoPlay() { carouselInterval = setInterval(nextSlide, 6000); }
    function stopAutoPlay() { if (carouselInterval) clearInterval(carouselInterval); }
    function resetAutoPlay() { stopAutoPlay(); startAutoPlay(); }
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
    }
    indicators.forEach((ind, idx) => ind.addEventListener('click', () => { goToSlide(idx); resetAutoPlay(); }));
    startAutoPlay();
    const hero = document.getElementById('heroCarousel');
    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);

    // ---------- SIDEBAR ----------
    function toggleSidebar() { sidebar.classList.toggle('collapsed'); mainContent.classList.toggle('sidebar-collapsed'); if (menuToggle) menuToggle.classList.toggle('active'); }
    function closeSidebar() { if (sidebar.classList.contains('collapsed')) { sidebar.classList.remove('collapsed'); mainContent.classList.remove('sidebar-collapsed'); if (menuToggle) menuToggle.classList.remove('active'); } }
    if (menuToggle) menuToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
    document.addEventListener('click', (e) => { if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target) && window.innerWidth <= 900) closeSidebar(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) { sidebar.classList.remove('collapsed'); mainContent.classList.remove('sidebar-collapsed'); if (menuToggle) menuToggle.classList.remove('active'); } });

    // ---------- CARRITO DRAWER ----------
    cartDrawerBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
    cartClose.addEventListener('click', () => cartDrawer.classList.remove('open'));
    document.getElementById('cartCheckout')?.addEventListener('click', () => { alert('Compra simulada. Gracias por tu pedido.'); cart = []; updateCartBadge(); cartDrawer.classList.remove('open'); });

    // ---------- MODAL ----------
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

    // ---------- EFECTO SCROLL NAVBAR ----------
    function updateNavbarShadow() { if (window.scrollY > 30) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled'); }
    window.addEventListener('scroll', updateNavbarShadow);
    updateNavbarShadow();

    // ---------- LOGO ----------
    document.getElementById('logoText')?.addEventListener('click', () => { setActivePage('inicio'); searchInput.value = ''; handleSearch(); });

    // ---------- MI CUENTA ----------
    document.getElementById('accountBtn')?.addEventListener('click', () => showToast('🔐 Funcionalidad en desarrollo'));

    // ---------- INICIALIZACIÓN ----------
    renderBooks();
    updateCartBadge();
});