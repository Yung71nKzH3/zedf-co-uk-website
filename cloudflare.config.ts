import { bindings, defineConfig, defineWorker, exports } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "zedf-co-uk-website",
    entrypoint: "worker/index.ts",
    compatibilityDate: "2026-11-16",
    assets: {
      notFoundHandling: "none",
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      DB: bindings.d1({ id: "0810933c-0501-4171-a64a-39c00f0f0131" }),
      ROOMS: bindings.durableObject({
        worker: "zedf-co-uk-website",
        exportName: "RoomDurableObject",
      }),
    },
    exports: {
      RoomDurableObject: exports.durableObject({
        storage: "sqlite",
      }),
    },
  }),
});
