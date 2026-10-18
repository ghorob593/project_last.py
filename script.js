const API_BASE_URL = "https://dummyjson.com/products";

const ELECTRONICS_CATEGORIES = [
    "smartphones",
    "laptops",
    "tablets",
    "mobile-accessories"
];

const PRODUCTS_LIMIT = 12;

const USD_TO_UAH = 44; 



document.addEventListener("DOMContentLoaded", () => {


    const productsContainer =
        document.getElementById("products-container");

    const productsLoading =
        document.getElementById("products-loading");

    const productsError =
        document.getElementById("products-error");

    const retryButton =
        document.getElementById("retry-button");

    const searchForm =
        document.getElementById("search-form");

    const searchInput =
        document.getElementById("search-input");

    const cartCounter =
        document.querySelector(".cart-counter");

    const mainNav =
        document.querySelector(".main-nav");


    if (!productsContainer) {
        console.error(
            'Помилка: не знайдено елемент "#products-container"'
        );
        return;
    }


    let cart = [];

    try {

        const savedCart =
            localStorage.getItem("techmarket-cart");

        cart = savedCart
            ? JSON.parse(savedCart)
            : [];

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch (error) {

        console.error(
            "Не вдалося завантажити кошик:",
            error
        );

        cart = [];
    }


    let currentRequestUrl =
        `${API_BASE_URL}?limit=${PRODUCTS_LIMIT}`;


        async function getProducts() {

            showLoading();
        
            try {
        
                const requests = ELECTRONICS_CATEGORIES.map(category =>
                    fetch(
                        `${API_BASE_URL}/category/${category}`
                    )
                );
        
                const responses = await Promise.all(requests);
        
        
                responses.forEach(response => {
        
                    if (!response.ok) {
                        throw new Error(
                            `Помилка API: ${response.status}`
                        );
                    }
        
                });
        
        
                const data = await Promise.all(
                    responses.map(response =>
                        response.json()
                    )
                );
        
        
                let products = data.flatMap(
                    category => category.products
                );
        
        
                products = products.sort(
                    (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
                );
        
        
                products = products.slice(
                    0,
                    PRODUCTS_LIMIT
                );
        
        
                renderProducts(products);
        
        
            } catch (error) {
        
                console.error(
                    "Помилка отримання електроніки:",
                    error
                );
        
                showError();
        
            }
        }


    function renderProducts(products) {

        productsContainer.innerHTML = "";

        if (!products || products.length === 0) {

            productsContainer.innerHTML = `
                <div class="no-products">
                    <i class="bi bi-search"></i>
                    <p>Товарів не знайдено</p>
                </div>
            `;

            hideLoading();

            return;
        }

        products.forEach(product => {

            const productCard =
                createProductCard(product);

            productsContainer.appendChild(productCard);

        });


        hideLoading();
    }




    function escapeHtml(text) {

        if (text === null || text === undefined) {
            return "";
        }

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function createProductCard(product) {

        const card =
            document.createElement("article");

        card.className = "product-card";

        const title =
            escapeHtml(product.title || "Без назви");

        const image =
            escapeHtml(product.thumbnail || "");

        const rating =
            Number(product.rating || 0);

        const price =
            Math.round(
                Number(product.price || 0) * USD_TO_UAH
            );


        card.innerHTML = `

            <div class="product-image-wrapper">

                <img
                    src="${image}"
                    alt="${title}"
                    class="product-image"
                    loading="lazy"
                >

            </div>


            <div class="product-info">

                <h3 class="product-title">
                    ${title}
                </h3>


                <div class="product-rating">

                    <i class="bi bi-star-fill"></i>

                    <span>
                        ${rating.toFixed(1)}
                    </span>

                </div>


                <div class="product-price">
                    ${price.toLocaleString("uk-UA")} ₴
                </div>


                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${product.id}"
                >

                    <i class="bi bi-cart-plus"></i>

                    Додати в кошик

                </button>

            </div>

        `;


        const addButton =
            card.querySelector(".add-to-cart-button");

        if (addButton) {

            addButton.addEventListener(
                "click",
                () => {

                    addToCart(product, price);

                }
            );

        }


        return card;
    }




    function addToCart(product, price) {

        const existingProduct =
            cart.find(
                item => item.id === product.id
            );


        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({

                id: product.id,

                title: product.title,

                price: price,

                image: product.thumbnail,

                quantity: 1

            });

        }


        saveCart();


        updateCartCounter();


        showCartMessage();
    }


    function saveCart() {

        try {

            localStorage.setItem(
                "techmarket-cart",
                JSON.stringify(cart)
            );

        } catch (error) {

            console.error(
                "Не вдалося зберегти кошик:",
                error
            );

        }
    }

    function updateCartCounter() {

        if (!cartCounter) {
            return;
        }


        const totalQuantity =
            cart.reduce(
                (total, product) =>
                    total + Number(product.quantity || 0),
                0
            );


        cartCounter.textContent =
            totalQuantity;
    }


    function showCartMessage() {

        const oldMessage =
            document.querySelector(".cart-message");

        if (oldMessage) {
            oldMessage.remove();
        }


        const message =
            document.createElement("div");

        message.className = "cart-message";


        message.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>Товар додано до кошика</span>
        `;


        document.body.appendChild(message);

        requestAnimationFrame(() => {

            message.classList.add("show");

        });

        setTimeout(() => {

            message.classList.remove("show");


            setTimeout(() => {

                message.remove();

            }, 300);

        }, 2000);
    }


    if (searchForm && searchInput) {

        searchForm.addEventListener(
            "submit",
            async event => {
    
                event.preventDefault();
    
    
                const searchValue =
                    searchInput.value.trim().toLowerCase();
    
    
                if (!searchValue) {
    
                    getProducts();
    
                    return;
                }
    
    
                showLoading();
    
    
                try {
    
                    const requests =
                        ELECTRONICS_CATEGORIES.map(
                            category =>
                                fetch(
                                    `${API_BASE_URL}/category/${category}`
                                )
                        );
    
    
                    const responses =
                        await Promise.all(requests);
    
    
                    responses.forEach(response => {
                        if (!response.ok) {
                            throw new Error(
                                `Помилка API під час пошуку: ${response.status}`
                            );
                        }
                    });

                    const data =
                        await Promise.all(
                            responses.map(
                                response =>
                                    response.json()
                            )
                        );
    
    
                    let products =
                        data.flatMap(
                            category =>
                                category.products
                        );
    

                    products =
                        products.filter(product => {
    
                            const title =
                                (
                                    product.title || ""
                                ).toLowerCase();
    
    
                            const description =
                                (
                                    product.description || ""
                                ).toLowerCase();
    
    
                            const brand =
                                (
                                    product.brand || ""
                                ).toLowerCase();
    
    
                            return (
                                title.includes(searchValue) ||
                                description.includes(searchValue) ||
                                brand.includes(searchValue)
                            );
    
                        });
    
    
                    products =
                        products.slice(
                            0,
                            PRODUCTS_LIMIT
                        );
    
    
                    renderProducts(products);
    
    
                } catch (error) {
    
                    console.error(
                        "Помилка пошуку:",
                        error
                    );
    
                    showError();
    
                }
    
            }
        );
    
    

    } else {

        console.warn(
            "Форма пошуку або поле пошуку не знайдені."
        );

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                getProducts(currentRequestUrl);

            }
        );

    }


    function showLoading() {

        if (productsLoading) {

            productsLoading.style.display =
                "flex";

        }


        if (productsError) {

            productsError.style.display =
                "none";

        }


        productsContainer.style.display =
            "none";
    }


    function hideLoading() {

        if (productsLoading) {

            productsLoading.style.display =
                "none";

        }


        productsContainer.style.display =
            "grid";
    }


    function showError() {

        if (productsLoading) {

            productsLoading.style.display =
                "none";

        }


        productsContainer.style.display =
            "none";


        if (productsError) {

            productsError.style.display =
                "flex";

        }

    }


    const messageStyles =
        document.createElement("style");


    messageStyles.textContent = `

        .cart-message {

            position: fixed;

            right: 25px;
            bottom: 25px;

            z-index: 9999;

            display: flex;

            align-items: center;

            gap: 10px;

            padding: 13px 18px;

            border-radius: 10px;

            background-color: #111827;

            color: #ffffff;

            font-size: 14px;

            box-shadow:
                0 8px 25px
                rgba(0, 0, 0, 0.2);

            transform:
                translateY(30px);

            opacity: 0;

            transition:
                opacity 0.3s ease,
                transform 0.3s ease;

        }


        .cart-message.show {

            transform:
                translateY(0);

            opacity: 1;

        }


        .cart-message i {

            color: #00a046;

            font-size: 18px;

        }


        .no-products {

            grid-column: 1 / -1;

            min-height: 200px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 10px;

            color: #6b7280;

        }


        .no-products i {

            font-size: 35px;

        }

    `;


    document.head.appendChild(messageStyles);

    const mobileMenuButton =
        document.getElementById("mobile-menu-button");

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener("click", () => {
            const isOpen =
                mainNav.classList.toggle("mobile-open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }

    getProducts();

    updateCartCounter();

});