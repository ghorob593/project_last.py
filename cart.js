const CART_KEY = "techmarket-cart";

document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const cartContent = document.getElementById("cart-content");
    const cartTotal = document.getElementById("cart-total");
    const cartGrandTotal = document.getElementById("cart-grand-total");
    const cartCounter = document.querySelector(".cart-counter");
    const clearCartButton = document.getElementById("clear-cart-button");
    const checkoutLink = document.getElementById("checkout-link");

    let cart = loadCart();

    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mainNav = document.querySelector(".main-nav");

    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("mobile-open");
            mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function loadCart() {
        try {
            const savedCart = localStorage.getItem(CART_KEY);
            const parsedCart = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch (error) {
            console.error("Не вдалося завантажити кошик:", error);
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function formatPrice(value) {
        return `${Number(value || 0).toLocaleString("uk-UA")} ₴`;
    }

    function updateCounter() {
        const quantity = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        if (cartCounter) {
            cartCounter.textContent = quantity;
        }
    }

    function renderCart() {
        updateCounter();

        if (cart.length === 0) {
            cartEmpty.style.display = "flex";
            cartContent.style.display = "none";
            return;
        }

        cartEmpty.style.display = "none";
        cartContent.style.display = "grid";
        cartItems.innerHTML = "";

        cart.forEach((item) => {
            const row = document.createElement("article");
            row.className = "cart-item";

            row.innerHTML = `
                <div class="cart-item-image">
                    <img
                        src="${escapeHtml(item.image || "")}"
                        alt="${escapeHtml(item.title || "Товар")}"
                        loading="lazy"
                    >
                </div>

                <div class="cart-item-info">
                    <h3>${escapeHtml(item.title || "Без назви")}</h3>
                    <p>${formatPrice(item.price)} за одиницю</p>
                </div>

                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button
                            type="button"
                            class="quantity-button"
                            data-action="decrease"
                            data-id="${item.id}"
                            aria-label="Зменшити кількість"
                        >−</button>

                        <span>${Number(item.quantity || 1)}</span>

                        <button
                            type="button"
                            class="quantity-button"
                            data-action="increase"
                            data-id="${item.id}"
                            aria-label="Збільшити кількість"
                        >+</button>
                    </div>

                    <strong class="cart-item-total">
                        ${formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                    </strong>

                    <button
                        type="button"
                        class="remove-item-button"
                        data-action="remove"
                        data-id="${item.id}"
                        aria-label="Видалити товар"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            `;

            cartItems.appendChild(row);
        });

        updateTotals();
    }

    function updateTotals() {
        const total = cart.reduce(
            (sum, item) =>
                sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
        );

        cartTotal.textContent = formatPrice(total);
        cartGrandTotal.textContent = formatPrice(total);
    }

    function changeQuantity(id, change) {
        const item = cart.find((product) => product.id === id);

        if (!item) {
            return;
        }

        item.quantity = Number(item.quantity || 1) + change;

        if (item.quantity <= 0) {
            cart = cart.filter((product) => product.id !== id);
        }

        saveCart();
        renderCart();
    }

    function removeItem(id) {
        cart = cart.filter((product) => product.id !== id);
        saveCart();
        renderCart();
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    cartItems.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "increase") {
            changeQuantity(id, 1);
        }

        if (action === "decrease") {
            changeQuantity(id, -1);
        }

        if (action === "remove") {
            removeItem(id);
        }
    });

    clearCartButton.addEventListener("click", () => {
        if (cart.length === 0) {
            return;
        }

        cart = [];
        saveCart();
        renderCart();
    });

    checkoutLink.addEventListener("click", (event) => {
        if (cart.length === 0) {
            event.preventDefault();
        }
    });

    renderCart();
});
