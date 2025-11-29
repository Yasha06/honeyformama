// =================================================================
// 1. ФУНКЦІЇ ДЛЯ ЗБЕРІГАННЯ ДАНИХ (LocalStorage)
// =================================================================

function getCart() {
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// =================================================================
// 2. ЛОГІКА ОПЕРАЦІЙ З КОШИКОМ
// =================================================================

function removeCartItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
    // updateCartCount(); // Якщо є лічильник у навігації
}

function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity <= 0 || isNaN(quantity)) {
        removeCartItem(productId);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity = quantity;
        saveCart(cart);
        renderCart(); 
        // updateCartCount(); // Якщо є лічильник у навігації
    }
}

function addToCart(productId, name, price, quantity = 1) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId, 
            name: name, 
            price: price, 
            quantity: quantity
            // Можна додати imagePath сюди, якщо ви його зберегли в data-*
        });
    }

    saveCart(cart);
    alert(`"${name}" додано до кошика!`);
    // updateCartCount(); // Якщо є лічильник у навігації
}


// =================================================================
// 3. ВІДОБРАЖЕННЯ ТА ОБРОБКА ПОДІЙ (Тільки для cart.html)
// =================================================================

function attachEventListeners() {
    // 1. Слухач для кнопки "Видалити"
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product-id');
            if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
                removeCartItem(productId);
            }
        });
    });

    // 2. Слухач для поля "Кількість"
    document.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.getAttribute('data-product-id');
            updateQuantity(productId, e.target.value);
        });
    });
}

function generateCartItemHTML(item) {
    const itemTotal = item.price * item.quantity;
    return `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${imagePath}" alt="${item.name}" class="item-img">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price-unit">Ціна за одиницю: ${item.price.toFixed(2)} UAH</p>
            </div>
            <div class="item-quantity">
                <label for="qty-${item.id}">Кількість:</label>
                <input type="number" id="qty-${item.id}" value="${item.quantity}" min="1" 
                       data-product-id="${item.id}" class="item-quantity-input">
            </div>
            <div class="item-total">
                <strong>${itemTotal.toFixed(2)} UAH</strong>
            </div>
            <button class="remove-btn" data-product-id="${item.id}">Видалити</button>
        </div>
    `;
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const subtotalElement = document.getElementById('subtotal');
    const totalAmountElement = document.getElementById('total-amount');

    if (!container) return; 

    container.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center p-4">Ой, ваш кошик порожній! 🍯 Перейдіть до <a href="shop.html">Магазину</a>.</p>';
    } else {
        cart.forEach(item => {
            container.innerHTML += generateCartItemHTML(item);
            subtotal += item.price * item.quantity;
        });
    }

    if (!container) {
         console.error('Контейнер cart-items-container не знайдено!'); // ⬅️ ДОПОМОЖЕ ЗНАЙТИ ПОМИЛКУ
         return; 
    }
    
    if (subtotalElement) { subtotalElement.textContent = subtotal.toFixed(2) + ' UAH'; }
    if (totalAmountElement) { totalAmountElement.textContent = subtotal.toFixed(2) + ' UAH'; }
    
    attachEventListeners(); 

    
}

// =================================================================
// 4. ЗАПУСК СКРИПТУ: Навішування слухачів на кнопки "Додати до кошика" (для shop.html)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Логіка для сторінки КОШИК (cart.html)
    if (document.getElementById('cart-items-container')) {
        renderCart(); 
    }
    
    // 2. Логіка для сторінки МАГАЗИН (shop.html)
    const shopButtons = document.querySelectorAll('.add-to-cart-btn');

    shopButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.product-card'); 
            
            if (card) {
                // Зчитуємо дані, які тепер мають бути у data-* атрибутах
                const id = card.getAttribute('data-product-id');
                const name = card.getAttribute('data-name');
                const priceText = card.getAttribute('data-price');
                const price = parseFloat(priceText); // Перетворюємо рядок на число

                if (id && name && !isNaN(price)) {
                    addToCart(id, name, price);
                } else {
                    alert('Помилка: Не знайдено ID, Назви або Ціни товару!');
                }
            }
        });
    });
});