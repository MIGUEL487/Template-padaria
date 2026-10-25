(() => {
  const home = document.querySelector('.home');
  const links = [...document.querySelectorAll('.menu-link')];
  const label = document.querySelector('[data-scene-label]');
  const motionButton = document.querySelector('[data-motion-toggle]');
  if (!home || !links.length) return;

  const labels = {
    cardapio: 'O cardápio',
    paes: 'Pães artesanais',
    cafes: 'Cafés',
    encomendas: 'Encomendas',
    historia: 'Nossa história',
  };

  const setScene = (scene) => {
    home.dataset.scene = scene;
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.scene === scene));
    if (label) label.textContent = labels[scene] || labels.cardapio;
  };

  const enter = (event) => setScene(event.currentTarget.dataset.scene);
  const leave = () => setScene('cardapio');
  links.forEach((link) => {
    link.addEventListener('pointerenter', enter);
    link.addEventListener('focus', enter);
    link.addEventListener('pointerleave', leave);
    link.addEventListener('blur', leave);
  });

  let motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setMotion = (off) => {
    motionOff = off;
    document.documentElement.dataset.motion = off ? 'off' : 'on';
    motionButton?.setAttribute('aria-pressed', String(off));
    if (motionButton) motionButton.firstChild.textContent = off ? 'Movimento pausado ' : 'Movimento ';
  };
  setMotion(motionOff);
  motionButton?.addEventListener('click', () => setMotion(!motionOff));

  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('page-hidden', document.hidden);
  });

  window.addEventListener('pagehide', () => {
    links.forEach((link) => {
      link.removeEventListener('pointerenter', enter);
      link.removeEventListener('focus', enter);
      link.removeEventListener('pointerleave', leave);
      link.removeEventListener('blur', leave);
    });
  }, { once: true });
})();
