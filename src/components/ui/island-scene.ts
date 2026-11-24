import * as THREE from "three"

/* -------------------------------------------------------------------------- */
/*  Procedural low-poly archipelago. Pure Three.js, no React.                 */
/*  Adapted from the RealEstate3DHero scene builder (floating crag islands,   */
/*  clouds, motes, lighting presets) and extended to a multi-island map.      */
/* -------------------------------------------------------------------------- */

export type LightingMode = "day" | "sunset" | "night"

export type IslandKind =
  | "home"
  | "pharmacy"
  | "lab"
  | "observatory"
  | "harbor"
  | "workshop"
  | "lighthouse"

export interface IslandDef {
  id: string
  kind: IslandKind
  /** world position of the island's top surface centre */
  position: [number, number, number]
  radius: number
}

export interface BuiltArchipelago {
  root: THREE.Group
  islands: { id: string; group: THREE.Group; baseY: number; phase: number; pinOffset: number }[]
  clouds: THREE.Mesh[]
  motes: THREE.Points
  lights: {
    ambient: THREE.AmbientLight
    hemi: THREE.HemisphereLight
    sun: THREE.DirectionalLight
    rim: THREE.DirectionalLight
    glow: THREE.PointLight[]
  }
  glassMaterial: THREE.MeshStandardMaterial
  helix?: THREE.Group
  turbine?: THREE.Group
  beacon?: THREE.Mesh
  dispose: () => void
}

/* -------------------------------- palette -------------------------------- */

const C = {
  sand: 0xeadcbc,
  grass: 0x8fae7a,
  grassDark: 0x6f9161,
  soil: 0x9a7356,
  rock: 0xb48c6c,
  rockDark: 0x8d6a52,
  cream: 0xf4eee2,
  white: 0xfbfaf6,
  stone: 0xd6cbb8,
  tomato: 0xdb6a41,
  tomatoDeep: 0xb9512f,
  teal: 0x4fbcb4,
  water: 0x7fd0d1,
  ink: 0x2b2a28,
  wood: 0x9b6b47,
  green: 0x3f9a6b,
  tree: 0x5f8f5a,
  treeDark: 0x46744a,
}

/* ------------------------------- helpers -------------------------------- */

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, ...opts })
}

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, shadow = true) {
  const o = new THREE.Mesh(geo, m)
  o.castShadow = shadow
  o.receiveShadow = true
  return o
}

/** cheap deterministic pseudo random so the islands look the same every load */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* --------------------------- island base shape --------------------------- */

function buildBase(radius: number, seed: number, materials: Record<string, THREE.Material>) {
  const g = new THREE.Group()
  const r = rng(seed)

  // grassy cap
  const cap = mesh(new THREE.CylinderGeometry(radius, radius * 1.02, 0.22, 18), materials.grass, false)
  cap.position.y = -0.11
  g.add(cap)

  // sandy rim
  const rim = mesh(new THREE.CylinderGeometry(radius * 1.06, radius * 1.0, 0.26, 18), materials.sand, false)
  rim.position.y = -0.3
  g.add(rim)

  // inverted craggy cone
  const depth = radius * 1.55
  const coneGeo = new THREE.ConeGeometry(radius * 1.02, depth, 12, 5)
  const p = coneGeo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    if (y > depth / 2 - 0.01) continue // keep the top ring tidy
    const n = Math.sin(x * 2.1 + y * 1.3 + seed) * Math.cos(z * 1.9 + seed) * 0.22 * radius
    p.setXYZ(i, x + n * 0.5, y + Math.sin(y * 4 + seed) * 0.05, z + n * 0.5)
  }
  coneGeo.computeVertexNormals()
  const cone = mesh(coneGeo, materials.rock)
  cone.rotation.x = Math.PI
  cone.position.y = -0.43 - depth / 2
  g.add(cone)

  // a few hanging boulders, like the reference renders
  const boulderGeo = new THREE.DodecahedronGeometry(0.28 * radius, 0)
  for (let i = 0; i < 3; i++) {
    const b = mesh(boulderGeo, i === 1 ? materials.tomatoSoft : materials.rockDark)
    const a = r() * Math.PI * 2
    b.position.set(Math.cos(a) * radius * 0.55, -0.7 - r() * depth * 0.4, Math.sin(a) * radius * 0.55)
    b.scale.setScalar(0.6 + r() * 0.6)
    g.add(b)
  }
  return g
}

