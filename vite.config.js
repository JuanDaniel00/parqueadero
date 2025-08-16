import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar(),
  ],
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
});
