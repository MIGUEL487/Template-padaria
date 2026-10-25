import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, MotionConfig } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hero, products, quotes } from "./content";
import { site, orderLink } from "./config/site.config";
import "./style.css";
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const photo = (name: string) => `/images/${encodeURIComponent(name)}-1280.webp`;
function Picture({
  name,
  alt,
  kind = "kenburns",
}: {
  name: string;
  alt: string;
  kind?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver((es) =>
      es.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={`picture ${kind}`}>
      <img
        src={photo(name)}
        srcSet={`${photo(name).replace("1280", "640")} 640w, ${photo(name)} 1280w`}
        sizes="(max-width: 768px) 100vw, 50vw"
        width="1280"
        height="960"
        alt={alt}
        loading="lazy"
      />
    </div>
  );
}
function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
function Hero({ reduced }: { reduced: boolean }) {
  const area = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current!,
      ctx = c.getContext("2d", { alpha: false })!;
    const media = matchMedia("(max-width:768px), (orientation:portrait)");
    let disposed = false,
      raf = 0,
      generation = 0,
      lastPosition = -1;
    let frames: (ImageBitmap | undefined)[] = [],
      sourceWidth = 1280,
      sourceHeight = 720;
    let frameCount = 1;
    let ensureFrames = () => {};
    let cover = { x: 0, y: 0, width: 0, height: 0 };
    const playhead = { progress: 0 };
    function measure() {
      const w = c.clientWidth,
        h = c.clientHeight;
      const ratio = Math.min(1, sourceWidth / w, sourceHeight / h);
      c.width = Math.round(w * ratio);
      c.height = Math.round(h * ratio);
      const scale = Math.max(c.width / sourceWidth, c.height / sourceHeight);
      cover = {
        x: (c.width - sourceWidth * scale) / 2,
        y: (c.height - sourceHeight * scale) / 2,
        width: sourceWidth * scale,
        height: sourceHeight * scale,
      };
      lastPosition = -1;
      schedule();
    }
    function draw() {
      raf = 0;
      const finalIndex = frameCount - 1;
      const position = playhead.progress * finalIndex;
      ensureFrames();
      // A coalescência nunca pode descartar os extremos da sequência.
      if (
        Math.abs(position - lastPosition) < 0.02 &&
        !(position === finalIndex && lastPosition !== finalIndex) &&
        !(position === 0 && lastPosition !== 0)
      )
        return;
      const requested = Math.min(finalIndex, Math.floor(position));
      let index = requested;
      if (!frames[index]) {
        index = frames.reduce(
          (best, frame, i) =>
            frame && Math.abs(i - requested) < Math.abs(best - requested)
              ? i
              : best,
          frames.findIndex(Boolean),
        );
      }
      const frame = frames[index];
      if (!frame) return;
      lastPosition = position;
      ctx.globalAlpha = 1;
      ctx.drawImage(frame, cover.x, cover.y, cover.width, cover.height);
      const next = frames[requested + 1],
        fraction = position - requested;
      if (index === requested && next && fraction > 0.02) {
        ctx.globalAlpha = fraction;
        ctx.drawImage(next, cover.x, cover.y, cover.width, cover.height);
        ctx.globalAlpha = 1;
      }
      c.dataset.frame = String(index);
      c.dataset.progress = String(playhead.progress);
    }
    function schedule() {
      if (!raf && !disposed) raf = requestAnimationFrame(draw);
    }
    async function load() {
      const gen = ++generation;
      frames.forEach((frame) => frame?.close());
      frames = [];
      const mobile = media.matches;
      sourceWidth = mobile ? 540 : 1280;
      sourceHeight = mobile ? 960 : 720;
      frameCount = 1;
      ensureFrames = () => {};
      measure();
      try {
        const base = `/frames/${mobile ? "mobile" : "pc"}/`;
        const response = await fetch(base + "manifest.json");
        if (!response.ok) throw new Error("Manifest indisponível");
        const manifest = (await response.json()) as {
          frames: string[];
          bottomColor: string;
          width: number;
          height: number;
          revision?: string;
        };
        if (disposed || gen !== generation) return;
        area.current?.style.setProperty("--hero-bottom", manifest.bottomColor);
        const names = reduced ? manifest.frames.slice(0, 1) : manifest.frames;
        frameCount = names.length;
        sourceWidth = Math.min(mobile ? 540 : 1280, manifest.width);
        sourceHeight = Math.round(
          (manifest.height * sourceWidth) / manifest.width,
        );
        c.dataset.frameCount = String(frameCount);
        measure();
        const radius = reduced ? 0 : mobile ? 12 : 16;
        const pending = new Set<number>(),
          failed = new Set<number>();
        let active = 0;
        // Janela limitada: cada bitmap descartado é explicitamente liberado.
        ensureFrames = () => {
          if (disposed || gen !== generation) return;
          const target = Math.min(
            frameCount - 1,
            Math.floor(playhead.progress * (frameCount - 1)),
          );
          frames.forEach((bitmap, i) => {
            if (bitmap && Math.abs(i - target) > radius) {
              bitmap.close();
              frames[i] = undefined;
            }
          });
          const candidates = Array.from(
            {
              length:
                Math.min(frameCount - 1, target + radius) -
                Math.max(0, target - radius) +
                1,
            },
            (_, i) => Math.max(0, target - radius) + i,
          ).sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
          while (active < 3) {
            const i = candidates.find(
              (i) => !frames[i] && !pending.has(i) && !failed.has(i),
            );
            if (i === undefined) break;
            pending.add(i);
            active++;
            (async () => {
              try {
                const response = await fetch(
                  base +
                    names[i] +
                    (manifest.revision ? `?v=${manifest.revision}` : ""),
                );
                if (!response.ok) throw new Error("Frame indisponível");
                const blob = await response.blob();
                const bitmap = manifest.width === sourceWidth && manifest.height === sourceHeight
                  ? await createImageBitmap(blob)
                  : await createImageBitmap(blob, {
                      resizeWidth: sourceWidth,
                      resizeHeight: sourceHeight,
                      resizeQuality: "high",
                    });
                const latest = Math.floor(playhead.progress * (frameCount - 1));
                if (
                  disposed ||
                  gen !== generation ||
                  Math.abs(i - latest) > radius
                ) {
                  bitmap.close();
                  return;
                }
                frames[i] = bitmap;
                lastPosition = -1;
                schedule();
                c.dataset.cachedFrames = String(frames.filter(Boolean).length);
              } catch (error) {
                failed.add(i);
                if (!disposed && gen === generation)
                  console.warn("Não foi possível carregar um frame", error);
              } finally {
                pending.delete(i);
                active--;
                if (!disposed && gen === generation) ensureFrames();
              }
            })();
          }
        };
        ensureFrames();
      } catch (error) {
        console.warn("Sequência de imagens indisponível", error);
      }
    }
    const resize = new ResizeObserver(measure);
    resize.observe(c);
    load();
    media.addEventListener("change", load);
    const tween = reduced
      ? null
      : gsap.to(playhead, {
          progress: 1,
          ease: "none",
          onUpdate: schedule,
          scrollTrigger: {
            trigger: area.current,
            start: "top top",
            end: () =>
              `+=${Math.max(1, area.current!.offsetHeight - innerHeight - innerHeight * 0.2)}`,
            scrub: 0.16,
            invalidateOnRefresh: true,
          },
        });
    return () => {
      disposed = true;
      generation++;
      cancelAnimationFrame(raf);
      resize.disconnect();
      media.removeEventListener("change", load);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      frames.forEach((frame) => frame?.close());
    };
  }, [reduced]);
  return (
    <section
      className={`hero ${reduced ? "still" : ""}`}
      ref={area}
      id="inicio"
    >
      <div className="hero-sticky">
        <picture className="hero-poster">
          <source
            media="(max-width:768px), (orientation:portrait)"
            srcSet="/frames/mobile/frame_001.webp"
          />
          <img
            src="/frames/pc/frame_001.webp"
            alt="Mãos preparando um pão artesanal"
            width="960"
            height="640"
            fetchPriority="high"
          />
        </picture>
        <canvas ref={canvas} aria-hidden="true" />
        <div className="hero-wash" />
        <div className="hero-copy">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
          <span className="hero-invitation">
            O tempo é parte da receita. Role devagar.
          </span>
        </div>
      </div>
    </section>
  );
}
function Header({
  menu,
  setMenu,
  reduced,
}: {
  menu: boolean;
  setMenu: (open: boolean) => void;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = ref.current!;
    const show = (visible: boolean) => {
      header.classList.toggle("revealed", visible);
      header.inert = !visible;
      if (!visible) setMenu(false);
    };
    show(false);
    const trigger = ScrollTrigger.create({
      trigger: "#inicio",
      start: "bottom bottom-=24",
      end: "max",
      onEnter: () => show(true),
      onLeaveBack: () => show(false),
      onRefresh: (self) => show(self.scroll() >= self.start),
    });
    return () => trigger.kill();
  }, [reduced, setMenu]);
  return (
    <header ref={ref} className="site-header">
      <a className="brand" href="#inicio" aria-label="O Refúgio — início">
        <span className="brand-icon">✳︎</span>
        <span>
          o refúgio<small>PADARIA ARTESANAL</small>
        </span>
      </a>
      <button
        className="menu-button"
        onClick={() => setMenu(!menu)}
        aria-expanded={menu}
        aria-label="Abrir navegação"
      >
        {menu ? "Fechar ×" : "Menu ☰"}
      </button>
      <nav className={menu ? "open" : ""}>
        {[
          ["Nossa essência", "essencia"],
          ["O cardápio", "cardapio"],
          ["Nossa história", "historia"],
        ].map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
            {label}
          </a>
        ))}
      </nav>
      <a href="#visite" className="visit-link">
        Venha nos conhecer <span className="arrow" aria-hidden="true" />
      </a>
    </header>
  );
}
function App() {
  const [category, setCategory] = useState("Todos"),
    [menu, setMenu] = useState(false),
    [selected, setSelected] = useState<string | null>(null);
  const [reduced, setReduced] = useState(() => {
    try {
      const stored = localStorage.getItem("refugio-motion");
      return new URLSearchParams(location.search).get("motion") === "full"
        ? false
        : stored
          ? stored === "off"
          : matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "off" : "on";
    try {
      localStorage.setItem("refugio-motion", reduced ? "off" : "on");
    } catch {}
  }, [reduced]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>(
            "[role=dialog] button,[role=dialog] a",
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      previous?.focus();
    };
  }, [selected]);
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <a href="#conteudo" className="skip">
        Pular para o conteúdo
      </a>
      <Header menu={menu} setMenu={setMenu} reduced={reduced} />
      <main id="conteudo">
        <Hero reduced={reduced} />
        <section className="essence section" id="essencia">
          <div className="section-top">
            <span className="eyebrow">01 / NOSSA ESSÊNCIA</span>
            <span className="tiny">O BOM DA VIDA É SIMPLES.</span>
          </div>
          <Reveal>
            <div className="essence-grid">
              <h2>
                Algumas coisas
                <br />
                merecem o seu
                <br />
                <em>tempo.</em>
              </h2>
              <div className="essence-copy">
                <div className="bread-medallion">
                  <Picture
                    name="Pao"
                    alt="Pães dourados sobre uma tábua"
                    kind="spin"
                  />
                </div>
                <p>
                  O pão tem o tempo dele.
                  <br />A gente também deveria ter.
                </p>
                <p className="muted">
                  Entre a farinha e o primeiro café, fazemos espaço para o que
                  importa: ingredientes de verdade, mãos cuidadosas e a alegria
                  de receber.
                </p>
                <a className="text-link" href="#processo">
                  Conheça o nosso jeito <span>↓</span>
                </a>
              </div>
            </div>
          </Reveal>
          <div className="pillars">
            {[
              [
                "01",
                "Fermentação natural",
                "O sabor que só o tempo sabe fazer.",
              ],
              [
                "02",
                "Feito aqui, todos os dias",
                "Da nossa bancada para a sua mesa.",
              ],
              [
                "03",
                "Afeto em cada detalhe",
                "Porque acolher também é uma receita.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="process" id="processo">
          <div className="process-photo">
            <Picture
              name="Pao 2"
              alt="Pães rústicos com farinha sobre uma mesa"
            />
            <div className="photo-label">FARINHA. ÁGUA. SAL. TEMPO.</div>
          </div>
          <div className="process-story">
            <span className="eyebrow">DO NOSSO FORNO, COM AFETO</span>
            {[
              [
                "01",
                "Tudo começa com o essencial.",
                "Bons ingredientes. Nada para esconder.",
              ],
              [
                "02",
                "Depois, deixamos o tempo agir.",
                "A massa descansa. O sabor desperta.",
              ],
              [
                "03",
                "Até chegar à sua mesa.",
                "Ainda quentinho. Do jeito que deve ser.",
              ],
            ].map(([n, t, d]) => (
              <Reveal key={n}>
                <article>
                  <span>{n} —</span>
                  <h2>{t}</h2>
                  <p>{d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section favorites" id="cardapio">
          <div className="section-top">
            <span className="eyebrow">02 / NOSSOS FAVORITOS</span>
            <span className="tiny">FEITOS PARA VIRAR RITUAL.</span>
          </div>
          <Reveal>
            <div className="title-row">
              <h2>
                Escolha a sua
                <br />
                <em>pequena felicidade.</em>
              </h2>
              <p>
                Uma boa pausa começa aqui.
                <br />O difícil vai ser escolher só um.
              </p>
            </div>
          </Reveal>
          <div className="tabs" role="group" aria-label="Filtrar cardápio">
            {["Todos", "Pães", "Viennoiserie", "Café"].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
                {c === "Todos" ? " (6)" : ""}
              </button>
            ))}
          </div>
          <div className="products">
            {products
              .filter((p) => category === "Todos" || p.category === category)
              .map((p) => (
                <article className="product" key={p.name}>
                  <div className="product-image">
                    <Picture
                      name={p.photo}
                      alt={p.name + " — fotografia ilustrativa"}
                    />
                    <span className="product-tag">{p.tag}</span>
                    <button
                      className="add"
                      aria-label={`Pedir ${p.name}`}
                      onClick={() => setSelected(p.name)}
                    >
                      <span className="arrow" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="product-title">
                    <h3>{p.name}</h3>
                    <span>
                      {p.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <p>{p.note}</p>
                </article>
              ))}
          </div>
          <p className="demo-note">
            Cardápio de demonstração · Produtos, preços e fotografias
            ilustrativos.
          </p>
        </section>
        <section className="history section" id="historia">
          <div className="history-grid">
            <div>
              <span className="eyebrow">03 / NOSSA HISTÓRIA</span>
              <Reveal>
                <h2>
                  Uma porta aberta.
                  <br />
                  Um café passado.
                  <br />
                  <em>Um refúgio.</em>
                </h2>
                <p>
                  Acreditamos em mesas que aproximam, em receitas que atravessam
                  gerações e no poder de um “bom dia” acompanhado de pão fresco.
                </p>
                <p>
                  O Refúgio nasceu dessa vontade: fazer do cotidiano um lugar
                  mais gostoso de estar.
                </p>
                <div className="signature">Da nossa casa, para a sua.</div>
                <span className="tiny">HISTÓRIA ILUSTRATIVA DA MARCA</span>
              </Reveal>
            </div>
            <div className="history-image">
              <Picture
                name="Croassaint com Cafe"
                alt="Croissant dourado ao lado de uma xícara de café"
                kind="float"
              />
              <span className="round-note">
                FEITO COM AFETO
                <br />
                ✳︎
                <br />
                SERVIDO COM CALMA
              </span>
            </div>
          </div>
        </section>
        <section className="experience">
          <Picture
            name="Interior de uma Padaria"
            alt="Interior da padaria com balcão e produtos frescos"
          />
          <div className="experience-copy">
            <span className="eyebrow">04 / SINTA-SE EM CASA</span>
            <h2>
              O mundo pode esperar.
              <br />
              <em>Seu café, não.</em>
            </h2>
            <a className="button light" href="#visite">
              Encontre seu lugar à mesa{" "}
              <span className="arrow" aria-hidden="true" />
            </a>
          </div>
        </section>
        <section className="section testimonials">
          <span className="eyebrow">PALAVRAS QUE AQUECEM</span>
          <h2>
            Quem chega, <em>fica.</em>
          </h2>
          <span className="demo-note">Avaliações de demonstração</span>
          <div className="quotes">
            {quotes.map(([q, n]) => (
              <Reveal key={n}>
                <figure>
                  <span className="stars" aria-label="5 estrelas ilustrativas">
                    ★★★★★
                  </span>
                  <blockquote>{q}</blockquote>
                  <figcaption>
                    — {n}
                    <span>CLIENTE ILUSTRATIVO</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section visit" id="visite">
          <span className="eyebrow">05 / VISITE-NOS</span>
          <div className="title-row">
            <h2>
              A melhor parte?
              <br />
              <em>É logo ali.</em>
            </h2>
            <p>
              Seu próximo café favorito está esperando.
              <br />
              Venha sem pressa.
            </p>
          </div>
          <div className="visit-grid">
            <div className="visit-card">
              <span>✳︎</span>
              <h3>Uma mesa te espera.</h3>
              <p>
                Esta é uma padaria de demonstração.
                <br />
                Endereço e horários serão anunciados aqui.
              </p>
              <dl>
                <dt>ENDEREÇO</dt>
                <dd>{site.address || "A definir pela padaria"}</dd>
                <dt>HORÁRIOS</dt>
                <dd>Em breve</dd>
              </dl>
              <button
                className="button"
                onClick={() => setSelected("Informações para visita")}
              >
                Quero conhecer <span className="arrow" aria-hidden="true" />
              </button>
            </div>
            <div className="visit-art">
              <span className="arch">R</span>
              <span>
                PÃO QUENTINHO.
                <br />
                PORTAS ABERTAS.
                <br />
                CORAÇÃO TAMBÉM.
              </span>
              <small>O SEU NOVO LUGAR FAVORITO.</small>
            </div>
          </div>
        </section>
        <section className="final-cta">
          <span className="eyebrow">UM CONVITE ÀS COISAS BOAS</span>
          <h2>
            Vem pelo pão.
            <br />
            Fica pelo <em>aconchego.</em>
          </h2>
          <a href="#cardapio" className="button">
            Encontre seu favorito <span className="arrow" aria-hidden="true" />
          </a>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a href="#inicio" className="footer-brand">
            o refúgio<span>PADARIA ARTESANAL · PÃO, CAFÉ & TEMPO.</span>
          </a>
          <div>
            <a href="#essencia">Nossa essência</a>
            <a href="#cardapio">Cardápio</a>
            <a href="#visite">Visite-nos</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} O Refúgio · Conceito de demonstração
          </span>
          <button
            className="motion-toggle"
            role="switch"
            aria-checked={!reduced}
            onClick={() => setReduced(!reduced)}
          >
            <span className={!reduced ? "toggle on" : "toggle"} /> Animações{" "}
            {reduced ? "desligadas" : "ligadas"}
          </button>
          <a href="#inicio">Voltar ao topo ↑</a>
        </div>
      </footer>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close"
              aria-label="Fechar"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <span className="eyebrow">UM GOSTINHO DO QUE VEM</span>
            <h2 id="dialog-title">{selected}</h2>
            <p>
              Este é um cardápio de demonstração. Os pedidos e as visitas serão
              liberados quando a padaria cadastrar seu contato.
            </p>
            {orderLink(selected) && (
              <a
                className="button"
                href={orderLink(selected)!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pedir no WhatsApp ↗
              </a>
            )}
            <button className="text-link" onClick={() => setSelected(null)}>
              Continuar explorando →
            </button>
          </div>
        </div>
      )}
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
