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
    const eventId = `group-${group}-${Date.now()}-${crypto.randomUUID()}`;

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: `WhatsApp: ${group}` }, { eventID: eventId });
    }

    fetch('/api/meta-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, eventId }),
      keepalive: true,
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('crivo:group-click', { detail: { group } }));
  });
});
