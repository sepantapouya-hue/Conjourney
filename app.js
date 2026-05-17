(() => {
  const stagesEl = document.getElementById("stages");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panelBody");
  const panelClose = document.getElementById("panelClose");
  const scrim = document.getElementById("scrim");
  const chips = document.querySelectorAll(".chip");

  const TYPE_LABEL = {
    email: "Email",
    banner: "Banner",
    modal: "Modal",
    widget: "Widget",
    toast: "Toast",
    backend: "Backend",
    roadmap: "Roadmap",
  };

  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]),
    );
  }

  function renderEvent(ev, stageCtx) {
    const btn = document.createElement("button");
    btn.className = `event ${ev.type}`;
    btn.dataset.type = ev.type;
    btn.innerHTML = `
      <div class="ico">${escapeHtml(ev.icon || "•")}</div>
      <div class="body">
        <div class="h">${escapeHtml(ev.title)} <span class="tag">${TYPE_LABEL[ev.type] || ev.type}</span></div>
        <div class="s">${escapeHtml(ev.subtitle || "")}</div>
      </div>
    `;
    btn.addEventListener("click", () => openPanel(ev, stageCtx));
    return btn;
  }

  function renderStage(s) {
    const wrap = document.createElement("div");
    wrap.className = `stage ${s.lane}`;
    wrap.innerHTML = `
      <div class="marker">
        <div class="num">${s.n}</div>
        <div class="when">${escapeHtml(s.when || "")}</div>
      </div>
    `;

    const card = document.createElement("div");
    card.className = "stage-card";
    card.innerHTML = `
      <div class="stage-title">
        <h3>${escapeHtml(s.title)}</h3>
        ${s.where ? `<div class="where">${escapeHtml(s.where)}</div>` : ""}
      </div>
      <p class="stage-desc">${escapeHtml(s.desc || "")}</p>
      <div class="events"></div>
    `;
    const eventsEl = card.querySelector(".events");
    s.events.forEach((ev) => eventsEl.appendChild(renderEvent(ev, s)));

    // visual connector to spine
    if (s.lane === "merchant" || s.lane === "shopper") {
      const c = document.createElement("div");
      c.className = "connector";
      card.appendChild(c);
    }

    wrap.appendChild(card);
    return wrap;
  }

  STAGES.forEach((s) => stagesEl.appendChild(renderStage(s)));

  // Filter behavior
  let active = "all";
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      active = chip.dataset.filter;
      applyFilter();
    });
  });

  function applyFilter() {
    document.querySelectorAll(".event").forEach((el) => {
      if (active === "all" || el.dataset.type === active) {
        el.classList.remove("dimmed");
      } else {
        el.classList.add("dimmed");
      }
    });
  }

  // Side panel
  function openPanel(ev, stageCtx) {
    const meta = ev.meta || [];
    const tagColorMap = {
      email: "var(--email)",
      banner: "var(--banner)",
      modal: "var(--modal)",
      widget: "var(--widget)",
      toast: "var(--toast)",
      backend: "var(--backend)",
      roadmap: "var(--roadmap)",
    };
    const tagBg = tagColorMap[ev.type] || "#fff";
    panelBody.innerHTML = `
      <span class="tag" style="background:${tagBg}">${TYPE_LABEL[ev.type] || ev.type}</span>
      <h3>${escapeHtml(ev.title)}</h3>
      <div class="who">${escapeHtml(stageCtx ? `Stage ${stageCtx.n} · ${stageCtx.when} · ${stageCtx.lane === "both" ? "Cross-cutting" : stageCtx.lane}` : "")}</div>
      ${ev.subject ? `<p><strong style="color:var(--ink)">Subject:</strong> ${escapeHtml(ev.subject)}</p>` : ""}
      <p>${escapeHtml(ev.detail || ev.subtitle || "")}</p>
      ${ev.quote ? `<div class="quote" style="color:${tagBg}">"${escapeHtml(ev.quote)}"</div>` : ""}
      ${
        meta.length
          ? `<div class="kv">${meta
              .map(
                ([k, v]) =>
                  `<div><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div></div>`,
              )
              .join("")}</div>`
          : ""
      }
    `;
    panel.classList.add("open");
    scrim.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    panel.classList.remove("open");
    scrim.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }
  panelClose.addEventListener("click", closePanel);
  scrim.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
})();
