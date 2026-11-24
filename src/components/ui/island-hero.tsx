"use client"

import * as React from "react"
import * as THREE from "three"
import { ArrowRight, Moon, Plus, RotateCcw, Sun, Sunset, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buildArchipelago,
  LIGHTING,
  type BuiltArchipelago,
  type IslandKind,
  type LightingMode,
} from "./island-scene"

/* -------------------------------------------------------------------------- */
/*  IslandHero — interactive 3D archipelago hero.                             */
/*                                                                            */
/*  Architecture adapted from the 21st.dev RealEstate3DHero component         */
/*  (orbit camera, projected hotspots, focus transitions, lighting presets),  */
/*  with these fixes:                                                         */
/*   • the WebGL scene is created once — hover / selection live in refs, so   */
/*     the scene is never torn down and rebuilt on interaction;              */
/*   • hotspot pins are positioned by writing to DOM refs each frame instead  */
/*     of setState, so React does not re-render 60×/s;                        */
/*   • camera orbits around a moving target (the original lost its look-at    */
/*     offset after a focus transition);                                      */
/*   • geometries and materials are disposed; rendering pauses off-screen;    */
/*   • touch drag works, wheel zoom only when the hero is focused, and        */
/*     prefers-reduced-motion disables auto-rotation.                         */
/* -------------------------------------------------------------------------- */

export interface IslandSpot {
  id: string
  kind: IslandKind
  num: string
  label: string
  labelEn: string
  summary: string
  /** id of the page section this island links to */
  section: string
  position: [number, number, number]
  radius: number
}

export interface IslandHeroProps {
  islands: IslandSpot[]
  initialLighting?: LightingMode
  autoRotate?: boolean
  /** shown if WebGL is unavailable */
  fallbackImage?: string
  onNavigate?: (sectionId: string) => void
  /** overlay content (headline etc.) */
  children?: React.ReactNode
  className?: string
}

/** distance that fits the whole ring for a given viewport aspect */
const overviewRadius = (aspect: number) => (aspect < 0.8 ? 40 : aspect < 1.2 ? 32 : 27)

const OVERVIEW = { radius: 26, phi: 1.02, theta: 0.65, target: new THREE.Vector3(0, 0.2, 0) }

const BG: Record<LightingMode, string> = {
  day: "radial-gradient(120% 90% at 60% 30%, #f6f3ec 0%, #ebe6dc 55%, #dfe3dc 100%)",
  sunset: "radial-gradient(120% 90% at 70% 25%, #ffe2c8 0%, #f3b996 50%, #d98b74 100%)",
  night: "radial-gradient(120% 90% at 60% 20%, #24345a 0%, #141f37 55%, #0b1222 100%)",
}

const WASH: Record<LightingMode, string> = {
  day: "radial-gradient(70% 55% at 12% 88%, rgba(240,237,230,.92) 0%, rgba(240,237,230,.55) 45%, transparent 75%)",
  sunset: "radial-gradient(70% 55% at 12% 88%, rgba(246,205,178,.9) 0%, rgba(246,205,178,.5) 45%, transparent 75%)",
  night: "radial-gradient(70% 55% at 12% 88%, rgba(14,20,36,.9) 0%, rgba(14,20,36,.5) 45%, transparent 75%)",
}

