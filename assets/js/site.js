/* =====================================================================
   Byanca Sttephany Cabelos: site.js
   Cada bloco fica no próprio escopo ({ }), com let/const: nome repetido
   entre blocos não apaga o outro (armadilha que quebrou a capa da Bem Viver).
   ===================================================================== */
(function () {
  "use strict";

  const html = document.documentElement;
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ZAP = "5531986937384";
  const zapLink = (texto) => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(texto);
  const comAbertura = () => !html.classList.contains("sem-abertura");

  /* ------------------------------------------------------------------ *
   * 1. ABERTURA: uma vez por sessão; clique ou Esc pula; saída de
   *    segurança aos 5 s, caso a animação não termine (aba em segundo plano).
   * ------------------------------------------------------------------ */
  {
    const abertura = document.querySelector(".abertura");
    if (abertura && comAbertura()) {
      try { sessionStorage.setItem("bs-abertura", "1"); } catch (e) {}
      const fechar = () => {
        if (abertura.classList.contains("feita")) return;
        abertura.classList.add("feita");
        html.classList.add("sem-abertura");
        document.removeEventListener("keydown", tecla);
      };
      const tecla = (e) => { if (e.key === "Escape") fechar(); };
      if (reduzido) fechar();
      abertura.addEventListener("click", fechar);
      document.addEventListener("keydown", tecla);
      abertura.addEventListener("animationend", (e) => { if (e.animationName === "some") fechar(); });
      setTimeout(fechar, 5200);
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. TOPO com fundo depois de rolar, e WhatsApp flutuante depois do
   *    hero (some onde a página já tem o próprio botão de WhatsApp)
   * ------------------------------------------------------------------ */
  {
    const topo = document.querySelector(".topo");
    const flutuante = document.querySelector(".zap-flutuante");
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      const y = window.scrollY;
      topo.classList.toggle("rolou", y > 12);
      if (flutuante) flutuante.classList.toggle("mostra", y > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    atualizar();

    if (flutuante && "IntersectionObserver" in window) {
      const vistas = new Set();
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => { if (en.isIntersecting) vistas.add(en.target); else vistas.delete(en.target); });
        flutuante.classList.toggle("escondido", vistas.size > 0);
      }, { threshold: 0.1 });
      document.querySelectorAll(".montador, .rodape").forEach((s) => io.observe(s));
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. HERO COBERTO PELO SCROLL (padrão do site do Marcelo, home.js).
   *    --cobre vai de 0 a 1.
   * ------------------------------------------------------------------ */
  const hero = document.querySelector(".hero");
  let heroCoberto = false;
  if (hero) {
    let alturaHero = 0, inicio = 0, pedido = false;
    const atualizar = () => {
      pedido = false;
      let p = (window.scrollY - inicio) / window.innerHeight;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      hero.style.setProperty("--cobre", reduzido ? 0 : p.toFixed(3));
      heroCoberto = p >= 1;
    };
    const medir = () => {
      alturaHero = hero.offsetHeight;
      // hero mais alto que a tela (celular): trava só depois de mostrar o fim dele
      const topo = Math.min(0, window.innerHeight - alturaHero);
      hero.style.setProperty("--hero-topo", topo + "px");
      inicio = Math.max(0, alturaHero - window.innerHeight);
      atualizar();
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    window.addEventListener("resize", medir);
    medir();

  }

  /* ------------------------------------------------------------------ *
   * 4. MENSAGEM DE CLIENTE no topo: trechos literais dos feedbacks que
   *    ela publicou, trocando como notificação enquanto o topo está à vista
   * ------------------------------------------------------------------ */
  {
    const caixa = document.querySelector(".hero__msg");
    const texto = document.querySelector("[data-msg-texto]");
    const hora = document.querySelector("[data-msg-hora]");

    // celular: a notificação vai no vão entre o queixo dela e o texto, que muda
    // de altura de aparelho pra aparelho (em 360x740 ela caía em cima do selo).
    // Mede, centraliza no vão e, se não couber, some: nunca por cima do rosto
    // nem do texto. offsetTop não sente o translate da entrada nem o --cobre.
    let encaixar = () => {};
    if (caixa && hero) {
      const celular = window.matchMedia("(max-width: 899px)");
      const fundo = hero.querySelector(".hero__fundo");
      const wrap = hero.querySelector(".hero__wrap");
      const textoHero = hero.querySelector(".hero__texto");
      const QUEIXO = 0.43; // na foto quadrada, o queixo dela fica a 43% da altura
      encaixar = () => {
        if (!celular.matches) { caixa.style.top = ""; caixa.classList.remove("sem-espaco"); return; }
        const lado = Math.max(fundo.offsetWidth, fundo.offsetHeight);
        const corte = (lado - fundo.offsetHeight) * 0.12; // object-position 50% 12%
        const queixo = fundo.offsetTop + lado * QUEIXO - corte;
        const vao = wrap.offsetTop + textoHero.offsetTop - queixo;
        const alt = caixa.offsetHeight;
        const cabe = vao >= alt + 10;
        caixa.classList.toggle("sem-espaco", !cabe);
        if (cabe) caixa.style.top = Math.round(queixo + (vao - alt) / 2) + "px";
      };
      encaixar();
      window.addEventListener("resize", encaixar);
      window.addEventListener("load", encaixar);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(encaixar);
    }

    if (caixa && texto && !reduzido) {
      const MSGS = [
        ["Meu cabelo ficou perfeito ❤️", "01:21"],
        ["Eu amei meu cabelo, está brilhando demais 😊", "18:42"],
        ["Sua escova é perfeita", "16:48"],
        ["Lavei meu cabelo e ele ficou ótimo", "09:13"],
        ["Meu cabelo tá lisinho", "12:37"],
        ["Amiga estou amando, trabalho maravilhoso 🤩", "agora"]
      ];
      let i = 0;
      setTimeout(() => {
        setInterval(() => {
          if (document.hidden || heroCoberto) return;
          i = (i + 1) % MSGS.length;
          texto.textContent = MSGS[i][0];
          hora.textContent = MSGS[i][1];
          encaixar();
          caixa.classList.remove("troca");
          void caixa.offsetWidth;
          caixa.classList.add("troca");
        }, 4200);
      }, comAbertura() ? 3400 : 0);
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. PARALLAX GERAL: [data-px] anda na vertical e [data-px-x] na
   *    horizontal, proporcional à distância até o meio da tela. Posição
   *    em cache (só relê no resize); escreve em `translate`.
   *    No celular, metade da força.
   * ------------------------------------------------------------------ */
  if (!reduzido) {
    const celular = window.matchMedia("(max-width: 900px)");
    let itens = [];
    const medir = () => {
      itens = [...document.querySelectorAll("[data-px], [data-px-x]")].map((el) => {
        el.style.translate = "";
        const r = el.getBoundingClientRect();
        return { el, centro: r.top + window.scrollY + r.height / 2, vy: parseFloat(el.dataset.px || 0), vx: parseFloat(el.dataset.pxX || 0) };
      });
      atualizar();
    };
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      const meio = window.scrollY + window.innerHeight / 2;
      const forca = celular.matches ? 0.5 : 1;
      for (const it of itens) {
        const d = (it.centro - meio) * forca;
        if (Math.abs(d) > window.innerHeight * 1.6) continue;
        it.el.style.translate = (it.vx ? (d * -it.vx).toFixed(1) + "px " : "0 ") + (it.vy ? (d * it.vy).toFixed(1) + "px" : "0");
      }
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    window.addEventListener("resize", medir);
    window.addEventListener("load", medir);
    medir();
  }

  /* ------------------------------------------------------------------ *
   * 6. QUANDO ENTRA NA TELA: os desenhos dos cartões "Na sua casa / No
   *    studio" se fazem em traço, e a frase da história é riscada.
   *    O texto é legível antes e depois: nada fica escondido.
   * ------------------------------------------------------------------ */
  {
    const alvos = document.querySelectorAll(".modo, [data-risco]");
    if ("IntersectionObserver" in window && !reduzido) {
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add(en.target.matches("[data-risco]") ? "riscado" : "visto");
          io.unobserve(en.target);
        });
      }, { threshold: 0.45 });
      alvos.forEach((a) => io.observe(a));
    } else {
      alvos.forEach((a) => a.classList.add(a.matches("[data-risco]") ? "riscado" : "visto"));
    }
  }

  /* ------------------------------------------------------------------ *
   * 7. SELAGEM, ANTES E DEPOIS NA VERTICAL: fios desenhados num canvas e
   *    uma linha que sobe e desce, como a prancha passando no fio. Acima
   *    dela o cabelo está liso; abaixo, com frizz. A passagem tem 40 px de
   *    queda suave, senão o fio dá um degrau na linha.
   *    Arrasto: a faixa da linha prende o dedo (touch-action: none); o resto
   *    do quadro deixa a página rolar e um toque leva a linha até ali. Com
   *    mouse, arrasta de qualquer ponto. Teclado: setas, Page Up/Down, Home
   *    e End. O frizz balança só com o quadro à vista.
   * ------------------------------------------------------------------ */
  {
    const caixa = document.querySelector("[data-prancha]");
    const tela = caixa && caixa.querySelector("canvas");
    const ctx = tela && tela.getContext ? tela.getContext("2d") : null;
    if (caixa && ctx) {
      const linha = caixa.querySelector("[data-prancha-linha]");
      const seloA = caixa.querySelector("[data-selo-a]");
      const seloD = caixa.querySelector("[data-selo-d]");
      const beneficios = [...document.querySelectorAll("[data-beneficios] li")];
      const fim = document.querySelector("[data-prancha-fim]");
      // castanho escuro com mechas douradas, como o cabelo das peças dela
      const CORES = ["#21120D", "#2B1811", "#341E15", "#3F2519", "#4C2E1F", "#5F3B26", "#7A4E30", "#9C6B40", "#BF8D57"];
      const PASSO = 8;
      const MEIA = 20;

      let W = 0, H = 0, fios = [];
      let p = 0.5, visivel = false, rodando = false, mexeu = false, animacao = null;

      const semente = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

      const criar = () => {
        const r = caixa.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.round(r.width);
        H = Math.round(r.height);
        tela.width = Math.round(W * dpr);
        tela.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const rnd = semente(11);
        const n = Math.round(W / (W < 520 ? 4.6 : 5.6));
        fios = [];
        for (let i = 0; i < n; i++) {
          const comp = H * (0.86 + rnd() * 0.2);
          const pontos = Math.ceil(comp / PASSO) + 1;
          const ruido = new Float32Array(pontos);
          for (let j = 0; j < pontos; j++) ruido[j] = rnd() * 2 - 1;
          fios.push({
            base: rnd() * (W + 50) - 25,
            comp, pontos, ruido,
            cor: CORES[Math.floor(Math.pow(rnd(), 1.5) * CORES.length)],
            larg: 1.1 + rnd() * 1.3,
            a1: 6 + rnd() * 11, k1: 0.03 + rnd() * 0.045, p1: rnd() * 6.28,
            a2: 2 + rnd() * 4.5, k2: 0.13 + rnd() * 0.14, p2: rnd() * 6.28,
            curva: (rnd() - 0.5) * 14,
            solto: rnd() < 0.4 ? Math.floor(pontos * (0.35 + rnd() * 0.55)) : -1,
            lado: rnd() < 0.5 ? -1 : 1
          });
        }
        // os mais claros por cima, como mecha
        fios.sort((a, b) => CORES.indexOf(a.cor) - CORES.indexOf(b.cor));
      };

      // quanto frizz tem na altura y: 0 acima da linha, 1 abaixo (smoothstep)
      const frizzEm = (y, corte) => {
        const q = (y - corte + MEIA) / (MEIA * 2);
        return q <= 0 ? 0 : q >= 1 ? 1 : q * q * (3 - 2 * q);
      };

      // x de um ponto: base + curva natural + frizz (ondas, ruído e volume)
      const xDe = (fio, j, y, f, t) => {
        const fr = y / fio.comp;
        let x = fio.base + fio.curva * fr * fr;
        if (f > 0.001) {
          const env = 0.22 + 0.78 * fr;
          const vol = ((fio.base - W / 2) / (W / 2)) * 30 * fr;
          x += f * (env * (fio.a1 * Math.sin(fio.k1 * y + fio.p1 + t * 0.0007) + fio.a2 * Math.sin(fio.k2 * y + fio.p2 + t * 0.0013)) + fio.ruido[j] * 2.6 * env + vol);
        }
        return x;
      };

      const desenhar = (agora) => {
        const t = reduzido ? 0 : agora;
        const corte = p * H;
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // a luz fica no meio da parte lisa, e anda com a linha
        const brilhoY = Math.max(46, Math.min(H * 0.34, corte * 0.48));
        const brilhoA = 54;
        const luz = ctx.createLinearGradient(0, brilhoY - brilhoA, 0, brilhoY + brilhoA);
        luz.addColorStop(0, "rgba(251, 227, 195, 0)");
        luz.addColorStop(0.5, "rgba(255, 238, 214, 1)");
        luz.addColorStop(1, "rgba(251, 227, 195, 0)");

        for (const fio of fios) {
          const xs = new Float32Array(fio.pontos);
          ctx.beginPath();
          for (let j = 0; j < fio.pontos; j++) {
            const y = j * PASSO - 8;
            xs[j] = xDe(fio, j, y, frizzEm(y, corte), t);
            if (j === 0) ctx.moveTo(xs[0], y);
            else ctx.quadraticCurveTo(xs[j - 1], y - PASSO, (xs[j - 1] + xs[j]) / 2, y - PASSO / 2);
          }
          ctx.strokeStyle = fio.cor;
          ctx.lineWidth = fio.larg;
          ctx.globalAlpha = 1;
          ctx.stroke();

          // fio arrepiado: um pedacinho que escapa, só na parte com frizz
          if (fio.solto > 0) {
            const y = fio.solto * PASSO - 8;
            const fs = frizzEm(y, corte);
            if (fs > 0.15) {
              const x = xs[fio.solto];
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.quadraticCurveTo(x + fio.lado * 16 * fs, y - 10 * fs, x + fio.lado * 24 * fs, y + 4);
              ctx.globalAlpha = Math.min(1, fs * 1.2);
              ctx.lineWidth = fio.larg * 0.8;
              ctx.stroke();
            }
          }

          // brilho: um degradê vertical só, e a força vem do quanto o fio
          // está liso dentro da faixa
          const j0 = Math.max(0, Math.floor((brilhoY - brilhoA + 8) / PASSO));
          const j1 = Math.min(fio.pontos - 1, Math.ceil((brilhoY + brilhoA + 8) / PASSO));
          if (j1 - j0 < 2) continue;
          let liso = 0;
          for (let j = j0; j <= j1; j++) liso += 1 - frizzEm(j * PASSO - 8, corte);
          liso /= j1 - j0 + 1;
          if (liso < 0.05) continue;
          ctx.beginPath();
          ctx.moveTo(xs[j0], j0 * PASSO - 8);
          for (let j = j0 + 1; j <= j1; j++) ctx.lineTo(xs[j], j * PASSO - 8);
          ctx.strokeStyle = luz;
          ctx.lineWidth = fio.larg * 0.95;
          ctx.globalAlpha = liso * liso * 0.85;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };

      // posição da linha (0 em cima, 1 embaixo): CSS, selos, slider e benefícios
      const pintar = (v) => {
        p = v < 0 ? 0 : v > 1 ? 1 : v;
        caixa.style.setProperty("--p", (p * 100).toFixed(2) + "%");
        const pct = Math.round(p * 100);
        linha.setAttribute("aria-valuenow", pct);
        linha.setAttribute("aria-valuetext", pct + "% do cabelo com selagem");
        seloD.style.opacity = p < 0.13 ? 0 : 1;
        seloA.style.opacity = p > 0.87 ? 0 : 1;
        beneficios.forEach((li) => li.classList.toggle("aceso", p >= parseFloat(li.dataset.limiar)));
        fim.classList.toggle("feito", p >= 0.97);
        if (reduzido || !rodando) desenhar(performance.now());
      };

      const quadro = (agora) => {
        if (!visivel || reduzido) { rodando = false; return; }
        if (animacao) {
          const k = Math.min(1, (agora - animacao.inicio) / animacao.dur);
          let i = 1;
          while (i < animacao.roteiro.length - 1 && k > animacao.roteiro[i][0]) i++;
          const [ka, va] = animacao.roteiro[i - 1], [kb, vb] = animacao.roteiro[i];
          const f = Math.min(1, Math.max(0, (k - ka) / (kb - ka)));
          const suave = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          pintar(va + (vb - va) * suave);
          if (k >= 1) animacao = null;
        }
        desenhar(agora);
        requestAnimationFrame(quadro);
      };
      const acordar = () => { if (!rodando && visivel && !reduzido) { rodando = true; requestAnimationFrame(quadro); } };

      // leva a linha até v, deslizando (toque fora da linha)
      const irPara = (v) => {
        if (reduzido) { pintar(v); return; }
        animacao = { inicio: performance.now(), dur: 380, roteiro: [[0, p], [1, v]] };
        acordar();
      };

      const yRel = (e) => (e.clientY - caixa.getBoundingClientRect().top) / H;
      let arrastando = false, arrastou = false;
      caixa.addEventListener("pointerdown", (e) => {
        const naLinha = !!e.target.closest("[data-prancha-linha]");
        if (!naLinha && e.pointerType !== "mouse") return;
        mexeu = true;
        animacao = null;
        arrastando = true;
        arrastou = true;
        caixa.classList.add("arrastando");
        try { caixa.setPointerCapture(e.pointerId); } catch (erro) {}
        pintar(yRel(e));
        e.preventDefault();
      });
      caixa.addEventListener("pointermove", (e) => { if (arrastando) pintar(yRel(e)); });
      const soltar = () => { arrastando = false; caixa.classList.remove("arrastando"); };
      caixa.addEventListener("pointerup", soltar);
      caixa.addEventListener("pointercancel", soltar);
      // toque fora da linha: o dedo não arrasta (a página rola), mas o toque leva a linha
      caixa.addEventListener("click", (e) => {
        if (arrastou) { arrastou = false; return; }
        mexeu = true;
        irPara(yRel(e));
      });
      linha.addEventListener("keydown", (e) => {
        const passos = { ArrowUp: -0.05, ArrowLeft: -0.05, ArrowDown: 0.05, ArrowRight: 0.05, PageUp: -0.2, PageDown: 0.2 };
        let v = null;
        if (e.key in passos) v = p + passos[e.key];
        else if (e.key === "Home") v = 0;
        else if (e.key === "End") v = 1;
        if (v === null) return;
        e.preventDefault();
        mexeu = true;
        animacao = null;
        pintar(v);
      });

      let largura = 0;
      const aoRedimensionar = () => {
        const w = Math.round(caixa.getBoundingClientRect().width);
        if (w !== largura) { largura = w; criar(); desenhar(performance.now()); }
      };
      window.addEventListener("resize", aoRedimensionar);
      aoRedimensionar();
      pintar(0.5);

      if ("IntersectionObserver" in window) {
        let empurrou = false;
        new IntersectionObserver((entradas) => {
          visivel = entradas[0].isIntersecting;
          if (!visivel) return;
          acordar();
          // o empurrãozinho do molde: na primeira vez, a linha sobe, desce e
          // volta pro meio, pra ninguém achar que é imagem parada
          if (!empurrou && !mexeu && !reduzido && entradas[0].intersectionRatio > 0.5) {
            empurrou = true;
            setTimeout(() => {
              if (mexeu) return;
              animacao = { inicio: performance.now(), dur: 1700, roteiro: [[0, p], [0.3, 0.26], [0.7, 0.76], [1, 0.5]] };
              acordar();
            }, 350);
          }
        }, { threshold: [0, 0.6] }).observe(caixa);
      } else { visivel = true; acordar(); }
    }
  }

  /* ------------------------------------------------------------------ *
   * 8. FOLÍCULO (terapia capilar): abas e pontos trocam a parte acesa.
   *    Troca sozinho a cada 4,5 s, com a seção à vista, até o primeiro
   *    toque. Setas do teclado andam entre as abas.
   * ------------------------------------------------------------------ */
  {
    const fol = document.querySelector("[data-fol]");
    if (fol) {
      const PARTES = ["fibra", "couro", "bulbo"];
      const abas = [...document.querySelectorAll("[data-partes] [role=tab]")];
      const pontos = [...fol.querySelectorAll(".fol__ponto")];
      const itens = [...document.querySelectorAll("[data-painel-item]")];
      const painel = document.querySelector("[data-painel]");
      let atual = "fibra", mexeu = false, visivel = false;

      const mostrar = (p, foco) => {
        atual = p;
        fol.dataset.ativo = p;
        abas.forEach((a) => {
          const sim = a.dataset.parteBtn === p;
          a.setAttribute("aria-selected", sim ? "true" : "false");
          a.tabIndex = sim ? 0 : -1;
          if (sim && foco) a.focus();
        });
        pontos.forEach((b) => b.classList.toggle("ativo", b.dataset.parteBtn === p));
        itens.forEach((it) => it.classList.toggle("ativo", it.dataset.painelItem === p));
        painel.setAttribute("aria-labelledby", "tab-" + p);
      };

      document.querySelectorAll("[data-parte-btn]").forEach((b) => {
        b.addEventListener("click", () => { mexeu = true; mostrar(b.dataset.parteBtn); });
      });
      document.querySelector("[data-partes]").addEventListener("keydown", (e) => {
        if (!/^Arrow(Left|Right)$/.test(e.key)) return;
        e.preventDefault();
        mexeu = true;
        const k = PARTES.indexOf(atual) + (e.key === "ArrowRight" ? 1 : -1);
        mostrar(PARTES[(k + PARTES.length) % PARTES.length], true);
      });

      if (!reduzido) {
        if ("IntersectionObserver" in window) {
          new IntersectionObserver((en) => { visivel = en[0].isIntersecting; }, { threshold: 0.35 }).observe(fol);
        }
        setInterval(() => {
          if (mexeu || !visivel || document.hidden) return;
          mostrar(PARTES[(PARTES.indexOf(atual) + 1) % PARTES.length]);
        }, 4500);
      }
      mostrar("fibra");
    }
  }

  /* ------------------------------------------------------------------ *
   * 9. COMO FUNCIONA: a linha acende conforme a página desce
   * ------------------------------------------------------------------ */
  {
    const lista = document.querySelector("[data-passos]");
    if (lista && !reduzido) {
      const passos = [...lista.children];
      let pedido = false;
      const atualizar = () => {
        pedido = false;
        const r = lista.getBoundingClientRect();
        let p = (window.innerHeight * 0.62 - r.top) / r.height;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        lista.style.setProperty("--avanco", p.toFixed(3));
        passos.forEach((li, i) => li.classList.toggle("aceso", p >= i / (passos.length - 1) - 0.02));
      };
      window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
      window.addEventListener("resize", atualizar);
      atualizar();
    } else if (lista) {
      [...lista.children].forEach((li) => li.classList.add("aceso"));
    }
  }

  /* ------------------------------------------------------------------ *
   * 10. MONTADOR: as escolhas viram a mensagem do WhatsApp, com prévia.
   *     Os links "Quero esse" dos serviços já chegam com o serviço marcado.
   * ------------------------------------------------------------------ */
  {
    const m = document.querySelector("[data-montador]");
    if (m) {
      const estado = { servico: "", cabelo: "", onde: "", quando: "" };
      const SERVICO = { escova: "escova e prancha", selagem: "selagem sem formol", terapia: "uma avaliação de terapia capilar", tratamento: "hidratação ou cronograma capilar" };
      const QUANDO = { semana: "Seria pra essa semana.", proxima: "Seria pra semana que vem.", data: "É pra uma data especial." };
      const previa = m.querySelector("[data-previa]");
      const zap = m.querySelector("[data-montador-zap]");
      const bairro = m.querySelector("[data-bairro-input]");

      const mensagem = () => {
        // ⚠️ SEM EMOJI (16/10/2026): o 💖 chegava como "�" no WhatsApp. O wa.me
        // redireciona e perde os emojis de 4 bytes no caminho; o site mandava certo
        let t = "Oi, Byanca! Vim pelo site";
        if (estado.servico === "duvida") t += " e ainda não sei qual procedimento fazer. Pode me ajudar a escolher?";
        else if (estado.servico) t += " e queria agendar " + SERVICO[estado.servico] + ".";
        else t += " e queria agendar um horário.";
        const linhas = [];
        if (estado.cabelo) linhas.push("Meu cabelo é " + estado.cabelo + ".");
        if (estado.onde === "casa") {
          const b = bairro.value.trim();
          linhas.push("Prefiro atendimento na minha casa" + (b ? ", no bairro " + b : "") + ".");
        }
        if (estado.onde === "studio") linhas.push("Prefiro ir até o seu studio.");
        if (estado.quando) linhas.push(QUANDO[estado.quando]);
        if (linhas.length) t += "\n" + linhas.join(" ");
        return t + "\nQual horário você tem?";
      };

      const atualizar = (animar) => {
        const t = mensagem();
        previa.textContent = t;
        zap.href = zapLink(t);
        m.dataset.onde = estado.onde;
        if (animar && !reduzido) { previa.classList.remove("nova"); void previa.offsetWidth; previa.classList.add("nova"); }
      };

      const grupos = [...m.querySelectorAll("[data-grupo]")];
      const marcar = (grupo, valor) => {
        const botoes = [...grupo.querySelectorAll("[role=radio]")];
        botoes.forEach((b, k) => {
          const sim = b.dataset.valor === valor;
          b.setAttribute("aria-checked", sim ? "true" : "false");
          b.tabIndex = sim || (!valor && k === 0) ? 0 : -1;
        });
      };
      const definir = (chave, valor, animar) => {
        estado[chave] = valor;
        marcar(m.querySelector('[data-grupo="' + chave + '"]'), valor);
        atualizar(animar);
      };

      grupos.forEach((grupo) => {
        const chave = grupo.dataset.grupo;
        grupo.addEventListener("click", (e) => {
          const b = e.target.closest("[role=radio]");
          if (b) definir(chave, b.dataset.valor, true);
        });
        grupo.addEventListener("keydown", (e) => {
          if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
          const botoes = [...grupo.querySelectorAll("[role=radio]")];
          const k = botoes.findIndex((b) => b.getAttribute("aria-checked") === "true");
          const passo = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
          const prox = botoes[((k < 0 ? 0 : k + passo) + botoes.length) % botoes.length];
          e.preventDefault();
          definir(chave, prox.dataset.valor, true);
          prox.focus();
        });
        marcar(grupo, "");
      });
      bairro.addEventListener("input", () => atualizar(false));

      document.querySelectorAll("[data-servico]").forEach((a) => {
        a.addEventListener("click", () => definir("servico", a.dataset.servico, true));
      });

      atualizar(false);
    }
  }

  /* ------------------------------------------------------------------ *
   * 11. ANTES E DEPOIS DE CLIENTE (molde templates/componentes/antes-depois.html):
   *     o range invisível manda o --p do quadro. A seta do teclado anda 5%
   *     (o step 0.1 sozinho não movia nada). Na primeira vez que aparece, a
   *     cortina anda sozinha e volta, senão parece foto parada.
   * ------------------------------------------------------------------ */
  {
    document.querySelectorAll("[data-ad]").forEach((ad) => {
      const quadro = ad.querySelector(".ad__quadro");
      const range = ad.querySelector(".ad__range");
      const selA = ad.querySelector("[data-selo-a]");
      const selD = ad.querySelector("[data-selo-d]");
      if (!quadro || !range) return;

      const pinta = (v) => {
        quadro.style.setProperty("--p", v + "%");
        // os selos apagam quando a cortina chega neles
        if (selA) selA.style.opacity = v < 18 ? 0 : 1;
        if (selD) selD.style.opacity = v > 82 ? 0 : 1;
      };
      range.addEventListener("input", () => pinta(range.value));
      range.addEventListener("keydown", (e) => {
        const passo = e.key === "ArrowRight" || e.key === "ArrowUp" ? 5 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -5 : 0;
        if (!passo) return;
        e.preventDefault();
        range.value = Math.max(0, Math.min(100, parseFloat(range.value) + passo));
        pinta(range.value);
      });
      pinta(range.value);

      if (reduzido || !("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver((entradas) => {
        if (!entradas.some((en) => en.isIntersecting)) return;
        io.disconnect();
        let ini = null;
        const DUR = 1500;
        const passo = (t) => {
          if (ini === null) ini = t;
          const p = Math.min((t - ini) / DUR, 1);
          // vai até 66, volta até 34 e assenta em 50
          const v = 50 + Math.sin(p * Math.PI * 2) * 16 * (1 - p);
          range.value = p < 1 ? v : 50;
          pinta(range.value);
          if (p < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      }, { threshold: 0.45 });
      io.observe(quadro);
    });
  }

  /* ------------------------------------------------------------------ *
   * 12. VÍDEOS DE LEVEZA: sem som e em loop, tocam só enquanto aparecem na
   *     tela e param ao sair. O botão pausa e retoma; pausado pelo botão,
   *     não volta a tocar sozinho. Com "reduzir movimento" ficam na capa.
   *     Se o celular bloquear o autoplay (modo economia), o play recusa em
   *     silêncio e fica a capa com o botão de tocar.
   * ------------------------------------------------------------------ */
  {
    document.querySelectorAll("[data-reel]").forEach((reel) => {
      const video = reel.querySelector("video");
      const botao = reel.querySelector("[data-reel-botao]");
      if (!video || !botao) return;
      video.muted = true;
      let pausadoAMao = reduzido;
      let naTela = false;
      const tocar = () => { const p = video.play(); if (p) p.catch(() => {}); };
      const marcar = () => {
        const tocando = !video.paused;
        reel.classList.toggle("tocando", tocando);
        botao.setAttribute("aria-label", tocando ? "Pausar o vídeo" : "Tocar o vídeo");
      };
      video.addEventListener("play", marcar);
      video.addEventListener("pause", marcar);
      botao.addEventListener("click", () => {
        if (video.paused) { pausadoAMao = false; tocar(); }
        else { pausadoAMao = true; video.pause(); }
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entradas) => {
          entradas.forEach((en) => {
            naTela = en.isIntersecting;
            if (naTela && !pausadoAMao) tocar();
            else if (!naTela && !video.paused) video.pause();
          });
        }, { threshold: 0.35 }).observe(video);
      }
      marcar();
    });
  }

  /* ------------------------------------------------------------------ *
   * 13. LEQUE DO INSTAGRAM: os cards saem empilhados no centro e abrem
   *     quando a seção entra na tela. Sem JS, sem observador ou com
   *     "reduzir movimento", já nascem abertos.
   * ------------------------------------------------------------------ */
  {
    const leque = document.querySelector("[data-leque]");
    if (leque && "IntersectionObserver" in window && !reduzido) {
      leque.querySelectorAll(".insta__item").forEach((card, i) => {
        card.classList.add("insta__item--entrando");
        card.style.transitionDelay = (i * 100) + "ms";
      });
      const io = new IntersectionObserver((entradas) => {
        if (!entradas.some((en) => en.isIntersecting)) return;
        leque.classList.add("insta__leque--visivel");
        io.disconnect();
        // depois de abrir, a classe de entrada sai: a regra dela vem depois da do
        // hover no CSS e ganharia dele, e o card não levantaria mais (é assim na Realce)
        setTimeout(() => leque.querySelectorAll(".insta__item").forEach((c) => {
          c.classList.remove("insta__item--entrando");
          c.style.transitionDelay = "";
        }), 1700);
      }, { threshold: 0.3 });
      io.observe(leque);
    }
  }

  /* ------------------------------------------------------------------ *
   * 14. Ano no rodapé
   * ------------------------------------------------------------------ */
  {
    const ano = document.querySelector("[data-ano]");
    if (ano) ano.textContent = new Date().getFullYear();
  }
})();
