const CART_KEY = "techmarket-cart";

document.addEventListener("DOMContentLoaded", () => {
    const checkoutEmpty = document.getElementById("checkout-empty");
    const checkoutLayout = document.getElementById("checkout-layout");
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutSuccess = document.getElementById("checkout-success");
    const orderList = document.getElementById("order-list");
    const orderTotal = document.getElementById("order-total");
    const cartCounter = document.querySelector(".cart-counter");

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

    function renderOrder() {
        updateCounter();

        if (cart.length === 0) {
            checkoutEmpty.style.display = "flex";
            checkoutLayout.style.display = "none";
            return;
        }

        checkoutEmpty.style.display = "none";
        checkoutLayout.style.display = "grid";
        orderList.innerHTML = "";

        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "order-list-item";

            row.innerHTML = `
                <span>
                    ${escapeHtml(item.title)} × ${Number(item.quantity || 1)}
                </span>
                <strong>
                    ${formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                </strong>
            `;

            orderList.appendChild(row);
        });

        const total = cart.reduce(
            (sum, item) =>
                sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
        );

        orderTotal.textContent = formatPrice(total);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (cart.length === 0) {
            return;
        }

        localStorage.removeItem(CART_KEY);
        cart = [];

        checkoutLayout.style.display = "none";
        checkoutSuccess.style.display = "block";
        updateCounter();
        checkoutForm.reset();
    });

    renderOrder();
});
