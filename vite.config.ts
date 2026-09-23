import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig({
  // ponytail: dev-only. lucide-react ships thousands of ESM icon modules that
  // Vite transforms one-by-one on cold start (see lucide#2583); excluding it
  // from pre-bundling follows Vite's own rsc:use-client warning and cuts
  // first-load compile time. No effect on production builds.
  optimizeDeps: { exclude: ["lucide-react"] },
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