/* ------------------------------ prop builders ----------------------------- */

function tree(m: Record<string, THREE.Material>, h = 1, dark = false) {
  const g = new THREE.Group()
  const trunk = mesh(new THREE.CylinderGeometry(0.03 * h, 0.04 * h, 0.22 * h, 5), m.wood)
  trunk.position.y = 0.11 * h
  const crown = mesh(new THREE.ConeGeometry(0.16 * h, 0.55 * h, 6), dark ? m.treeDark : m.tree)
  crown.position.y = 0.48 * h
  g.add(trunk, crown)
  return g
}

function scatterTrees(
  g: THREE.Group,
  m: Record<string, THREE.Material>,
  spots: [number, number, number?][],
) {
  spots.forEach(([x, z, s = 1], i) => {
    const t = tree(m, s, i % 2 === 0)
    t.position.set(x, 0, z)
    g.add(t)
  })
}

function house(m: Record<string, THREE.Material>, w: number, h: number, d: number, roof = true) {
  const g = new THREE.Group()
  const body = mesh(new THREE.BoxGeometry(w, h, d), m.white)
  body.position.y = h / 2
  g.add(body)
  if (roof) {
    const r = mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.55, 4), m.tomato)
    r.rotation.y = Math.PI / 4
    r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d))
    r.position.y = h + h * 0.27
    g.add(r)
  }
  return g
}

function windowPane(m: Record<string, THREE.Material>, w: number, h: number) {
  return mesh(new THREE.BoxGeometry(w, h, 0.02), m.glass, false)
}

/* -------------------------------- islands -------------------------------- */

type Extras = { helix?: THREE.Group; turbine?: THREE.Group; beacon?: THREE.Mesh }

