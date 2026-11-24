import * as React from "react"
import { ArrowRight, ArrowUpRight, Mail, Menu, X } from "lucide-react"
import { IslandHero, type IslandSpot } from "@/components/ui/island-hero"
import { cn } from "@/lib/utils"
import { img, photo, type ImageKey } from "@/data/images"
import {
  about,
  awards,
  credentials,
  experience,
  fieldNotes,
  marquee,
  profile,
  projects,
  research,
  scores,
  skills,
} from "@/data/site"

/* -------------------------------------------------------------------------- */
/*  Islands = chapters. Edit labels / summaries here.                         */
/* -------------------------------------------------------------------------- */

const RING = 6.4
const at = (deg: number, y: number, r = RING): [number, number, number] => [
  Math.sin((deg * Math.PI) / 180) * r,
  y,
  Math.cos((deg * Math.PI) / 180) * r,
]

const ISLANDS: IslandSpot[] = [
  { id: "home", kind: "home", num: "01", label: "家園島", labelEn: "About", section: "about", position: [0, 0, 0], radius: 2.2, summary: "國防醫學大學藥學系，藥師國考及格。從藥學出發，走進基因體與資料科學。" },
  { id: "observatory", kind: "observatory", num: "02", label: "青光眼觀測站", labelEn: "Research", section: "research", position: at(20, 0.6), radius: 1.35, summary: "早發型原發性開角型青光眼（POAG）的全外顯子定序與機器學習，第一作者論文審稿中。" },
  { id: "lab", kind: "lab", num: "03", label: "基因實驗室", labelEn: "Research stack", section: "skills", position: at(80, -0.4), radius: 1.35, summary: "WES、CLC Genomics、IPA 路徑分析、PCR 與 Python 機器學習。" },
  { id: "pharmacy", kind: "pharmacy", num: "04", label: "藥學島", labelEn: "Pharmacy", section: "experience", position: at(140, 0.3), radius: 1.3, summary: "三軍總醫院臨床藥學部、順天堂藥廠、赫得藥局的實習經驗。" },
  { id: "harbor", kind: "harbor", num: "05", label: "研討會港", labelEn: "Field notes", section: "field-notes", position: at(200, -0.6), radius: 1.45, summary: "口頭壁報、學會年會與 IPSF 亞太藥學年會的現場紀錄。" },
  { id: "workshop", kind: "workshop", num: "06", label: "工具工坊", labelEn: "Projects", section: "projects", position: at(260, 0.5), radius: 1.35, summary: "把藥局裡的重複工作做成 10 個真正能用的網頁工具。" },
  { id: "lighthouse", kind: "lighthouse", num: "07", label: "燈塔", labelEn: "Credentials", section: "credentials", position: at(320, -0.2), radius: 1.25, summary: "證照、獎學金與語言成績：TOEFL ITP 617、TOEIC 910。" },
]

const NAV = [
  { href: "#about", label: "About" },
  { href: "#research", label: "Research" },
  { href: "#field-notes", label: "Field notes" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#credentials", label: "Credentials" },
]

/* --------------------------------- hooks --------------------------------- */

function useReveal() {
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in")
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/* ------------------------------ small pieces ----------------------------- */

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function Label({ n, children, dark }: { n: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cn("flex items-center gap-3 text-[13px] font-medium", dark ? "text-white/55" : "text-muted")}>
      <span className={cn("h-px w-8", dark ? "bg-white/30" : "bg-ink/25")} />
      <span className="font-serif text-base italic text-tomato">{n}</span>
      {children}
    </p>
  )
}

/** A Higgsfield island plate. Soft radial mask so it melts into any background. */
function Plate({ k, alt, className }: { k: ImageKey; alt: string; className?: string }) {
  const [ok, setOk] = React.useState(true)
  if (!ok) return null
  return (
    <img
      src={img(k)}
      alt={alt}
      loading="lazy"
      onError={() => setOk(false)}
      className={cn(
        "float-plate pointer-events-none select-none [mask-image:radial-gradient(closest-side,black_62%,transparent_100%)]",
        className,
      )}
    />
  )
}

/** Your own photo; renders `fallback` if the file is not in public/photos yet. */
function OwnPhoto({
  src,
  alt,
  className,
  fallback,
  onOpen,
}: {
  src: string
  alt: string
  className?: string
  fallback: React.ReactNode
  onOpen?: (src: string, alt: string) => void
}) {
  const [ok, setOk] = React.useState(true)
  if (!ok) return <>{fallback}</>
  const url = photo(src)
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setOk(false)}
      onClick={onOpen ? () => onOpen(url, alt) : undefined}
      className={cn(onOpen && "cursor-zoom-in", className)}
    />
  )
}

