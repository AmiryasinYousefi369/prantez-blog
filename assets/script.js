(function () {
  var canvas = document.getElementById('net');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W, H, dpr;
  var points = [];
  var mouse = { x: -9999, y: -9999, active: false };

  var ACCENT = [124, 92, 255];   // #7c5cff
  var ACCENT_2 = [167, 139, 250]; // #a78bfa

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initPoints();
  }

  function initPoints() {
    var density = (W * H) / 15000;
    var count = Math.max(28, Math.min(90, Math.round(density)));
    points = [];
    for (var i = 0; i < count; i++) {
      points.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.4
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // update + draw points
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      var near = mouse.active && dist(p, mouse) < 160;
      var col = near ? ACCENT_2 : ACCENT;
      var alpha = near ? 0.9 : 0.45;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
      ctx.fill();
    }

    // connecting lines
    var maxDist = 130;
    for (var a = 0; a < points.length; a++) {
      for (var b = a + 1; b < points.length; b++) {
        var d = dist(points[a], points[b]);
        if (d < maxDist) {
          var op = (1 - d / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.strokeStyle = 'rgba(124,92,255,' + op + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (mouse.active) {
        var dm = dist(points[a], mouse);
        if (dm < 170) {
          var opm = (1 - dm / 170) * 0.35;
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(167,139,250,' + opm + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  function dist(p1, p2) {
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,92,255,0.4)';
      ctx.fill();
    }
  }

  hero.addEventListener('pointermove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  hero.addEventListener('pointerleave', function () {
    mouse.active = false;
  });

  window.addEventListener('resize', resize);
  resize();

  if (reduceMotion) {
    drawStatic();
  } else {
    requestAnimationFrame(step);
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
