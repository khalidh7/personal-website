const canvas = document.querySelector('#surface');
const context = canvas.getContext('2d');
const themeButton = document.querySelector('#theme');
const projectPage = document.body.classList.contains('project-page');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const typedCopy = document.querySelector('.typed-copy');
const glyphs = ['.', '·', ':', '/', '\\', '|', '`'];
const texture = [];
const ripples = [];
let width = 0;
let height = 0;
let dpr = 1;
let frame = 0;

if (typedCopy) {
  const introText = "hi, i'm khalid abouelrous.";
  if (reduceMotion) {
    typedCopy.textContent = introText;
  } else {
    let character = 0;
    const typeNextCharacter = () => {
      character += 1;
      typedCopy.textContent = introText.slice(0, character);
      if (character < introText.length) setTimeout(typeNextCharacter, 58);
    };
    setTimeout(typeNextCharacter, 280);
  }
}

function seeded(index) {
  const value = Math.sin(index * 9283.17 + 17.31) * 43758.5453;
  return value - Math.floor(value);
}

function buildTexture() {
  texture.length = 0;
  const count = Math.min(420, Math.floor((width * height) / 6200));
  for (let index = 0; index < count; index += 1) {
    texture.push({
      x: seeded(index * 3) * width,
      y: seeded(index * 3 + 1) * height,
      glyph: glyphs[Math.floor(seeded(index * 3 + 2) * glyphs.length)],
      alpha: .035 + seeded(index * 7) * .065,
    });
  }
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildTexture();
}

function addRipple(x, y) {
  const seed = Math.random() * 1000;
  const particles = Array.from({ length: 13 }, (_, index) => ({
    angle: seeded(seed + index * 2) * Math.PI * 2,
    distance: 10 + seeded(seed + index * 2 + 1) * 48,
    glyph: ['.', '+', '*'][index % 3],
    delay: seeded(seed + index * 5) * .16,
  }));
  ripples.push({ x, y, born: performance.now(), particles });
  if (ripples.length > 6) ripples.shift();
  document.body.classList.add('has-ripple');
}

function drawTexture() {
  context.font = '10px "SFMono-Regular", Consolas, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const light = document.body.classList.contains('light');
  for (const point of texture) {
    context.fillStyle = light
      ? `rgba(59, 68, 53, ${point.alpha * 1.25})`
      : `rgba(184, 212, 189, ${point.alpha})`;
    context.fillText(point.glyph, point.x, point.y);
  }
}

function drawRipple(ripple, now) {
  const progress = ((now - ripple.born) / 1000) / 1.05;
  if (progress >= 1) return false;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (const particle of ripple.particles) {
    const localProgress = Math.max(0, (progress - particle.delay) / (1 - particle.delay));
    if (localProgress <= 0) continue;
    const ease = 1 - Math.pow(1 - localProgress, 3);
    const fade = Math.pow(1 - localProgress, 2);
    const distance = particle.distance * ease;
    const x = ripple.x + Math.cos(particle.angle) * distance;
    const y = ripple.y + Math.sin(particle.angle) * distance * .72;
    context.font = `${particle.glyph === '*' ? 11 : 9}px "SFMono-Regular", Consolas, monospace`;
    context.fillStyle = document.body.classList.contains('light')
      ? `rgba(52, 57, 47, ${fade * .55})`
      : `rgba(233, 227, 189, ${fade * .62})`;
    context.fillText(particle.glyph, x, y);
  }
  return true;
}

function render(now) {
  context.clearRect(0, 0, width, height);
  drawTexture();
  for (let index = ripples.length - 1; index >= 0; index -= 1) {
    if (!drawRipple(ripples[index], now)) ripples.splice(index, 1);
  }
  if (ripples.length === 0) document.body.classList.remove('has-ripple');
  frame = requestAnimationFrame(render);
}

canvas.addEventListener('pointerdown', (event) => {
  if (!reduceMotion) addRipple(event.clientX, event.clientY);
});
themeButton.addEventListener('click', () => {
  const light = document.body.classList.toggle('light');
  themeButton.setAttribute('aria-pressed', String(light));
  themeButton.textContent = light ? 'dark' : 'light';
  themeButton.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} mode`);
  document.querySelector('meta[name="theme-color"]').content = light ? '#e7e2c7' : '#101411';
});
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(frame);
  else frame = requestAnimationFrame(render);
});

if (projectPage) {
  const pageHeader = document.querySelector('header');
  let lastScrollY = scrollY;
  let upwardTravel = 0;

  const updateProjectNav = () => {
    const currentScrollY = Math.max(0, scrollY);
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 8) {
      pageHeader.classList.add('nav-visible');
      upwardTravel = 0;
    } else if (delta > 5) {
      pageHeader.classList.remove('nav-visible');
      upwardTravel = 0;
    } else if (delta < 0) {
      upwardTravel += Math.abs(delta);
      if (upwardTravel >= 24) pageHeader.classList.add('nav-visible');
    }

    lastScrollY = currentScrollY;
  };

  pageHeader.classList.toggle('nav-visible', scrollY <= 8);
  requestAnimationFrame(() => document.body.classList.add('nav-ready'));
  addEventListener('scroll', updateProjectNav, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((element) => observer.observe(element));

  const progressBar = document.querySelector('.scroll-progress span');
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - innerHeight;
    const progress = available > 0 ? scrollY / available : 0;
    progressBar.style.width = `${Math.min(1, progress) * 100}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

resize();
if (!reduceMotion) frame = requestAnimationFrame(render);