function buildProps(kind: IslandKind, m: Record<string, THREE.Material>, extras: Extras) {
  const g = new THREE.Group()

  switch (kind) {
    case "home": {
      // Studio house + flag + garden: the "about me" island
      const h = house(m, 1.3, 0.8, 1.0)
      h.position.set(-0.3, 0, -0.2)
      g.add(h)
      const w1 = windowPane(m, 0.26, 0.3)
      w1.position.set(-0.55, 0.42, 0.31)
      const w2 = w1.clone()
      w2.position.x = -0.05
      g.add(w1, w2)
      const door = mesh(new THREE.BoxGeometry(0.22, 0.4, 0.02), m.tomatoDeep, false)
      door.position.set(0.2, 0.2, 0.31)
      g.add(door)
      // tower with a terrace
      const tower = mesh(new THREE.BoxGeometry(0.55, 1.5, 0.55), m.cream)
      tower.position.set(0.75, 0.75, -0.45)
      g.add(tower)
      const tw = windowPane(m, 0.18, 0.26)
      tw.position.set(0.75, 1.15, -0.17)
      g.add(tw)
      const towerRoof = mesh(new THREE.ConeGeometry(0.48, 0.42, 4), m.tomato)
      towerRoof.rotation.y = Math.PI / 4
      towerRoof.position.set(0.75, 1.71, -0.45)
      g.add(towerRoof)
      // flag
      const pole = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 5), m.ink)
      pole.position.set(0.75, 2.2, -0.45)
      const flag = mesh(new THREE.BoxGeometry(0.32, 0.18, 0.01), m.tomato)
      flag.position.set(0.92, 2.42, -0.45)
      g.add(pole, flag)
      // round lawn + path
      const path = mesh(new THREE.BoxGeometry(0.35, 0.02, 1.2), m.stone, false)
      path.position.set(0.2, 0.01, 0.95)
      g.add(path)
      scatterTrees(g, m, [
        [-1.4, 0.4, 1.1],
        [-1.2, -0.9, 1.3],
        [1.5, 0.5, 0.9],
        [1.3, 1.1, 0.8],
        [-0.9, 1.2, 0.9],
      ])
      break
    }

    case "pharmacy": {
      const h = house(m, 1.0, 0.7, 0.8, false)
      h.position.set(0, 0, -0.1)
      g.add(h)
      const awning = mesh(new THREE.BoxGeometry(1.1, 0.05, 0.3), m.green)
      awning.position.set(0, 0.62, 0.42)
      awning.rotation.x = 0.25
      g.add(awning)
      // green cross sign
      const crossA = mesh(new THREE.BoxGeometry(0.36, 0.1, 0.06), m.green)
      const crossB = mesh(new THREE.BoxGeometry(0.1, 0.36, 0.06), m.green)
      crossA.position.set(0, 0.98, 0.0)
      crossB.position.copy(crossA.position)
      g.add(crossA, crossB)
      const shop = windowPane(m, 0.7, 0.32)
      shop.position.set(0, 0.3, 0.31)
      g.add(shop)
      // giant capsule
      const capGeo = new THREE.CapsuleGeometry(0.11, 0.26, 4, 10)
      const cap1 = mesh(capGeo, m.tomato)
      cap1.rotation.z = Math.PI / 2.6
      cap1.position.set(0.72, 0.16, 0.45)
      const cap2 = mesh(capGeo, m.white)
      cap2.rotation.z = -Math.PI / 3
      cap2.rotation.y = 0.6
      cap2.position.set(-0.7, 0.14, 0.5)
      g.add(cap1, cap2)
      // mortar
      const mortar = mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.18, 10), m.stone)
      mortar.position.set(0.65, 0.09, -0.45)
      g.add(mortar)
      scatterTrees(g, m, [
        [-0.75, -0.5, 0.8],
        [0.95, -0.05, 0.7],
      ])
      break
    }

    case "lab": {
      // glass dome lab with a rotating DNA helix
      const base = mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.3, 16), m.white)
      base.position.y = 0.15
      g.add(base)
      const dome = mesh(
        new THREE.SphereGeometry(0.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        m.domeGlass,
        false,
      )
      dome.position.y = 0.3
      g.add(dome)
      const helix = new THREE.Group()
      const bead = new THREE.SphereGeometry(0.05, 8, 6)
      const rung = new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4)
      for (let i = 0; i < 22; i++) {
        const t = i * 0.42
        const y = i * 0.075
        const a = mesh(bead, i % 3 === 0 ? m.tomato : m.teal, false)
        const b = mesh(bead, m.teal, false)
        a.position.set(Math.cos(t) * 0.15, y, Math.sin(t) * 0.15)
        b.position.set(Math.cos(t + Math.PI) * 0.15, y, Math.sin(t + Math.PI) * 0.15)
        const r = mesh(rung, m.cream, false)
        r.position.set(0, y, 0)
        r.rotation.z = Math.PI / 2
        r.rotation.y = -t
        helix.add(a, b, r)
      }
      helix.position.y = 0.45
      g.add(helix)
      extras.helix = helix
      // little sequencers
      for (let i = 0; i < 3; i++) {
        const box = mesh(new THREE.BoxGeometry(0.22, 0.18, 0.18), m.white)
        const a = (i / 3) * Math.PI * 2 + 0.4
        box.position.set(Math.cos(a) * 0.95, 0.09, Math.sin(a) * 0.95)
        box.lookAt(0, 0.09, 0)
        const screen = windowPane(m, 0.12, 0.06)
        screen.position.set(0, 0.03, 0.095)
        box.add(screen)
        g.add(box)
      }
      scatterTrees(g, m, [[-0.95, 0.55, 0.7]])
      break
    }

    case "observatory": {
      // the eye: glaucoma research
      const drum = mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.35, 16), m.tomatoSoft)
      drum.position.y = 0.17
      g.add(drum)
      const eye = mesh(new THREE.SphereGeometry(0.45, 24, 16), m.white)
      eye.position.y = 0.78
      g.add(eye)
      const iris = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 20), m.teal, false)
      iris.rotation.x = Math.PI / 2
      iris.position.set(0, 0.8, 0.43)
      const pupil = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), m.ink, false)
      pupil.rotation.x = Math.PI / 2
      pupil.position.set(0, 0.8, 0.455)
      g.add(iris, pupil)
      const ring = mesh(new THREE.TorusGeometry(0.47, 0.035, 6, 24, Math.PI), m.stone)
      ring.position.y = 0.78
      ring.rotation.y = Math.PI / 2
      g.add(ring)
      // pond (intra-ocular pressure, if you like)
      const pond = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 20), m.water, false)
      pond.position.set(0.55, 0.02, 0.6)
      pond.scale.set(1, 1, 0.6)
      g.add(pond)
      scatterTrees(g, m, [
        [-0.8, -0.3, 0.9],
        [-0.65, 0.45, 0.75],
        [0.85, -0.55, 0.85],
      ])
      break
    }

    case "harbor": {
      const hall = house(m, 1.0, 0.55, 0.7)
      hall.position.set(-0.25, 0, -0.25)
      g.add(hall)
      const hallWin = windowPane(m, 0.7, 0.18)
      hallWin.position.set(-0.25, 0.3, 0.11)
      g.add(hallWin)
      // poster boards
      for (let i = 0; i < 3; i++) {
        const board = mesh(new THREE.BoxGeometry(0.24, 0.32, 0.03), m.cream)
        board.position.set(-0.75 + i * 0.32, 0.26, 0.55)
        board.rotation.x = -0.12
        const leg = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 4), m.wood)
        leg.position.set(-0.75 + i * 0.32, 0.12, 0.55)
        const ink = mesh(new THREE.BoxGeometry(0.16, 0.05, 0.005), i === 1 ? m.tomato : m.teal, false)
        ink.position.set(0, 0.07, 0.02)
        board.add(ink)
        g.add(leg, board)
      }
      // pier + boat
      const pier = mesh(new THREE.BoxGeometry(0.25, 0.04, 0.9), m.wood)
      pier.position.set(0.85, -0.05, 0.55)
      g.add(pier)
      const hull = mesh(new THREE.CylinderGeometry(0.16, 0.08, 0.5, 6, 1, false, 0, Math.PI), m.tomato)
      hull.rotation.set(Math.PI / 2, 0, Math.PI / 2)
      hull.position.set(1.2, -0.02, 0.85)
      const mast = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 4), m.wood)
      mast.position.set(1.2, 0.28, 0.85)
      const sail = mesh(new THREE.ConeGeometry(0.16, 0.45, 3), m.white)
      sail.position.set(1.2, 0.3, 0.92)
      sail.scale.z = 0.15
      g.add(hull, mast, sail)
      // flags
      ;[m.tomato, m.teal, m.green].forEach((fm, i) => {
        const pole = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), m.ink)
        pole.position.set(0.25 + i * 0.18, 0.25, -0.75)
        const f = mesh(new THREE.BoxGeometry(0.14, 0.08, 0.005), fm, false)
        f.position.set(0.32 + i * 0.18, 0.44, -0.75)
        g.add(pole, f)
      })
      break
    }

    case "workshop": {
      const wallA = mesh(new THREE.BoxGeometry(1.1, 0.75, 0.08), m.cream)
      wallA.position.set(0, 0.37, -0.45)
      const wallB = mesh(new THREE.BoxGeometry(0.08, 0.75, 0.9), m.cream)
      wallB.position.set(-0.55, 0.37, 0)
      g.add(wallA, wallB)
      const desk = mesh(new THREE.BoxGeometry(0.55, 0.04, 0.3), m.wood)
      desk.position.set(0.05, 0.3, -0.2)
      const legGeo = new THREE.BoxGeometry(0.03, 0.3, 0.03)
      ;[
        [-0.2, -0.32],
        [0.3, -0.32],
        [-0.2, -0.08],
        [0.3, -0.08],
      ].forEach(([x, z]) => {
        const l = mesh(legGeo, m.ink)
        l.position.set(x + 0.0, 0.15, z)
        g.add(l)
      })
      g.add(desk)
      const laptop = mesh(new THREE.BoxGeometry(0.22, 0.14, 0.01), m.ink)
      laptop.position.set(0.05, 0.4, -0.3)
      laptop.rotation.x = -0.25
      const screen = windowPane(m, 0.19, 0.11)
      screen.position.set(0, 0, 0.007)
      laptop.add(screen)
      g.add(laptop)
      // gear on the wall
      const gear = mesh(new THREE.TorusGeometry(0.12, 0.04, 6, 10), m.tomato)
      gear.position.set(-0.25, 0.58, -0.4)
      g.add(gear)
      // conveyor with boxes
      const belt = mesh(new THREE.BoxGeometry(0.9, 0.06, 0.2), m.stone)
      belt.position.set(0.15, 0.12, 0.45)
      g.add(belt)
      for (let i = 0; i < 4; i++) {
        const b = mesh(new THREE.BoxGeometry(0.12, 0.1, 0.12), i % 2 ? m.white : m.tomatoSoft)
        b.position.set(-0.2 + i * 0.22, 0.2, 0.45)
        g.add(b)
      }
      // wind turbine
      const turbine = new THREE.Group()
      const towerT = mesh(new THREE.CylinderGeometry(0.025, 0.04, 1.3, 6), m.white)
      towerT.position.y = 0.65
      turbine.add(towerT)
      const hub = new THREE.Group()
      hub.position.set(0, 1.3, 0.05)
      for (let i = 0; i < 3; i++) {
        const blade = mesh(new THREE.BoxGeometry(0.04, 0.45, 0.01), m.white)
        blade.position.y = 0.22
        const holder = new THREE.Group()
        holder.rotation.z = (i / 3) * Math.PI * 2
        holder.add(blade)
        hub.add(holder)
      }
      turbine.add(hub)
      turbine.position.set(0.75, 0, -0.3)
      g.add(turbine)
      extras.turbine = hub
      break
    }

    case "lighthouse": {
      const levels = 5
      for (let i = 0; i < levels; i++) {
        const seg = mesh(
          new THREE.CylinderGeometry(0.22 - i * 0.022, 0.24 - i * 0.022, 0.28, 14),
          i % 2 ? m.white : m.tomato,
        )
        seg.position.y = 0.14 + i * 0.28
        g.add(seg)
      }
      const balcony = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 14), m.ink)
      balcony.position.y = levels * 0.28 + 0.02
      g.add(balcony)
      const lamp = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10), m.lamp, false)
      lamp.position.y = levels * 0.28 + 0.14
      g.add(lamp)
      extras.beacon = lamp
      const cap = mesh(new THREE.ConeGeometry(0.15, 0.2, 10), m.tomatoDeep)
      cap.position.y = levels * 0.28 + 0.34
      g.add(cap)
      // laurel stele + graduation cap
      const stele = mesh(new THREE.BoxGeometry(0.16, 0.42, 0.08), m.stone)
      stele.position.set(-0.6, 0.21, 0.2)
      g.add(stele)
      const board = mesh(new THREE.BoxGeometry(0.3, 0.03, 0.3), m.ink)
      board.position.set(0.6, 0.32, 0.25)
      board.rotation.y = 0.5
      const crown = mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 8), m.ink)
      crown.position.set(0.6, 0.24, 0.25)
      const plinth = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.18, 8), m.stone)
      plinth.position.set(0.6, 0.09, 0.25)
      g.add(plinth, crown, board)
      // steps
      for (let i = 0; i < 3; i++) {
        const s = mesh(new THREE.BoxGeometry(0.3, 0.05, 0.12), m.stone)
        s.position.set(0, 0.025 + i * 0.05, 0.5 - i * 0.1)
        g.add(s)
      }
      scatterTrees(g, m, [[-0.55, -0.45, 0.7]])
      break
    }
  }
  return g
}

