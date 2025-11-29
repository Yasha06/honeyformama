from flask import Flask, render_template, session, request, redirect, url_for
from flask_bootstrap import Bootstrap5
import flask, os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_KEY', 'my_secret_key_for_testing')
Bootstrap5(app)

@app.route('/')
def home():
    return render_template("home.html")


@app.route('/apples', methods=["GET", "POST"])
def apples():
        return render_template("apples.html")


# ДОДАЄМО НОВИЙ РОУТ ДЛЯ ОБРОБКИ ДОДАВАННЯ В КОШИК
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    # Отримуємо дані з форми
    name = request.form.get('product_name')
    price = request.form.get('product_price')
    image = request.form.get('product_image')

    # Дістаємо поточний кошик
    cart = session.get('cart', [])

    # Прапорець: чи знайшли ми такий товар у списку?
    item_found = False

    # 1. Проходимося по кошику і перевіряємо, чи є вже такий товар
    for item in cart:
        if item['name'] == name:
            # Якщо назва збігається, збільшуємо кількість на 1
            item['quantity'] += 1
            item_found = True
            break  # Зупиняємо цикл, ми вже зробили роботу

    # 2. Якщо цикл закінчився, а товар ми так і не знайшли (item_found == False)
    # Тільки тоді додаємо новий запис
    if not item_found:
        cart.append({
            'name': name,
            'price': int(price),
            'image': image,
            'quantity': 1
        })

    # Зберігаємо зміни
    session['cart'] = cart
    session.modified = True

    return redirect(url_for('shop'))


# ФУНКЦІЯ ОНОВЛЕННЯ КІЛЬКОСТІ
@app.route('/update_cart', methods=['POST'])
def update_cart():
        # Отримуємо індекс товару в списку та нову кількість
        index = int(request.form.get('index'))
        quantity = int(request.form.get('quantity'))

        # Отримуємо кошик
        cart = session.get('cart', [])

        # Перевіряємо, чи коректний індекс і кількість
        if 0 <= index < len(cart) and quantity > 0:
                cart[index]['quantity'] = quantity
                session['cart'] = cart  # Оновлюємо сесію
                session.modified = True  # Кажемо Flask, що дані змінилися

        return redirect(url_for('cart'))


# ФУНКЦІЯ ВИДАЛЕННЯ ТОВАРУ
@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
        index = int(request.form.get('index'))

        cart = session.get('cart', [])

        if 0 <= index < len(cart):
                cart.pop(index)  # Видаляємо елемент за індексом
                session['cart'] = cart
                session.modified = True

        return redirect(url_for('cart'))

@app.route('/cart', methods=["GET", "POST"])
def cart():
        # Дістаємо кошик із сесії, або порожній список, якщо нічого немає
        cart_items = session.get('cart', [])

        # Рахуємо загальну суму (чиста математика Python)
        total_sum = sum(item['price'] * item['quantity'] for item in cart_items)

        # Передаємо ці змінні у шаблон
        return render_template("cart.html", cart=cart_items, total=total_sum)


@app.route('/checkout', methods=["GET", "POST"])
def checkout():
    cart = session.get('cart', [])

    # Розрахунки
    total_quantity = sum(item['quantity'] for item in cart)
    subtotal = sum(item['price'] * item['quantity'] for item in cart)
    delivery_cost = 70
    grand_total = subtotal + delivery_cost

    if request.method == 'POST':
        # 1. Збираємо дані для чеку
        order_details = {
            'order_id': f"ORD-{int(datetime.now().timestamp())}",
            'date': datetime.now().strftime("%d.%m.%Y %H:%M"),
            'name': request.form.get('name'),
            'phone': request.form.get('phone'),
            'city': request.form.get('city'),
            'delivery': request.form.get('delivery'),
            'payment': request.form.get('payment'),

            'products': cart,  # <--- ЗМІНИЛИ ТУТ (було 'items')

            'total': grand_total
        }

        # 2. Очищаємо кошик
        session.pop('cart', None)

        # 3. Показуємо сторінку-чек і передаємо туди дані
        return render_template("success.html", order=order_details)

    return render_template("checkout.html",
                           cart=cart,
                           quantity=total_quantity,
                           subtotal=subtotal,
                           delivery=delivery_cost,
                           grand_total=grand_total)


@app.route('/cupcakes', methods=["GET", "POST"])
def cupcakes():
        return render_template("cupcakes.html")


@app.route('/medivnyk', methods=["GET", "POST"])
def medivnyk():
        return render_template("medivnyk.html")


@app.route('/pahlava', methods=["GET", "POST"])
def pahlava():
        return render_template("pahlava.html")


@app.route('/pancakes', methods=["GET", "POST"])
def pancakes():
        return render_template("pancakes.html")

@app.route('/pie', methods=["GET", "POST"])
def pie():
        return render_template("pie.html")


@app.route('/recipes', methods=["GET", "POST"])
def recipes():
        return render_template("recipes.html")


@app.route('/shop', methods=["GET", "POST"])
def shop():
        return render_template("shop.html")





if __name__ == "__main__":
    app.run(debug=False)

