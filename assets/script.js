// پرانتز — یک انیمیشن ساده‌ی تایپ برای ترمینال هیرو، فقط همین یک حرکت در کل سایت.

(function () {
  var el = document.getElementById('terminal-type');
  if (!el) return;

  var lines = [
    '<span class="k">const</span> post = <span class="fn">write</span>({',
    '  <span class="k">topic</span>: <span class="s">"web design"</span>,',
    '  <span class="k">author</span>: <span class="s">"Amiryasin Yousefi"</span>,',
    '  <span class="k">status</span>: <span class="s">"published"</span>,',
    '});',
    '',
    '<span class="c">// یک وبلاگ ساده، برای رزومه‌ای که خودش را نشان می‌دهد</span>',
  ];

  var i = 0;
  var out = [];

  function typeLine() {
    if (i >= lines.length) {
      el.innerHTML = out.join('<br>') + '<span class="caret"></span>';
      return;
    }
    var full = lines[i];
    var plain = full.replace(/<[^>]+>/g, '');
    var len = plain.length;
    var shown = 0;

    // برای سطرهای خالی، بدون افکت رد شو
    if (len === 0) {
      out.push('');
      i++;
      setTimeout(typeLine, 120);
      return;
    }

    var interval = setInterval(function () {
      shown++;
      // یک برش تقریبی از HTML بر اساس نسبت پیشرفت (کافی برای جلوه‌ی بصری)
      var ratio = shown / len;
      var cut = Math.floor(full.length * ratio);
      out[i] = full.slice(0, Math.max(cut, shown));
      el.innerHTML = out.join('<br>') + '<span class="caret"></span>';
      if (shown >= len) {
        clearInterval(interval);
        out[i] = full;
        i++;
        setTimeout(typeLine, 140);
      }
    }, 18);
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.innerHTML = lines.join('<br>');
  } else {
    typeLine();
  }

  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
})();
