/* static/js/recipes.js */

function recalcIngredients() {
    const input = document.getElementById('portions');
    if (!input) return;

    const newPortions = parseFloat(input.value);
    const basePortions = parseFloat(input.getAttribute('data-base-portions'));

    if (!newPortions || newPortions < 1) return;

    const items = document.querySelectorAll('li[data-original-amount]');

    items.forEach(item => {
        const originalAmount = parseFloat(item.getAttribute('data-original-amount'));

        let calculatedAmount = (originalAmount / basePortions) * newPortions;

        // --- БЛОК ОКРУГЛЕННЯ ШТУК (Яйця) ---
        // Перевіряємо текст елемента на наявність слів "шт" або "Яйця"
        // toLowerCase() робить перевірку нечутливою до регістру
        const text = item.innerText.toLowerCase();
        if (text.includes("шт") || text.includes("яйця")) {
            calculatedAmount = Math.round(calculatedAmount);
        }

        const displayValue = formatFraction(calculatedAmount);

        const amountSpan = item.querySelector('.amount');
        if (amountSpan) amountSpan.innerText = displayValue;
    });
}

function formatFraction(value) {
    // 1. Якщо число велике (> 5), округлюємо до цілого (грами, мл, яйця після 5 шт)
    if (value > 5) return Math.round(value);

    // 2. ЗБІЛЬШЕНА ПОХИБКА (було 0.15, стало 0.2)
    // Це допоможе 2.1 перетворити на 2
    const epsilon = 0.2;

    // Якщо число майже ціле (наприклад 2.15 -> 2)
    if (Math.abs(value - Math.round(value)) < epsilon) {
        return Math.round(value);
    }

    const wholePart = Math.floor(value);
    const decimalPart = value - wholePart;
    let fractionString = "";

    // Перевірка дробів
    if (Math.abs(decimalPart - 0.5) < epsilon) fractionString = "1/2";
    else if (Math.abs(decimalPart - 0.25) < epsilon) fractionString = "1/4";
    else if (Math.abs(decimalPart - 0.75) < epsilon) fractionString = "3/4";
    else if (Math.abs(decimalPart - 0.333) < epsilon) fractionString = "1/3";
    else if (Math.abs(decimalPart - 0.666) < epsilon) fractionString = "2/3";
    else if (Math.abs(decimalPart - 0.166) < epsilon) fractionString = "1/6";
    else if (Math.abs(decimalPart - 0.125) < epsilon) fractionString = "1/8";

    if (fractionString) return wholePart > 0 ? `${wholePart} ${fractionString}` : fractionString;

    // Якщо нічого не підійшло — 1 знак після коми
    return value.toFixed(1);
}