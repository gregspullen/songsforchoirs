document.addEventListener("DOMContentLoaded", () => {
    let basePage = 1;
  
    const preview = document.getElementById("score-preview");
    const hover = document.querySelector(".hover-tag");
  
    if (!preview || !hover) {
      return;
    }
  
    const piece =
      typeof PIECES !== "undefined" ? PIECES[slug] : null;
  
    preview.innerHTML = `
      <img
        class="preview-cover"
        src="images/Cover_png/${slug}.png"
        alt="${piece ? piece.title : "Score"} cover">
    `;
  
    if (!piece || !piece.hasScore) {
      hover.textContent = "Preview not yet available";
      preview.style.cursor = "default";
      return;
    }
  
    function findFirstPage(callback) {
      let i = 1;
  
      function check() {
        const test = new Image();
  
        const filename =
          `preview_images/${slug}/${slug}_${String(i).padStart(4, "0")}.png`;
  
        test.onload = () => {
          basePage = i;
          callback();
        };
  
        test.onerror = () => {
          i++;
  
          if (i < 10) {
            check();
          } else {
            basePage = 1;
            callback();
          }
        };
  
        test.src = filename;
      }
  
      check();
    }
  
    function loadScorePages() {
      preview.innerHTML = "";
      hover.style.display = "none";
  
      let pageNumber = basePage;
  
      function loadNextPage() {
        const filename =
          `preview_images/${slug}/${slug}_${String(pageNumber).padStart(4, "0")}.png`;
  
        const page = new Image();
  
        page.className = "preview-page";
        page.alt = `${piece.title} score page ${pageNumber - basePage + 1}`;
  
        page.onload = () => {
          preview.appendChild(page);
          pageNumber++;
          loadNextPage();
        };
  
        page.onerror = () => {
          if (!preview.children.length) {
            preview.innerHTML = "<p>Score preview unavailable.</p>";
          }
        };
  
        page.src = filename;
      }
  
      loadNextPage();
    }
  
    findFirstPage(() => {
      preview.addEventListener("click", loadScorePages, { once: true });
    });
  });