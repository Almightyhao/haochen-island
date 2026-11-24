# 浩宸群島 · Hao's Archipelago

Personal site of **曾浩宸 Hao Chen Tseng** — an interactive 3D archipelago where every island is a chapter
(About, Research, Skills, Pharmacy, Field notes, Projects, Credentials).

- **Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4, shadcn project structure (`components.json`, `@/` alias, `src/components/ui`, `src/lib/utils.ts`)
- **3D:** Three.js, procedural low-poly islands (`src/components/ui/island-scene.ts`) and the interactive hero (`src/components/ui/island-hero.tsx`)
- **Illustrations:** all generated with Higgsfield (listed in `src/data/images.ts`)
- **Copy:** everything you'd want to edit is in `src/data/site.ts`

## Run it locally

```bash
npm install
npm run dev      # first run downloads the Higgsfield illustrations into public/images/
```

Open the URL Vite prints (usually http://localhost:5173).

## Add your own photos

Copy your portrait, poster photos and certificate scans into `public/photos/` — see `public/photos/README.md` for the exact file names.
Missing photos show as tidy text cards, so you can publish before adding them.

## Publish on GitHub Pages

1. Create a new repository on GitHub (e.g. `haochen-island`, or `Almightyhao.github.io` to serve it at the root).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Hao's Archipelago"
   git branch -M main
   git remote add origin https://github.com/Almightyhao/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
4. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push. The site appears at
   `https://almightyhao.github.io/<repo-name>/`.

**Tip:** after your first `npm run dev`, commit `public/images/` too. Then the site no longer depends on Higgsfield's CDN.

## Why `src/components/ui`?

shadcn's CLI installs components into `@/components/ui` (configured in `components.json`). Keeping custom UI there too means
`npx shadcn@latest add <component>` drops new components next to yours and every import uses the same `@/components/ui/...` path.

## Credits

3D hero architecture adapted from the 21st.dev *RealEstate3DHero* component (orbit camera, projected hotspots, lighting presets),
rebuilt as a multi-island scene, with performance fixes (scene built once, no per-frame React re-renders, resource disposal, off-screen pause).