export function IslandHero({
  islands,
  initialLighting = "day",
  autoRotate = true,
  fallbackImage,
  onNavigate,
  children,
  className,
}: IslandHeroProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pinRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const [selected, setSelected] = React.useState<IslandSpot | null>(null)
  const [lighting, setLighting] = React.useState<LightingMode>(initialLighting)
  const [dragging, setDragging] = React.useState(false)
  const [webglFailed, setWebglFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  // mutable state the render loop reads (never triggers a rebuild)
  const live = React.useRef({
    hovered: false,
    selectedId: null as string | null,
    target: OVERVIEW.target.clone(),
    goalTarget: OVERVIEW.target.clone(),
    sph: new THREE.Spherical(OVERVIEW.radius, OVERVIEW.phi, OVERVIEW.theta),
    goal: new THREE.Spherical(OVERVIEW.radius, OVERVIEW.phi, OVERVIEW.theta),
    built: null as BuiltArchipelago | null,
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    lastInteraction: 0,
  })

  const islandsRef = React.useRef(islands)
  islandsRef.current = islands

  /* ------------------------------ scene setup ----------------------------- */
  React.useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      setWebglFailed(true)
      return
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setSize(wrap.clientWidth, wrap.clientHeight, false)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xe9e4da, 30, 62)
    const camera = new THREE.PerspectiveCamera(34, wrap.clientWidth / wrap.clientHeight, 0.1, 120)

    const built = buildArchipelago(islandsRef.current)
    scene.add(built.root)
    const { ambient, hemi, sun, rim } = built.lights
    scene.add(ambient, hemi, sun, rim)

    const L = live.current
    L.built = built
    L.renderer = renderer
    L.scene = scene

    // phones: pull the camera back so the whole ring fits
    // Frame the archipelago away from the headline: up-right on wide
    // screens, up on phones. setViewOffset shifts the image, not the camera.
    const fit = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const aspect = w / h
      const r = overviewRadius(aspect)
      if (!L.selectedId) L.goal.radius = r
      return r
    }
    // Frame the archipelago away from the headline (overview: up-right on
    // wide screens, up on phones) and away from the detail card (focus:
    // shifted left). setViewOffset slides the image, not the camera.
    const offsetGoal = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const wide = w / h > 1.2
      if (L.selectedId) return wide ? [w * (w >= 1280 ? 0.16 : 0.1), h * 0.04] : [0, h * 0.18]
      return wide ? [-w * (w >= 1280 ? 0.05 : 0.07), h * 0.08] : [0, h * 0.16]
    }
    const off = { x: 0, y: 0 }
    {
      const [gx, gy] = offsetGoal()
      off.x = gx
      off.y = gy
    }
    L.sph.radius = fit() + 8 // start a little further out, then glide in

    /* ---------------------------- pointer orbit --------------------------- */
    let down = false
    let px = 0
    let py = 0
    let moved = 0
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button,a")) return
      down = true
      moved = 0
      px = e.clientX
      py = e.clientY
      L.lastInteraction = performance.now()
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - px
      const dy = e.clientY - py
      px = e.clientX
      py = e.clientY
      moved += Math.abs(dx) + Math.abs(dy)
      if (moved > 4) setDragging(true)
      L.goal.theta -= dx * 0.006
      L.goal.phi = THREE.MathUtils.clamp(L.goal.phi - dy * 0.005, 0.45, 1.38)
      L.lastInteraction = performance.now()
    }
    const onUp = () => {
      down = false
      setDragging(false)
    }
    const onWheel = (e: WheelEvent) => {
      // only zoom when the user is clearly interacting with the map,
      // otherwise let the page scroll normally
      if (!e.ctrlKey && !L.hovered) return
      if (!e.ctrlKey && performance.now() - L.lastInteraction > 2500) return
      e.preventDefault()
      L.goal.radius = THREE.MathUtils.clamp(L.goal.radius + e.deltaY * 0.01, 6, 34)
      L.lastInteraction = performance.now()
    }
    wrap.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    wrap.addEventListener("wheel", onWheel, { passive: false })

    /* ------------------------------ visibility ---------------------------- */
    let visible = true
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.01 })
    io.observe(wrap)

    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      camera.aspect = w / h
      renderer.setSize(w, h, false)
      fit()
    })
    ro.observe(wrap)

    /* -------------------------------- loop -------------------------------- */
    const tmp = new THREE.Vector3()
    const proj = new THREE.Vector3()
    let last = performance.now()
    let raf = 0
    let firstFrame = true

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) {
        last = now
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = now / 1000

      // idle auto-rotate
      const idle = now - L.lastInteraction > 3000
      if (autoRotate && !reduceMotion && !down && !L.selectedId && !L.hovered && idle) {
        L.goal.theta += dt * 0.06
      }

      // ease camera toward goal
      const k = 1 - Math.pow(0.0015, dt)
      L.sph.radius += (L.goal.radius - L.sph.radius) * k
      L.sph.phi += (L.goal.phi - L.sph.phi) * k
      L.sph.theta += (L.goal.theta - L.sph.theta) * k
      L.target.lerp(L.goalTarget, k)
      const [gx, gy] = offsetGoal()
      off.x += (gx - off.x) * k
      off.y += (gy - off.y) * k
      const vw = wrap.clientWidth
      const vh = wrap.clientHeight
      camera.setViewOffset(vw, vh, off.x, off.y, vw, vh)
      camera.updateProjectionMatrix()
      tmp.setFromSpherical(L.sph).add(L.target)
      camera.position.copy(tmp)
      camera.lookAt(L.target)

      // island bobbing + small animations
      if (!reduceMotion) {
        built.islands.forEach((isl) => {
          isl.group.position.y = isl.baseY + Math.sin(t * 0.8 + isl.phase) * 0.08
          isl.group.rotation.y = Math.sin(t * 0.25 + isl.phase) * 0.03
        })
        built.clouds.forEach((c, i) => (c.rotation.y += dt * (0.02 + i * 0.004)))
        if (built.helix) built.helix.rotation.y += dt * 0.6
        if (built.turbine) built.turbine.rotation.z -= dt * 1.6
        const mp = built.motes.geometry.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < mp.count; i++) {
          let y = mp.getY(i) + dt * 0.18
          if (y > 5) y = -3
          mp.setY(i, y)
        }
        mp.needsUpdate = true
      }

      renderer.render(scene, camera)
      if (firstFrame) {
        firstFrame = false
        setReady(true)
      }

      // project pins (DOM writes, no React state)
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      built.islands.forEach((isl) => {
        const el = pinRefs.current[isl.id]
        if (!el) return
        proj.set(0, isl.pinOffset, 0).applyMatrix4(isl.group.matrixWorld).project(camera)
        const behind = proj.z > 1
        const x = (proj.x * 0.5 + 0.5) * w
        const y = (-proj.y * 0.5 + 0.5) * h
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
        el.style.opacity = behind ? "0" : ""
        el.style.zIndex = String(1000 - Math.round(proj.z * 1000))
      })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      wrap.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      wrap.removeEventListener("wheel", onWheel)
      built.dispose()
      renderer.dispose()
      L.built = null
      L.renderer = null
      L.scene = null
    }
  }, [autoRotate])

  /* ---------------------------- lighting presets --------------------------- */
  React.useEffect(() => {
    const { built, renderer, scene } = live.current
    if (!built || !renderer || !scene) return
    const p = LIGHTING[lighting]
    const { ambient, hemi, sun, rim, glow } = built.lights
    ambient.color.setHex(p.ambient[0])
    ambient.intensity = p.ambient[1]
    hemi.color.setHex(p.hemi[0])
    hemi.groundColor.setHex(p.hemi[1])
    hemi.intensity = p.hemi[2]
    sun.color.setHex(p.sun[0])
    sun.intensity = p.sun[1]
    sun.position.set(...p.sun[2])
    rim.color.setHex(p.rim[0])
    rim.intensity = p.rim[1]
    glow.forEach((g) => (g.intensity = p.glow))
    built.glassMaterial.emissiveIntensity = p.glass
    if (built.beacon) (built.beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = p.glass + 0.6
    ;(scene.fog as THREE.Fog).color.setHex(p.fog)
    renderer.toneMappingExposure = p.exposure
  }, [lighting, ready])

  /* ------------------------------ navigation ------------------------------ */
  const focus = React.useCallback((spot: IslandSpot | null) => {
    const L = live.current
    L.lastInteraction = performance.now()
    if (!spot || L.selectedId === spot.id) {
      L.selectedId = null
      setSelected(null)
      L.goalTarget.copy(OVERVIEW.target)
      const aspect = wrapRef.current ? wrapRef.current.clientWidth / wrapRef.current.clientHeight : 1.6
      L.goal.radius = overviewRadius(aspect)
      L.goal.phi = OVERVIEW.phi
      return
    }
    L.selectedId = spot.id
    setSelected(spot)
    const [x, y, z] = spot.position
    L.goalTarget.set(x, y + 0.5, z)
    // look at the island from outside the ring, taking the shortest turn
    let theta = spot.kind === "home" ? L.goal.theta : Math.atan2(x, z)
    const twoPi = Math.PI * 2
    theta = L.goal.theta + ((((theta - L.goal.theta) % twoPi) + twoPi + Math.PI) % twoPi) - Math.PI
    L.goal.theta = theta
    L.goal.phi = 0.98
    L.goal.radius = spot.kind === "home" ? 13 : 10.5
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && focus(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focus])

  const dark = lighting === "night"

  return (
    <section
      ref={wrapRef}
      id="top"
      aria-label="互動 3D 群島：每座島代表一個章節"
      onPointerEnter={() => (live.current.hovered = true)}
      onPointerLeave={() => (live.current.hovered = false)}
      className={cn(
        "relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden select-none touch-pan-y transition-[background] duration-700",
        dragging ? "cursor-grabbing" : "cursor-grab",
        dark ? "text-[#f3efe7]" : "text-ink",
        className,
      )}
      style={{ background: BG[lighting] }}
    >
      {/* giant faint wordmark behind the islands (Forma) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[13%] -z-10 text-center font-sans font-semibold leading-none tracking-[-0.06em] transition-colors duration-700",
          "text-[26vw] md:text-[21vw]",
          dark ? "text-white/[0.04]" : "text-black/[0.045]",
        )}
      >
        islands
      </div>

      {webglFailed && fallbackImage ? (
        <img src={fallbackImage} alt="浩宸群島" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 h-full w-full transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}
        />
      )}

      {/* soft wash behind the headline so small copy stays legible over islands */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 transition-[background] duration-700"
        style={{ background: WASH[lighting] }}
      />

      {/* overlay copy */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 transition-[opacity,filter] duration-500",
          selected && "opacity-25 blur-[3px]",
        )}
      >
        {children}
      </div>

      {/* projected island pins (HEART-style numbered tags) */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {islands.map((s) => {
          const active = selected?.id === s.id
          return (
            <button
              key={s.id}
              ref={(el) => {
                pinRefs.current[s.id] = el
              }}
              type="button"
              onClick={() => focus(s)}
              aria-pressed={active}
              aria-label={`${s.num} ${s.label}：${s.summary}`}
              className={cn(
                "group pointer-events-auto absolute left-0 top-0 flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12px] font-semibold shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)] transition-[opacity,background,color] duration-300 will-change-transform",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato",
                active ? "bg-ink text-white" : "bg-white/95 text-ink hover:bg-white",
                !ready && "opacity-0",
              )}
            >
              <span
                className={cn(
                  "grid h-6 min-w-6 place-items-center rounded-full px-1 font-serif text-[13px] italic",
                  active ? "bg-tomato text-white" : "bg-tomato/12 text-tomato",
                )}
              >
                {active ? <X className="h-3.5 w-3.5" /> : s.num}
              </span>
              <span className="hidden whitespace-nowrap sm:inline">{s.label}</span>
              <Plus className="hidden h-3 w-3 opacity-40 transition-transform group-hover:rotate-90 sm:block" />
              {/* stem */}
              <span className="absolute left-1/2 top-full h-3 w-px -translate-x-1/2 bg-current opacity-30" />
            </button>
          )
        })}
      </div>

      {/* right: island index (HEART "policy index") */}
      <nav
        aria-label="群島索引"
        className={cn(
          "absolute right-5 top-1/2 z-30 hidden w-60 -translate-y-1/2 rounded-3xl p-2 backdrop-blur-xl xl:block",
          dark ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-white/55 ring-1 ring-black/5",
        )}
      >
        <p className={cn("px-3 pb-1 pt-2 text-[11px] font-semibold", dark ? "text-white/50" : "text-ink/45")}>
          The island index
        </p>
        <ul>
          {islands.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => focus(s)}
                className={cn(
                  "flex w-full items-baseline gap-3 rounded-2xl px-3 py-2 text-left transition-colors",
                  selected?.id === s.id
                    ? "bg-ink text-white"
                    : dark
                      ? "hover:bg-white/10"
                      : "hover:bg-white/80",
                )}
              >
                <span className="w-6 font-serif text-lg italic text-tomato">{s.num}</span>
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="ml-auto text-[11px] opacity-50">{s.labelEn}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* focused island card */}
      {selected && (
        <div className="absolute inset-x-4 bottom-24 z-40 sm:inset-x-auto sm:bottom-28 sm:right-6 sm:w-[360px] xl:right-72 animate-[rise_.45s_cubic-bezier(.2,.8,.2,1)]">
          <div className="rounded-3xl bg-white/95 p-5 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-4xl italic leading-none text-tomato">{selected.num}</p>
                <h2 className="mt-2 text-xl font-semibold leading-tight">{selected.label}</h2>
                <p className="text-xs text-ink/50">{selected.labelEn}</p>
              </div>
              <button
                type="button"
                onClick={() => focus(null)}
                aria-label="關閉"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 hover:bg-ink/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{selected.summary}</p>
            <button
              type="button"
              onClick={() => onNavigate?.(selected.section)}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              前往這座島 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* bottom toolbar: atmosphere + reset */}
      <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
        <div
          role="radiogroup"
          aria-label="光線"
          className={cn(
            "flex items-center rounded-full p-1 backdrop-blur-xl",
            dark ? "bg-white/10 ring-1 ring-white/10" : "bg-white/70 ring-1 ring-black/5",
          )}
        >
          {(
            [
              ["day", Sun, "白天"],
              ["sunset", Sunset, "黃昏"],
              ["night", Moon, "夜晚"],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={lighting === mode}
              onClick={() => setLighting(mode)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
                lighting === mode ? "bg-ink text-white" : dark ? "text-white/70 hover:text-white" : "text-ink/60 hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        {selected && (
          <button
            type="button"
            onClick={() => focus(null)}
            className={cn(
              "flex h-11 items-center gap-1.5 rounded-full px-4 text-xs font-semibold backdrop-blur-xl",
              dark ? "bg-white/10 text-white ring-1 ring-white/10" : "bg-white/70 ring-1 ring-black/5",
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" /> 全景
          </button>
        )}
      </div>
    </section>
  )
}
