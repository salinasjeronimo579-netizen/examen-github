document.addEventListener("DOMContentLoaded", () => {
    // Capturamos todas las tarjetas de administración que tengan el atributo data-modal
    const adminCards = document.querySelectorAll(".admin-card");
    const closeButtons = document.querySelectorAll(".modal-close");
    const overlays = document.querySelectorAll(".modal-overlay");

    // 1. Abrir Modal correspondiente al dar click en la tarjeta
    adminCards.forEach(card => {
        card.addEventListener("click", () => {
            const modalId = card.getAttribute("data-modal");
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add("active");
                document.body.style.overflow = "hidden"; // Evita scroll de fondo
            }
        });
    });

    // 2. Cerrar Modales desde la 'X'
    closeButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            // Evitamos que el evento se propague si está dentro de otro elemento
            e.stopPropagation(); 
            const modal = button.closest(".modal-overlay");
            if (modal) closeModal(modal);
        });
    });

    // 3. Cerrar Modales dando click afuera en la zona oscura (overlay)
    overlays.forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    function closeModal(modalElement) {
        modalElement.classList.remove("active");
        document.body.style.overflow = ""; // Restaura scroll
        
        // Si es el modal de usuarios, ocultamos la sub-sección de historial al cerrar
        if(modalElement.id === "modal-users-list") {
            document.getElementById("user-history-section").style.display = "none";
        }
    }

    // ============================================================
    /* INTERACTIVIDAD EXTRA: Sub-Sección Historial de Usuarios */
    // ============================================================
    const historyButtons = document.querySelectorAll(".btn-history");
    const historySection = document.getElementById("user-history-section");
    const historyUsername = document.getElementById("history-username");

    historyButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita conflictos con el contenedor
            const username = btn.getAttribute("data-user");
            
            // Colocamos el nombre del usuario y hacemos visible la sección
            historyUsername.textContent = username;
            historySection.style.display = "block";
            
            // Auto-scroll suave hacia la sección del historial dentro del modal
            historySection.scrollIntoView({ behavior: 'smooth' });
        });
    });
});