/* ------------------------------ main builder ----------------------------- */

export function buildArchipelago(defs: IslandDef[]): BuiltArchipelago {
  const root = new THREE.Group()

  const m: Record<string, THREE.MeshStandardMaterial> = {
    sand: mat(C.sand),
    grass: mat(C.grass),
    rock: mat(C.rock, { flatShading: true }),
    rockDark: mat(C.rockDark, { flatShading: true }),
    tomatoSoft: mat(0xe28c66, { flatShading: true }),
    white: mat(C.white, { roughness: 0.7 }),
    cream: mat(C.cream, { roughness: 0.75 }),
    stone: mat(C.stone),
    tomato: mat(C.tomato, { roughness: 0.7 }),
    tomatoDeep: mat(C.tomatoDeep),
    teal: mat(C.teal, { roughness: 0.4, emissive: C.teal, emissiveIntensity: 0.15 }),
    water: mat(C.water, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9 }),
    ink: mat(C.ink),
    wood: mat(C.wood),
    green: mat(C.green),
    tree: mat(C.tree, { flatShading: true }),
    treeDark: mat(C.treeDark, { flatShading: true }),
    glass: mat(0xffe2a8, { emissive: 0xffa340, emissiveIntensity: 0.25, roughness: 0.25 }),
    domeGlass: mat(0xcfeeee, { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1 }),
    lamp: mat(0xfff1c2, { emissive: 0xffc260, emissiveIntensity: 0.6 }),
  }

  const extras: Extras = {}
  const islands: BuiltArchipelago["islands"] = []

  defs.forEach((def, i) => {
    const group = new THREE.Group()
    group.add(buildBase(def.radius, i * 7 + 3, m))
    const props = buildProps(def.kind, m, extras)
    group.add(props)
    group.position.set(...def.position)
    root.add(group)
    // pin hovers above the tallest prop
    const box = new THREE.Box3().setFromObject(props)
    islands.push({
      id: def.id,
      group,
      baseY: def.position[1],
      phase: i * 1.37,
      pinOffset: Math.max(box.max.y, 0.6) + 0.35,
    })
  })

  // rope bridges from the home island to each outer island
  const home = defs.find((d) => d.kind === "home")
  if (home) {
    const plankGeo = new THREE.BoxGeometry(0.34, 0.03, 0.09)
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x9b6b47 })
    defs.forEach((d) => {
      if (d === home) return
      const a = new THREE.Vector3(...home.position)
      const b = new THREE.Vector3(...d.position)
      const dir = b.clone().sub(a)
      const len = dir.length()
      dir.normalize()
      const start = a.clone().add(dir.clone().multiplyScalar(home.radius * 0.95))
      const end = b.clone().sub(dir.clone().multiplyScalar(d.radius * 0.95))
      const span = start.distanceTo(end)
      const n = Math.max(6, Math.floor(span / 0.14))
      const yaw = Math.atan2(dir.x, dir.z)
      const ropeL: THREE.Vector3[] = []
      const ropeR: THREE.Vector3[] = []
      const side = new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(0.17)
      for (let k = 0; k <= n; k++) {
        const t = k / n
        const pt = start.clone().lerp(end, t)
        pt.y -= Math.sin(t * Math.PI) * 0.35 * (len / 6) // sag
        pt.y -= 0.02
        const plank = mesh(plankGeo, m.wood, false)
        plank.position.copy(pt)
        plank.rotation.y = yaw
        root.add(plank)
        ropeL.push(pt.clone().add(side).setY(pt.y + 0.14))
        ropeR.push(pt.clone().sub(side).setY(pt.y + 0.14))
      }
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ropeL), ropeMat))
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ropeR), ropeMat))
    })
  }

  // soft clouds drifting beneath the islands
  const clouds: THREE.Mesh[] = []
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    roughness: 1,
    depthWrite: false,
  })
  const cloudGeo = new THREE.IcosahedronGeometry(1, 1)
  const r = rng(42)
  for (let i = 0; i < 9; i++) {
    const cluster = new THREE.Group()
    for (let k = 0; k < 4; k++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat)
      puff.position.set(k * 0.7 - 1, r() * 0.25, r() * 0.4)
      puff.scale.setScalar(0.5 + r() * 0.5)
      cluster.add(puff)
    }
    const a = (i / 9) * Math.PI * 2 + r()
    const rad = 3 + r() * 6
    cluster.position.set(Math.cos(a) * rad, -3.2 - r() * 2.2, Math.sin(a) * rad)
    cluster.scale.set(1.2, 0.45, 0.8)
    root.add(cluster)
    clouds.push(cluster as unknown as THREE.Mesh)
  }

  // floating dust motes
  const count = 140
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (r() - 0.5) * 22
    pos[i * 3 + 1] = r() * 8 - 3
    pos[i * 3 + 2] = (r() - 0.5) * 22
  }
  const moteGeo = new THREE.BufferGeometry()
  moteGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  const motes = new THREE.Points(
    moteGeo,
    new THREE.PointsMaterial({
      color: 0xffc98a,
      size: 0.07,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  root.add(motes)

  // lights
  const ambient = new THREE.AmbientLight(0xfff4e6, 0.7)
  const hemi = new THREE.HemisphereLight(0xdff1ff, 0xc8a383, 0.8)
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.1)
  sun.position.set(9, 14, 7)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 45
  const sc = sun.shadow.camera as THREE.OrthographicCamera
  sc.left = -12
  sc.right = 12
  sc.top = 12
  sc.bottom = -12
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.02
  const rim = new THREE.DirectionalLight(0xffc28a, 0.9)
  rim.position.set(-10, 5, -9)
  const glow: THREE.PointLight[] = []
  islands.forEach((isl) => {
    const pl = new THREE.PointLight(0xffa64d, 0, 3.2)
    pl.position.set(0, 0.6, 0.6)
    isl.group.add(pl)
    glow.push(pl)
  })

  const dispose = () => {
    root.traverse((o) => {
      const any = o as THREE.Mesh
      if (any.geometry) any.geometry.dispose()
      const mm = any.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mm)) mm.forEach((x) => x.dispose())
      else mm?.dispose()
    })
  }

  return {
    root,
    islands,
    clouds,
    motes,
    lights: { ambient, hemi, sun, rim, glow },
    glassMaterial: m.glass,
    helix: extras.helix,
    turbine: extras.turbine,
    beacon: extras.beacon,
    dispose,
  }
}

