(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var MN = '−';
  var SUB = '₀₁₂₃₄₅₆₇₈₉';

  function f(v) { return String(v).replace('-', MN); }
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }
  function sub(n) { return String(n).replace(/\d/g, function (d) { return SUB.charAt(+d); }); }
  function minor(m, i, j) {
    return m.filter(function (_, r) { return r !== i; }).map(function (row) { return row.filter(function (_, c) { return c !== j; }); });
  }
  function det(m) {
    var n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    var s = 0;
    for (var j = 0; j < n; j++) s += (j % 2 ? -1 : 1) * m[0][j] * det(minor(m, 0, j));
    return s;
  }
  function cof(m, i, j) { return ((i + j) % 2 ? -1 : 1) * det(minor(m, i, j)); }
  function sumExpr(t) {
    var s = f(t[0]);
    for (var k = 1; k < t.length; k++) s += t[k] >= 0 ? ' + ' + f(t[k]) : ' ' + MN + ' ' + f(-t[k]);
    return s;
  }
  function mxHtml(rows, marks, cls) {
    var h = '<span class="mx det ' + (cls || '') + '" style="grid-template-columns:repeat(' + rows[0].length + ',auto)" aria-hidden="true">';
    rows.forEach(function (r, i) { r.forEach(function (v, j) { h += '<i class="' + ((marks && marks[i + ',' + j]) || '') + '">' + f(v) + '</i>'; }); });
    return h + '</span>';
  }
  function label(s, i, j) { return s + sub(i + 1) + sub(j + 1); }
  function mat(w) { try { return JSON.parse(w.getAttribute('data-m')); } catch (e) { return null; } }

  /* ── вставка 1: минор и алгебраическое дополнение ── */
  $$('.widget[data-w=minor]').forEach(function (w) {
    var m = mat(w); if (!m) return;
    var n = m.length, grid = $('.w-grid', w), out = $('.w-out', w), sel = [1, 2];
    grid.style.gridTemplateColumns = 'repeat(' + n + ',auto)';
    function draw() {
      var i = sel[0], j = sel[1], mn = minor(m, i, j), M = det(mn), A = cof(m, i, j), s = i + j + 2;
      grid.innerHTML = '';
      m.forEach(function (row, r) {
        row.forEach(function (v, c) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = (r === i && c === j) ? 'sel' : (r === i || c === j) ? 'cx' : 'kp';
          b.textContent = f(v);
          b.setAttribute('aria-pressed', r === i && c === j ? 'true' : 'false');
          b.setAttribute('aria-label', 'элемент ' + label('a', r, c) + ' = ' + v);
          b.addEventListener('click', function () { sel = [r, c]; draw(); var again = $$('button', grid)[r * n + c]; if (again) again.focus(); });
          grid.appendChild(b);
        });
      });
      var expr = n === 3 ? par(mn[0][0]) + '·' + par(mn[1][1]) + ' ' + MN + ' ' + par(mn[0][1]) + '·' + par(mn[1][0]) : '';
      var odd = s % 2 === 1, mid = odd ? MN + par(M) : f(M), parts = [label('A', i, j) + ' = ' + (odd ? MN : '') + label('M', i, j), mid];
      if (mid !== f(A)) parts.push(f(A));
      out.innerHTML =
        '<p>Выбрали <b class="m">' + label('a', i, j) + ' = ' + f(m[i][j]) + '</b>. Вычёркиваем строку ' + (i + 1) + ' и столбец ' + (j + 1) + '.</p>' +
        '<p>Остаётся: ' + mxHtml(mn, null, 'sm') + ' поэтому <b class="m">' + label('M', i, j) + (expr ? ' = ' + expr : '') + ' = ' + f(M) + '</b></p>' +
        '<p>Знак: <span class="m">i + j = ' + (i + 1) + ' + ' + (j + 1) + ' = ' + s + '</span> — ' + (s % 2 ? 'нечётное, значит «' + MN + '»' : 'чётное, значит «+»') + '.</p>' +
        '<p><span class="res">' + parts.join(' = ') + '</span></p>';
    }
    draw();
  });

  /* ── вставка 2: разложение по любому ряду ── */
  $$('.widget[data-w=expand]').forEach(function (w) {
    var m = mat(w); if (!m) return;
    var n = m.length, tabs = $('.w-tabs', w), out = $('.w-out', w), cur = ['r', 0], D = det(m);
    var names = [];
    for (var k = 0; k < n; k++) names.push(['r', k, 'Строка ' + (k + 1)]);
    for (k = 0; k < n; k++) names.push(['c', k, 'Столбец ' + (k + 1)]);
    function terms(t, k) {
      var res = [];
      for (var q = 0; q < n; q++) {
        var i = t === 'r' ? k : q, j = t === 'r' ? q : k;
        res.push({ a: m[i][j], A: cof(m, i, j), i: i, j: j });
      }
      return res;
    }
    function draw() {
      tabs.innerHTML = '';
      names.forEach(function (nm) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = nm[2];
        b.setAttribute('aria-pressed', nm[0] === cur[0] && nm[1] === cur[1] ? 'true' : 'false');
        b.addEventListener('click', function () { cur = [nm[0], nm[1]]; draw(); var again = $$('button', tabs)[names.indexOf(nm)]; if (again) again.focus(); });
        tabs.appendChild(b);
      });
      var ts = terms(cur[0], cur[1]), marks = {}, cm = [];
      for (var i = 0; i < n; i++) { cm.push([]); for (var j = 0; j < n; j++) { cm[i].push(cof(m, i, j)); if ((cur[0] === 'r' && i === cur[1]) || (cur[0] === 'c' && j === cur[1])) marks[i + ',' + j] = 'k'; } }
      var sym = ts.map(function (t) { return label('a', t.i, t.j) + label('A', t.i, t.j); }).join(' + ');
      var num = ts.map(function (t) { return par(t.a) + '·' + par(t.A); }).join(' + ');
      var prods = ts.map(function (t) { return t.a * t.A; });
      var all = '';
      names.forEach(function (nm) {
        var s = terms(nm[0], nm[1]).reduce(function (x, t) { return x + t.a * t.A; }, 0);
        all += '<li class="' + (nm[0] === cur[0] && nm[1] === cur[1] ? 'cur' : '') + '">' + nm[2] + ' → ' + f(s) + '</li>';
      });
      out.innerHTML =
        '<p>Раскладываем по ' + (cur[0] === 'r' ? 'строке ' : 'столбцу ') + (cur[1] + 1) + ':</p>' +
        '<p class="m">det = ' + sym + '</p>' +
        '<p class="m">= ' + num + '</p>' +
        '<p class="m">= ' + sumExpr(prods) + ' = ' + f(prods.reduce(function (x, y) { return x + y; }, 0)) + '</p>' +
        '<p>Алгебраические дополнения (выбранный ряд подсвечен): ' + mxHtml(cm, marks, 'sm') + '</p>' +
        '<p><span class="res">det = ' + f(D) + '</span></p>' +
        '<p class="w-h">Что получится при разложении по любому из шести рядов:</p><ul class="w-all">' + all + '</ul>';
    }
    draw();
  });

  /* ── вставка 3: произведение матриц, клик по клетке результата ── */
  $$('.widget[data-w=matmul]').forEach(function (w) {
    var A, B;
    try { A = JSON.parse(w.getAttribute('data-a')); B = JSON.parse(w.getAttribute('data-b')); } catch (e) { return; }
    var m = A.length, n = B.length, p = B[0].length, box = $('.mm', w), out = $('.w-out', w), sel = [m - 1, 0];
    function gridOf(rows, mark) {
      var g = document.createElement('div');
      g.className = 'mm-grid'; g.style.gridTemplateColumns = 'repeat(' + rows[0].length + ',auto)';
      rows.forEach(function (r, i) { r.forEach(function (v, j) { var c = document.createElement('span'); c.textContent = f(v); if (mark(i, j)) c.className = mark(i, j); g.appendChild(c); }); });
      return g;
    }
    function op(t) { var s = document.createElement('span'); s.className = 'op'; s.textContent = t; return s; }
    function draw() {
      var i = sel[0], k = sel[1], C = [];
      for (var r = 0; r < m; r++) { C.push([]); for (var c = 0; c < p; c++) { var s = 0; for (var t = 0; t < n; t++) s += A[r][t] * B[t][c]; C[r].push(s); } }
      box.innerHTML = '';
      box.appendChild(gridOf(A, function (r) { return r === i ? 'hr' : ''; }));
      box.appendChild(op('·'));
      box.appendChild(gridOf(B, function (r, c) { return c === k ? 'hc' : ''; }));
      box.appendChild(op('='));
      var g = document.createElement('div'); g.className = 'mm-grid'; g.style.gridTemplateColumns = 'repeat(' + p + ',auto)';
      C.forEach(function (row, r) {
        row.forEach(function (v, c) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = f(v);
          if (r === i && c === k) b.className = 'sel';
          b.setAttribute('aria-pressed', r === i && c === k ? 'true' : 'false');
          b.setAttribute('aria-label', 'элемент ' + label('c', r, c) + ' = ' + v);
          b.addEventListener('click', function () { sel = [r, c]; draw(); var again = $$('button', g)[r * p + c]; if (again) again.focus(); });
          g.appendChild(b);
        });
      });
      box.appendChild(g);
      var terms = [], vals = [];
      for (var q = 0; q < n; q++) { terms.push(par(A[i][q]) + '·' + par(B[q][k])); vals.push(A[i][q] * B[q][k]); }
      out.innerHTML = '<p>Элемент <b class="m">' + label('c', i, k) + '</b>: строка ' + (i + 1) + ' первой матрицы (синяя) на столбец ' + (k + 1) + ' второй (оранжевый), попарно перемножаем и складываем:</p>' +
        '<p class="m">' + label('c', i, k) + ' = ' + terms.join(' + ') + ' = ' + sumExpr(vals) + ' = <b>' + f(C[i][k]) + '</b></p>';
    }
    draw();
  });

  /* ── задания: число, набор чисел, выбор ответа, подстановка, поиск ошибки, самопроверка ── */
  var KEY = 'pm-art-tasks';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* без хранилища тоже работает */ } }
  function ico(n) { return '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>'; }
  function J(el, name, dflt) { var v = el.getAttribute(name); if (!v) return dflt; try { return JSON.parse(v); } catch (e) { return dflt; } }
  /* простое число: 12, -7, 0,25, 1/4 (минус можно обычным дефисом) */
  function norm(s) {
    s = String(s).replace(/[−–—]/g, '-').replace(',', '.').replace(/\s+/g, '').replace(/^\+/, '');
    if (/^-?\d+\/\d+$/.test(s)) { var p = s.split('/'); return +p[1] === 0 ? null : parseInt(p[0], 10) / parseInt(p[1], 10); }
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null;
  }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function numHint(hints, v) {
    var keys = Object.keys(hints || {});
    for (var i = 0; i < keys.length; i++) { var k = norm(keys[i]); if (k !== null && v !== null && near(k, v)) return hints[keys[i]]; }
    return '';
  }

  $$('.tasks').forEach(function (box) {
    var st = load(), tasks = $$('.task', box), score = $('.score', box);
    function paint() {
      var k = tasks.filter(function (t) { return st[t.getAttribute('data-id')]; }).length;
      score.textContent = 'Решено: ' + k + ' из ' + tasks.length;
    }
    tasks.forEach(function (t) {
      var id = t.getAttribute('data-id'), type = t.getAttribute('data-type') || 'num', res = $('.task-res', t), btn = $('.chk', t),
          hints = J(t, 'data-hints', {}), HINT0 = 'Проверь знаки и подсчёты, а если застрянешь, открой решение ниже.';
      function done(msg) { st[id] = 1; save(st); t.classList.add('solved'); res.className = 'task-res ok'; res.innerHTML = ico('check-circle') + msg; paint(); }
      function fail(text) { res.className = 'task-res no'; res.textContent = ''; res.insertAdjacentHTML('beforeend', ico('x-circle')); res.appendChild(document.createTextNode(text)); }
      if (st[id]) { t.classList.add('solved'); res.className = 'task-res ok'; res.innerHTML = ico('check-circle') + 'Решено раньше.'; }

      if (type === 'num') {
        var inp = $('.task-row input', t), ans = J(t, 'data-ans', []);
        var checkNum = function () {
          var v = norm(inp.value);
          if (v === null) { fail('Нужно число, например ' + MN + '7, 0,25 или 1/4.'); return; }
          if (ans.some(function (a) { return near(a, v); })) { done('Верно!'); return; }
          fail('Пока не так. ' + (numHint(hints, v) || HINT0));
        };
        btn.addEventListener('click', checkNum);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkNum(); } });
      } else if (type === 'vec' || type === 'mat') {
        var grid = $('.task-grid', t), sh = (J(t, 'data-opts', {}).shape || '1x3').split('x'), R = +sh[0], C = +sh[1], ref = J(t, 'data-ref', []), cells = [];
        grid.style.gridTemplateColumns = 'repeat(' + C + ',minmax(0,84px))';
        var checkGrid = function () {
          var bad = 0, parse = false;
          cells.forEach(function (c, i) { c.classList.remove('bad'); var v = norm(c.value); if (v === null) parse = true; if (v === null || !near(v, ref[i])) { c.classList.add('bad'); bad++; } });
          if (parse) { fail('В клетках должны быть числа, например ' + MN + '7, 0,25 или 1/4.'); return; }
          if (!bad) { done('Верно!'); return; }
          var h = ''; (hints.list || []).some(function (hn) { var all = cells.every(function (c, i) { return near(norm(c.value), hn.ref[i]); }); if (all) h = hn.text; return all; });
          fail('Пока не так. ' + (h || 'Красным отмечены клетки, где не сходится. ' + HINT0));
        };
        for (var q = 0; q < R * C; q++) {
          var c = document.createElement('input'); c.type = 'text'; c.autocomplete = 'off'; c.spellcheck = false;
          c.setAttribute('aria-label', type === 'vec' ? 'компонента ' + (q + 1) : 'строка ' + (Math.floor(q / C) + 1) + ', столбец ' + (q % C + 1));
          c.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkGrid(); } });
          grid.appendChild(c); cells.push(c);
        }
        btn.addEventListener('click', checkGrid);
      } else if (type === 'choice') {
        var want = J(t, 'data-correct', []).slice().sort(), why = J(t, 'data-why', []);
        btn.addEventListener('click', function () {
          var sel = $$('input:checked', t).map(function (v) { return +v.value; }).sort();
          if (!sel.length) { fail('Выбери хотя бы один вариант.'); return; }
          if (JSON.stringify(sel) === JSON.stringify(want)) { done('Верно!'); return; }
          var wrong = sel.filter(function (v) { return want.indexOf(v) < 0; }), msg = '';
          if (wrong.length && why[wrong[0]]) msg = why[wrong[0]];
          else if (!wrong.length) msg = 'Отмечено верно, но этого мало: верных вариантов больше.';
          else msg = want.length > 1 ? 'Верных вариантов несколько: проверь каждый отдельно.' : 'Подумай ещё раз, а если застрянешь, открой решение.';
          fail('Пока не так. ' + msg);
        });
      } else if (type === 'fill') {
        var corr = J(t, 'data-correct', []), selects = $$('select', t);
        btn.addEventListener('click', function () {
          var bad = 0, empty = false;
          selects.forEach(function (s, i) { s.classList.remove('bad'); if (s.value === '') { empty = true; s.classList.add('bad'); bad++; } else if (+s.value !== corr[i]) { s.classList.add('bad'); bad++; } });
          if (empty) { fail('Заполни все пропуски.'); return; }
          if (!bad) done('Верно!'); else fail('Пока не так: красным отмечены неверные пропуски. ' + HINT0);
        });
      } else if (type === 'self') {
        var reveal = $('.reveal', t), sb = $('.self-btns', t), sol = $('details.sol', t);
        reveal.addEventListener('click', function () { if (sol) sol.open = true; sb.hidden = false; res.className = 'task-res'; res.textContent = 'Сравни своё решение с решением ниже и отметь результат.'; });
        $('.self-ok', t).addEventListener('click', function () { done('Отлично!'); });
        $('.self-no', t).addEventListener('click', function () { fail('Ничего страшного: разбери решение по шагам и попробуй ещё раз.'); });
      }
    });
    paint();
  });
})();
