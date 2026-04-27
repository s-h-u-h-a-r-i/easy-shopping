// ── Init ──────────────────────────────────────────────────────────────────────

renderViews();
initShareModal();
document.getElementById('hub-greeting').textContent =
  GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
renderBreadcrumb();