/** Aixor-style statement whose characters light up as you scroll through it. */
function ScrollLight({ text, className }: { text: string; className?: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("span"))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"))
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)))
      const lit = Math.round(p * spans.length)
      spans.forEach((s, i) => (s.style.opacity = i < lit ? "1" : "0.18"))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [text])
  return (
    <p ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden className="transition-opacity duration-300" style={{ opacity: 0.18 }}>
          {ch}
        </span>
      ))}
    </p>
  )
}

/** Field-notes tile: your photo with caption, or an intentional text tile until the photo is added. */
function FieldCard({
  src,
  caption,
  where,
  i,
  className,
  onOpen,
}: {
  src: string
  caption: string
  where: string
  i: number
  className?: string
  onOpen: (src: string, alt: string) => void
}) {
  const [ok, setOk] = React.useState(true)
  return (
    <figure className={cn("reveal group relative overflow-hidden rounded-[26px] ring-1 ring-ink/5", ok ? "bg-paper-2" : "bg-white", className)}>
      {ok ? (
        <>
          <img
            src={photo(src)}
            alt={caption}
            loading="lazy"
            onError={() => setOk(false)}
            onClick={() => onOpen(photo(src), caption)}
            className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5 pt-16 text-white">
            <p className="text-[15px] font-semibold leading-snug">{caption}</p>
            <p className="mt-0.5 text-[13px] opacity-75">{where}</p>
          </figcaption>
        </>
      ) : (
        <figcaption className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_90%_10%,rgba(79,188,180,0.16),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(219,106,65,0.12),transparent_55%)] p-6">
          <span className="font-serif text-5xl italic text-tomato/70">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <p className={cn("font-semibold leading-snug", i === 0 ? "text-[clamp(1.4rem,2.4vw,2rem)]" : "text-lg")}>{caption}</p>
            <p className="mt-1 text-[14px] text-muted">{where}</p>
          </div>
        </figcaption>
      )}
    </figure>
  )
}

/* ---------------------------------- nav ---------------------------------- */

function Nav() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div
        className={cn(
          "mx-auto flex max-w-[1240px] items-center justify-between rounded-full py-2 pl-5 pr-2 transition-[background,box-shadow] duration-300",
          scrolled ? "bg-white/80 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl" : "bg-white/40 backdrop-blur-md",
        )}
      >
        <a href="#top" className="flex items-baseline gap-2 font-semibold">
          <span className="text-[15px]">
            {profile.initials}
            <sup className="text-[9px]">®</sup>
          </span>
          <span className="hidden text-sm text-ink/60 sm:inline">{profile.nameZh}</span>
        </a>
        <nav aria-label="主選單" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3 py-2 text-[13px] font-medium text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <a href="#contact" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white">
            Contact <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="選單"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mx-auto mt-2 grid max-w-[1240px] gap-1 rounded-3xl bg-white/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-base font-medium hover:bg-ink/5">
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

/* --------------------------------- page ---------------------------------- */

