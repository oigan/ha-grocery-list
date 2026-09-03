import { build } from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(
  root,
  "custom_components/auchan_grocery/frontend"
);
const vendor = resolve(output, "vendor");
const fonts = resolve(output, "fonts");
const images = resolve(output, "images");
const licenses = resolve(output, "licenses");

async function copyTextNormalized(source, destination) {
  const contents = await readFile(source, "utf8");
  await writeFile(
    destination,
    contents.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, ""),
    "utf8"
  );
}

await mkdir(vendor, { recursive: true });
await mkdir(fonts, { recursive: true });
await mkdir(images, { recursive: true });
await mkdir(licenses, { recursive: true });

await build({
  entryPoints: [resolve(root, "www/auchan-grocery/auchan-panel.js")],
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  outfile: resolve(output, "auchan-panel.js"),
  legalComments: "eof",
});

await copyTextNormalized(
  resolve(root, "node_modules/leaflet/dist/leaflet.css"),
  resolve(vendor, "leaflet.css")
);
await cp(
  resolve(root, "node_modules/leaflet/dist/leaflet.js"),
  resolve(vendor, "leaflet.js")
);
await cp(
  resolve(root, "node_modules/leaflet/dist/images"),
  resolve(vendor, "images"),
  { recursive: true }
);
await cp(
  resolve(root, "node_modules/qrcodejs/qrcode.min.js"),
  resolve(vendor, "qrcode.min.js")
);
await cp(
  resolve(root, "www/auchan-grocery/assets/auchan-marker.svg"),
  resolve(images, "auchan-marker.svg")
);
for (const [dependency, filename] of [
  ["leaflet", "leaflet-LICENSE"],
  ["qrcodejs", "qrcodejs-LICENSE"],
  ["@fontsource/source-sans-3", "source-sans-3-OFL"],
  ["@fontsource/barlow-condensed", "barlow-condensed-OFL"],
]) {
  await copyTextNormalized(
    resolve(root, "node_modules", dependency, "LICENSE"),
    resolve(licenses, filename)
  );
}
await cp(
  resolve(
    root,
    "node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-ext-700-normal.woff2"
  ),
  resolve(fonts, "barlow-condensed-700.woff2")
);
for (const weight of [400, 600, 700]) {
  await cp(
    resolve(
      root,
      `node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-ext-${weight}-normal.woff2`
    ),
    resolve(fonts, `source-sans-3-${weight}.woff2`)
  );
}