/* ---------------------------- lighting presets ---------------------------- */

export const LIGHTING: Record<
  LightingMode,
  {
    ambient: [number, number]
    hemi: [number, number, number]
    sun: [number, number, [number, number, number]]
    rim: [number, number]
    glow: number
    glass: number
    fog: number
    exposure: number
  }
> = {
  day: {
    ambient: [0xfff4e6, 0.75],
    hemi: [0xdff1ff, 0xc8a383, 0.85],
    sun: [0xfff0d6, 2.1, [9, 14, 7]],
    rim: [0xffc28a, 0.8],
    glow: 0,
    glass: 0.25,
    fog: 0xe9e4da,
    exposure: 1.05,
  },
  sunset: {
    ambient: [0xffc9a8, 0.55],
    hemi: [0xffb08a, 0x6b4a3a, 0.7],
    sun: [0xff8a4c, 2.6, [12, 5, 4]],
    rim: [0xff6f61, 1.4],
    glow: 1.4,
    glass: 0.9,
    fog: 0xf0c5a8,
    exposure: 1.1,
  },
  night: {
    ambient: [0x5a6a90, 0.35],
    hemi: [0x4a5f8f, 0x141a26, 0.5],
    sun: [0xa8b8ff, 0.7, [-7, 10, -6]],
    rim: [0x6aa8ff, 1.2],
    glow: 3.2,
    glass: 2.2,
    fog: 0x16213a,
    exposure: 1.2,
  },
}
