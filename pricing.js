// 💱 songsforchoirs universal pricing helper — multi-currency edition
document.addEventListener("DOMContentLoaded", async () => {
  // 🎯 Find every button with data-price
  const buttons = document.querySelectorAll("[data-price]");
  if (!buttons.length) return;

  // 🌍 Fetch live USD + EUR rates (base GBP)
  let rates = { USD: 1.28, EUR: 1.17 }; // fallback if fetch fails
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=GBP&symbols=USD,EUR");
    const data = await res.json();
    rates = data?.rates || rates;
  } catch {
    console.warn("💱 Rate fetch failed — using fallback", rates);
  }

  // 💱 Show all three currencies
  buttons.forEach(el => {
    const priceGBP = parseFloat(el.dataset.price);
    if (isNaN(priceGBP)) return;

    const usd = (priceGBP * rates.USD).toFixed(2);
    const eur = (priceGBP * rates.EUR).toFixed(2);

    el.innerHTML = `Order Here — $${usd} <small>(€${eur}, £${priceGBP.toFixed(2)})</small> per part`;
  });
});

