// ── Init ──────────────────────────────────────────────────────────────────────

renderViews();
initShareModal();
initDevPanel();
document.getElementById('hub-greeting').textContent =
  GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
renderBreadcrumb();
