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

    el.innerHTML = `Order Here — £${priceGBP.toFixed(2)} <small>(€${eur}, $${usd})</small> per part`;
  });
});
// 🎨 Hide hover tag and disable link if placeholder image is shown
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img.placeholder").forEach(img => {
    // find the nearest figure and hover tag
    const figure = img.closest("figure.cover");
    if (figure) {
      const tag = figure.querySelector(".hover-tag");
      if (tag) tag.style.display = "none";
    }

    // disable the nearest link — whether above, below, or wrapping the figure
    const link = img.closest("a") || figure?.querySelector("a");
    if (link) link.removeAttribute("href");
  });
});


