document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#main-nav");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            const isOpen = navigation.classList.toggle("menu-open");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.textContent = isOpen ? "Close Menu" : "Menu";
        });
    }

    // Product search and sorting
    const productList = document.querySelector("#product-list");
    const searchInput = document.querySelector("#product-search");
    const sortSelect = document.querySelector("#product-sort");
    const productCount = document.querySelector("#product-count");

    if (productList && searchInput && sortSelect) {
        const cards = Array.from(
            productList.querySelectorAll(".product-card")
        );

        function updateProducts() {
            const query = searchInput.value.toLowerCase().trim();
            const sort = sortSelect.value;

            const visibleCards = cards.filter(function (card) {
                return card.dataset.name.toLowerCase().includes(query);
            });

            visibleCards.sort(function (a, b) {
                if (sort === "price-low") {
                    return Number(a.dataset.price) - Number(b.dataset.price);
                }

                if (sort === "price-high") {
                    return Number(b.dataset.price) - Number(a.dataset.price);
                }

                if (sort === "name") {
                    return a.dataset.name.localeCompare(b.dataset.name);
                }

                return cards.indexOf(a) - cards.indexOf(b);
            });

            cards.forEach(function (card) {
                card.hidden = !visibleCards.includes(card);
            });

            visibleCards.forEach(function (card) {
                productList.appendChild(card);
            });

            if (productCount) {
                productCount.textContent =
                    visibleCards.length + " product(s) found.";
            }
        }

        searchInput.addEventListener("input", updateProducts);
        sortSelect.addEventListener("change", updateProducts);
        updateProducts();
    }

    // Shopping cart storage
    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("anteCart")) || [];

        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch {
        cart = [];
    }

    function saveCart() {
        localStorage.setItem("anteCart", JSON.stringify(cart));
    }

    // Add products to the cart
    document.querySelectorAll(".add-to-cart").forEach(function (button) {
        button.addEventListener("click", function () {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isFinite(price) || price <= 0) {
                return;
            }

            const existing = cart.find(function (item) {
            return item.name === name;
            });

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            saveCart();

            button.textContent = "Added to Cart";

            setTimeout(function () {
                button.textContent = "Add to Cart";
            }, 1000);
        });
    });

    // Display cart items and calculate the total
    const cartItems = document.querySelector("#cart-items");
    const cartTotal = document.querySelector("#cart-total");
    const clearCartButton = document.querySelector("#clear-cart");

    function renderCart() {
        if (!cartItems || !cartTotal) {
            return;
        }

        cartItems.replaceChildren();

         let total = 0;

        if (cart.length === 0) {
            cartItems.textContent = "Your cart is empty.";
        }

        cart.forEach(function (item, index) {
            total += item.price * item.quantity;

            const row = document.createElement("div");
            const name = document.createElement("p");
            const quantity = document.createElement("input");
            const remove = document.createElement("button");

            name.textContent =
                `${item.name} - R${item.price.toLocaleString("en-ZA")}`;

            quantity.type = "number";
            quantity.min = "1";
            quantity.max = "99";
            quantity.value = String(item.quantity);
            quantity.setAttribute("aria-label", `Quantity for ${item.name}`);

            quantity.addEventListener("change", function () {
                item.quantity = Math.max(
                    1,
                    Math.min(99, Number(quantity.value) || 1)
                );

                saveCart();
                renderCart();
            });

            remove.type = "button";
            remove.textContent = "Remove";

            remove.addEventListener("click", function () {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });

            row.append(name, quantity, remove);
            cartItems.appendChild(row);
        });

        cartTotal.textContent =
            `Total: R${total.toLocaleString("en-ZA")}`;
    }

    if (clearCartButton) {
        clearCartButton.addEventListener("click", function () {
            cart = [];
            saveCart();
            renderCart();
        });
    }

    renderCart();

    // Gallery lightbox
    const lightbox = document.querySelector("#lightbox");
    const lightboxImage = document.querySelector("#lightbox-image");
    const closeLightbox = document.querySelector("#close-lightbox");

    document.querySelectorAll(".gallery-image").forEach(function (button) {
        button.addEventListener("click", function () {
            if (!lightbox || !lightboxImage) {
                return;
            }

            const image = button.querySelector("img");

            lightboxImage.src = button.dataset.full;
            lightboxImage.alt = image ? image.alt : "Jewellery image";

            lightbox.showModal();
        });
    });

    if (closeLightbox && lightbox) {
        closeLightbox.addEventListener("click", function () {
            lightbox.close();
        });

        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                lightbox.close();
            }
        });
    }

    // Enquiry form validation and response
    const enquiryForm = document.querySelector("#enquiry-form");
    const enquiryFeedback = document.querySelector("#enquiry-feedback");

    if (enquiryForm && enquiryFeedback) {
        enquiryForm.addEventListener("submit", function (event) {
            if (!enquiryForm.checkValidity()) {
                event.preventDefault();
                enquiryForm.reportValidity();
                enquiryFeedback.textContent =
                    "Please correct the highlighted fields before submitting.";
                return;
            }

            const type = document.querySelector("#enquiry-type").value;

            if (type === "availability") {
                enquiryFeedback.textContent =
                    "Your enquiry will ask the team to confirm current availability and price.";
            } else if (type === "custom") {
                enquiryFeedback.textContent =
                "Your custom design enquiry is ready for the team to review and price.";
            } else {
                enquiryFeedback.textContent =
                    "Your product enquiry is ready for the team to confirm the price and availability.";
            }
        });
    }

    // Contact form validation and feedback
    const contactForm = document.querySelector("#contact-form");
    const contactFeedback = document.querySelector("#contact-feedback");

    if (contactForm && contactFeedback) {
        contactForm.addEventListener("submit", function (event) {
            if (!contactForm.checkValidity()) {
                event.preventDefault();
                contactForm.reportValidity();

                contactFeedback.textContent =
                    "Please correct the highlighted fields before sending.";
                return;
            }

            contactFeedback.textContent =
                "Your message is being prepared for submission.";
        });
    }
});
