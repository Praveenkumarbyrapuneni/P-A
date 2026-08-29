// Resources page: category drawer-tab filter.
const tabs = document.querySelectorAll(".rs-tab");
const cards = document.querySelectorAll(".rs-index-card");
const count = document.getElementById("rs-count");
const empty = document.getElementById("rs-empty");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    const filter = tab.dataset.filter;
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.hidden = !match;
      if (match) shown++;
    });
    count.textContent = `${shown} article${shown === 1 ? "" : "s"} shown`;
    empty.hidden = shown > 0;
  });
});
