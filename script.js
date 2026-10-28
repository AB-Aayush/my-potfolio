/* ============================================================
   script.js — Portfolio interactivity
   1. Star field canvas
   2. Rocket cursor + smooth-follow
   3. Rocket navigation (click → fly → scroll)
   4. Scroll-triggered card animations
   ============================================================ */

/* ─── 1. STAR FIELD ─── */
(function () {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize () {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initStars();
  }

  function initStars () {
    stars = [];
    const N = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < N; i++) {
      stars.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.4 + 0.3,
        a:  Math.random(),
        da: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        // tiny drift
        dx: (Math.random() - 0.5) * 0.08,
        dy: (Math.random() - 0.5) * 0.08,
        // occasional green tint
        color: Math.random() < 0.12 ? '#00ff88' : '#ffffff'
      });
    }
  }

  function drawStars () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a  += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.x  = (s.x + s.dx + canvas.width)  % canvas.width;
      s.y  = (s.y + s.dy + canvas.height) % canvas.height;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', resize);
  resize();
  drawStars();
})();


/* ─── 2. ROCKET CURSOR ─── */
(function () {
  const rocket = document.getElementById('rocket-cursor');
  let rx = window.innerWidth / 2;
  let ry = window.innerHeight / 2;
  let tx = rx, ty = ry;
  let visible = false;

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      rocket.style.display = 'block';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    rocket.style.display = 'none';
    visible = false;
  });

  // Smooth follow
  function animateCursor () {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    rocket.style.left = rx + 'px';
    rocket.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();


/* ─── 3. ROCKET NAVIGATION ─── */
(function () {
  const rocket   = document.getElementById('rocket-cursor');
  let flying     = false;

  function getRocketPos () {
    return {
      x: parseFloat(rocket.style.left  || 0),
      y: parseFloat(rocket.style.top   || 0)
    };
  }

  function flyTo (targetEl, cb) {
    if (flying) return;
    flying = true;

    const rect    = targetEl.getBoundingClientRect();
    const destX   = rect.left + rect.width  / 2;
    const destY   = rect.top  + rect.height / 2;
    let   pos     = getRocketPos();
    const dx      = destX - pos.x;
    const dy      = destY - pos.y;
    const dist    = Math.hypot(dx, dy);
    const angle   = Math.atan2(dy, dx) * (180 / Math.PI);
    const speed   = Math.max(dist / 40, 8);   // px per frame
    const frames  = Math.ceil(dist / speed);
    let   frame   = 0;

    // Tilt rocket towards target
    rocket.style.transform = `translate(-50%,-50%) rotate(${angle - 45}deg)`;
    rocket.style.filter    = 'drop-shadow(0 0 14px #00ff88) drop-shadow(0 0 30px #00ff88)';

    function step () {
      frame++;
      const t = frame / frames;
      // ease-in-out
      const et = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      rocket.style.left = (pos.x + dx * et) + 'px';
      rocket.style.top  = (pos.y + dy * et) + 'px';

      if (frame < frames) {
        requestAnimationFrame(step);
      } else {
        rocket.style.transform = 'translate(-50%,-50%) rotate(-45deg)';
        rocket.style.filter    = 'drop-shadow(0 0 6px #00ff88)';
        flying = false;
        if (cb) cb();
      }
    }

    requestAnimationFrame(step);
  }

  // Intercept all anchor link clicks
  document.querySelectorAll('a[href^="#"], .nav-link, .cta-btn').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      flyTo(target, () => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  });
})();


/* ─── 4. SCROLL CARD ANIMATIONS ─── */
(function () {
  const cards = document.querySelectorAll('.card');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => io.observe(c));
})();


/* ─── 5. SKILL BAR TRIGGER ON SCROLL ─── */
(function () {
  const fills = document.querySelectorAll('.skill-fill');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'growBar 1.4s ease forwards';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => io.observe(f));
})();

