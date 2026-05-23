// Staggered reveal of the three selling-points on the landing page.
// Original used jQuery; rewritten as vanilla DOM. No imports — this
// file is self-contained.

function animatePoints() {
  document.querySelectorAll('.point').forEach((point) => {
    point.style.opacity = '1';
    point.style.transform = 'scaleX(1) translateY(0)';
  });
}

function init() {
  // Short viewports (mobile-ish phones in landscape, etc.) see the
  // points immediately rather than waiting for a scroll trigger that
  // may never fire above the fold.
  if (window.innerHeight > 950) {
    animatePoints();
  }

  const sellingPoints = document.querySelector('.selling-points');
  if (!sellingPoints) return;

  // Document-relative top: viewport-relative .top + scrollY.
  const rect = sellingPoints.getBoundingClientRect();
  const scrollDistance = rect.top + window.scrollY - window.innerHeight + 200;

  window.addEventListener('scroll', () => {
    if (window.scrollY >= scrollDistance) {
      animatePoints();
    }
  });
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
