const stickyCta = document.querySelector('.sticky-cta');
const groups = document.querySelector('#grupos');

const updateStickyCta = () => {
  if (!stickyCta || !groups) return;
  const groupsTop = groups.getBoundingClientRect().top;
  const shouldShow = window.scrollY > 320 && groupsTop > window.innerHeight * 0.35;
  stickyCta.classList.toggle('visible', shouldShow);
};

window.addEventListener('scroll', updateStickyCta, { passive: true });
updateStickyCta();

document.querySelectorAll('[data-group]').forEach((link) => {
  link.addEventListener('click', () => {
    const group = link.dataset.group;
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'WhatsAppGroupClick', { group });
    }
    window.dispatchEvent(new CustomEvent('crivo:group-click', { detail: { group } }));
  });
});