export default function App() {
  useReveal()
  const [lightbox, setLightbox] = React.useState<{ src: string; alt: string } | null>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const open = (src: string, alt: string) => setLightbox({ src, alt })

  return (
    <>
      <Nav />
      <main>
        {/* ============================== HERO ============================== */}
        <IslandHero islands={ISLANDS} fallbackImage={img("archipelago")} onNavigate={scrollToId}>
          <div className="mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-24 sm:px-8 sm:pb-24">
            <p className="mb-5 flex items-center gap-3 text-[13px] font-medium opacity-60">
              <span className="h-px w-8 bg-current" /> 曾浩宸 · Pharmacy, genomics &amp; AI
            </p>
            <h1 className="max-w-[12ch] text-[clamp(3rem,8.4vw,7.6rem)] font-semibold leading-[0.9] tracking-[-0.045em]">
              Pharmacist,
              <br />
              <span className="font-serif font-normal italic tracking-[-0.02em]">mapping genes.</span>
            </h1>
            <div className="mt-7 flex max-w-xl flex-col gap-5 sm:flex-row sm:items-end">
              <p className="text-[15px] leading-relaxed opacity-70">
                以藥學為臨床基礎，把全外顯子定序、生物資訊與機器學習連到真正的疾病問題。拖曳旋轉群島，點一座島開始探索。
              </p>
            </div>
          </div>
        </IslandHero>

        {/* ============================= MARQUEE ============================ */}
        <section aria-label="研究主題" className="overflow-hidden bg-ink py-5 text-white/80">
          <div className="marquee-track flex w-max gap-14 [animation:marquee_32s_linear_infinite]">
            {[...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-14 whitespace-nowrap text-[15px]">
                {i % 2 ? <span className="font-serif text-xl italic">{m}</span> : <span className="font-medium">{m}</span>}
                <span className="h-1.5 w-1.5 rounded-full bg-tomato" />
              </span>
            ))}
          </div>
        </section>

        {/* ============================== ABOUT ============================= */}
        <section id="about" className="px-5 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
              <div>
                <Label n="01">家園島 · About</Label>
                <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  從藥學出發，
                  <br />
                  <span className="font-serif font-normal italic">走進基因體與資料科學。</span>
                </h2>
                <ScrollLight text={about.statement} className="mt-10 text-[clamp(1.25rem,2.2vw,1.85rem)] font-medium leading-[1.55] tracking-[-0.01em]" />
                <p className="reveal mt-8 max-w-[60ch] text-[16px] leading-[1.9] text-muted">{about.lead}</p>
                <p className="reveal mt-4 max-w-[60ch] text-[16px] leading-[1.9] text-muted">{about.closing}</p>
              </div>

              <aside className="reveal flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-[28px] bg-paper-2">
                  <OwnPhoto
                    src={profile.portrait}
                    alt={`${profile.nameZh} 個人照`}
                    className="aspect-[4/5] w-full object-cover"
                    fallback={<img src={img("island-pharmacy")} alt="藥學島插畫" className="aspect-[4/5] w-full object-cover" />}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
                    <p className="text-lg font-semibold">{profile.nameEn}</p>
                    <p className="text-[13px] opacity-80">{profile.role}</p>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
              {about.facts.map((f) => (
                <div key={f.k} className="reveal bg-paper p-6">
                  <p className="text-[13px] text-muted">{f.k}</p>
                  <p className="mt-6 text-lg font-semibold leading-snug">{f.v}</p>
                  <p className="mt-1 text-[14px] text-muted">{f.s}</p>
                </div>
              ))}
            </div>
            <div className="reveal mt-4 flex flex-col gap-2 rounded-[28px] bg-ink p-7 text-white sm:flex-row sm:items-center sm:gap-8">
              <p className="font-serif text-2xl italic text-tomato">NSTC</p>
              <div>
                <p className="font-semibold">{about.grant.title}</p>
                <p className="mt-1 text-[15px] text-white/65">{about.grant.desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ RESEARCH ============================ */}
        <section id="research" className="relative overflow-hidden bg-night px-5 py-28 text-white sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Label n="02" dark>
                  青光眼觀測站 · Research
                </Label>
                <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  Selected research
                  <br />
                  <span className="font-serif font-normal italic text-white/80">&amp; publications.</span>
                </h2>
                <p className="reveal mt-6 max-w-[56ch] text-[16px] leading-relaxed text-white/60">
                  以遺傳資料為核心：從男性不孕症、眼壓相關分子機制，到兩代家族型早發 POAG 的 exome-based machine learning。
                </p>
              </div>
              <div className="relative mx-auto w-[min(360px,80vw)]">
                <div className="absolute inset-8 rounded-full bg-sea/20 blur-3xl" />
                <Plate k="island-observatory" alt="青光眼觀測站插畫" className="relative w-full" />
              </div>
            </div>

            <ol className="relative mt-16 border-l border-white/12 pl-6 sm:pl-10">
              {research.map((r, i) => (
                <li key={r.title} className="reveal relative pb-6 last:pb-0" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span
                    className={cn(
                      "absolute -left-[31px] top-8 h-3 w-3 rounded-full ring-4 ring-night sm:-left-[47px]",
                      r.current ? "bg-tomato shadow-[0_0_20px_4px_rgba(219,106,65,0.5)]" : "bg-white/35",
                    )}
                  />
                  <article
                    className={cn(
                      "group rounded-[26px] p-6 ring-1 transition-colors sm:p-8",
                      r.current ? "bg-gradient-to-br from-tomato/20 to-white/[0.04] ring-tomato/30" : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.07]",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[13px] font-semibold text-sea">{r.date}</span>
                      <span className="font-serif text-3xl italic text-white/20">0{i + 1}</span>
                    </div>
                    <h3 className="mt-4 max-w-[60ch] text-[clamp(1.1rem,1.9vw,1.5rem)] font-semibold leading-snug">{r.title}</h3>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium">{r.role}</span>
                      <span className="text-[14px] text-white/55">{r.note}</span>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* =========================== FIELD NOTES ========================== */}
        <section id="field-notes" className="px-5 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Label n="05">研討會港 · Field notes</Label>
                <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  研究不只存在
                  <br />
                  <span className="font-serif font-normal italic">在電腦螢幕裡。</span>
                </h2>
                <p className="reveal mt-6 max-w-[56ch] text-[16px] leading-relaxed text-muted">
                  口頭壁報、學會年會、跨國交流與研究展示，是研究歷程裡最有現場感的部分。
                </p>
              </div>
              <Plate k="island-harbor" alt="研討會港插畫" className="mx-auto w-[min(380px,82vw)] mix-blend-multiply" />
            </div>

            <div className="mt-14 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {fieldNotes.map((f, i) => (
                <FieldCard
                  key={f.src}
                  i={i}
                  {...f}
                  onOpen={open}
                  className={cn(
                    i === 0 && "sm:col-span-2 lg:col-span-7 lg:row-span-2",
                    i === 1 && "lg:col-span-5",
                    i === 2 && "lg:col-span-5",
                    i === 3 && "lg:col-span-6",
                    i === 4 && "sm:col-span-2 lg:col-span-6",
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============================== SKILLS ============================ */}
        <section id="skills" className="bg-paper-2 px-5 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <Label n="03">基因實驗室 · Skills</Label>
            <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              Research stack
              <br />
              <span className="font-serif font-normal italic">&amp; clinical exposure.</span>
            </h2>

            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              <div className="reveal relative overflow-hidden rounded-[30px] bg-white p-7 sm:p-9">
                <Plate k="island-lab" alt="基因實驗室插畫" className="mx-auto -mt-4 mb-2 w-[min(300px,70vw)] mix-blend-multiply" />
                <h3 className="text-2xl font-semibold">Research &amp; bioinformatics</h3>
                <p className="mt-1 text-[14px] text-muted">從濕實驗到 WES 與 Python 機器學習</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s} className="rounded-full bg-paper px-3.5 py-2 text-[14px] font-medium text-ink/80">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div id="experience" className="reveal relative overflow-hidden rounded-[30px] bg-white p-7 sm:p-9">
                <Plate k="island-pharmacy" alt="藥學島插畫" className="mx-auto -mt-4 mb-2 w-[min(300px,70vw)] mix-blend-multiply" />
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-xl italic text-tomato">04</span>
                  <h3 className="text-2xl font-semibold">Pharmacy experience</h3>
                </div>
                <p className="mt-1 text-[14px] text-muted">醫院、藥廠與社區藥局實習</p>
                <ul className="mt-6 divide-y divide-ink/10">
                  {experience.map((e) => (
                    <li key={e.place} className="flex items-center justify-between gap-4 py-4">
                      <span className="text-[16px] font-semibold">{e.place}</span>
                      <span className="text-right text-[14px] text-muted">{e.what}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================= PROJECTS =========================== */}
        <section id="projects" className="px-5 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Label n="06">工具工坊 · Projects</Label>
                <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  把重複工作，
                  <br />
                  <span className="font-serif font-normal italic">做成真正能用的工具。</span>
                </h2>
                <p className="reveal mt-6 max-w-[56ch] text-[16px] leading-relaxed text-muted">
                  多數專案源自藥局與學習現場：找藥、整理筆記、盤點、仿單異動、衛教內容、AIoT 知識條目與中藥辨識。
                </p>
              </div>
              <Plate k="island-workshop" alt="工具工坊插畫" className="mx-auto w-[min(360px,80vw)] mix-blend-multiply" />
            </div>

            <ul className="mt-14 border-t border-ink/15">
              {projects.map((p, i) => (
                <li key={p.url} className="reveal border-b border-ink/15">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[2.2rem_1fr_auto] items-center gap-x-4 gap-y-1 px-1 py-6 transition-colors hover:bg-white/60 sm:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.4fr)_7rem_auto] sm:px-4"
                  >
                    <span className="font-serif text-xl italic text-ink/35 group-hover:text-tomato">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[17px] font-semibold sm:text-lg">{p.title}</span>
                    <span className="col-span-2 col-start-2 row-start-2 text-[14px] leading-relaxed text-muted sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:text-[15px]">
                      {p.desc}
                    </span>
                    <span className="hidden text-[13px] text-muted sm:block">{p.tag}</span>
                    <span className="col-start-3 row-start-1 grid h-10 w-10 place-items-center rounded-full bg-ink/5 transition-all group-hover:bg-ink group-hover:text-white sm:col-start-5">
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* =========================== CREDENTIALS ========================== */}
        <section id="credentials" className="relative overflow-hidden bg-night px-5 py-28 text-white sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Label n="07" dark>
                  燈塔 · Credentials
                </Label>
                <h2 className="reveal mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                  Credentials,
                  <br />
                  <span className="font-serif font-normal italic text-white/80">awards &amp; language.</span>
                </h2>
              </div>
              <div className="relative mx-auto w-[min(320px,76vw)]">
                <div className="absolute inset-10 rounded-full bg-tomato/25 blur-3xl" />
                <Plate k="island-lighthouse" alt="燈塔插畫" className="relative w-full" />
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {credentials.map((c) => (
                <figure key={c.src} className="reveal overflow-hidden rounded-[24px] bg-white/[0.05] ring-1 ring-white/10">
                  <div className="aspect-[4/3] overflow-hidden bg-white/[0.04]">
                    <OwnPhoto
                      src={c.src}
                      alt={c.title}
                      onOpen={open}
                      className="h-full w-full object-cover"
                      fallback={
                        <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_120%,rgba(219,106,65,0.35),transparent_60%)]">
                          <span className="font-serif text-6xl italic text-white/25">{c.year.slice(0, 4)}</span>
                        </div>
                      }
                    />
                  </div>
                  <figcaption className="p-5">
                    <p className="text-[15px] font-semibold leading-snug">{c.title}</p>
                    <p className="mt-1 text-[13px] text-white/50">{c.year}</p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="reveal rounded-[26px] bg-white/[0.05] p-7 ring-1 ring-white/10">
                <p className="text-[13px] text-white/50">Awards &amp; scholarships</p>
                <ul className="mt-3 divide-y divide-white/10">
                  {awards.map((a) => (
                    <li key={a.name} className="flex items-center justify-between gap-4 py-3.5 text-[15px]">
                      <span className="text-white/85">{a.name}</span>
                      <span className="font-serif text-lg italic text-tomato">{a.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="reveal grid grid-cols-3 gap-3">
                {scores.map((s) => (
                  <div key={s.name} className="flex flex-col justify-between rounded-[26px] bg-white/[0.05] p-5 ring-1 ring-white/10">
                    <p className="text-[13px] text-white/50">{s.name}</p>
                    <p className="mt-8 text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-tight">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== CONTACT =========================== */}
        <section id="contact" className="relative isolate overflow-hidden px-5 py-32 text-white sm:px-8 sm:py-44">
          <img src={img("sunset")} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e1220]/85 via-[#0e1220]/45 to-transparent" />
          <div className="mx-auto max-w-[1240px]">
            <p className="reveal flex items-center gap-3 text-[13px] font-medium text-white/70">
              <span className="h-px w-8 bg-white/40" /> 下一座島，一起蓋
            </p>
            <h2 className="reveal mt-6 max-w-[14ch] text-[clamp(2.6rem,6.4vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Let&rsquo;s build something <span className="font-serif font-normal italic">meaningful.</span>
            </h2>
            <p className="reveal mt-6 max-w-[52ch] text-[16px] leading-relaxed text-white/75">
              對研究、基因體分析、臨床藥學數位工具或學術合作有興趣，歡迎透過 Email、GitHub 或 ORCID 聯繫我。
            </p>
            <div className="reveal mt-9 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-ink">
                <Mail className="h-4 w-4" /> {profile.email}
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-5 text-[14px] font-semibold ring-1 ring-white/25 backdrop-blur-md hover:bg-white/25">
                <GithubMark className="h-4 w-4" /> GitHub
              </a>
              <a href={profile.orcid} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-5 text-[14px] font-semibold ring-1 ring-white/25 backdrop-blur-md hover:bg-white/25">
                ORCID <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-10 text-[13px] text-muted sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-2 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.nameZh} {profile.nameEn}
          </span>
          <span>Illustrations generated with Higgsfield · 3D islands built with Three.js</span>
        </div>
      </footer>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-6 backdrop-blur-sm"
        >
          <button type="button" aria-label="關閉" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white">
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-[88vh] max-w-[94vw] rounded-2xl bg-white object-contain" />
        </div>
      )}
    </>
  )
}
