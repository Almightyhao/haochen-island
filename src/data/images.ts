/* -------------------------------------------------------------------------- */
/*  Every illustration on the site was generated with Higgsfield (Z Image).   */
/*  `npm run images` (run automatically before dev/build) downloads them      */
/*  from Higgsfield's CDN into public/images/ and converts them to WebP.      */
/*  Commit public/images/ so the site never depends on the CDN.               */
/* -------------------------------------------------------------------------- */

export const HIGGSFIELD_CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3J8T9ggpWGZhYJ0gtQ93QjiNYjb/"

export const generatedImages = {
  archipelago: "hf_20261124_154522_ad99e8c3-ec09-4013-8fd1-7385d5c13c32.png",
  "island-pharmacy": "hf_20261124_154715_d451a109-1523-470f-aa63-7300608d58c4.png",
  "island-lab": "hf_20261124_154716_fff7fc22-af14-4ca5-a177-4833fbf1c784.png",
  "island-observatory": "hf_20261124_154803_8bf80428-42ac-4140-82fd-13f086ca9b46.png",
  "island-harbor": "hf_20261124_154634_2476773c-9249-442e-a666-690a036677cb.png",
  "island-workshop": "hf_20261124_154858_02bf3e07-cb94-4998-be70-f8a70a159385.png",
  "island-lighthouse": "hf_20261124_154958_ef33435c-0e57-4461-bfec-92d69be2cc91.png",
  sunset: "hf_20261124_154634_05844e2b-fe1e-4b9d-a7dc-2e521ff05014.png",
} as const

export type ImageKey = keyof typeof generatedImages

/** URL of a generated image, relative to the site root (works on GitHub Pages sub-paths). */
export function img(key: ImageKey) {
  return `${import.meta.env.BASE_URL}images/${key}.webp`
}

/** URL of one of your own photos in public/photos/. */
export function photo(path: string) {
  return `${import.meta.env.BASE_URL}${path.split("/").map(encodeURIComponent).join("/")}`
}
