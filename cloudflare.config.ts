import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersResponseStoreServiceBindingConfig } from "@vinext/cloudflare/cache/config";

const responseStore = await createWorkersResponseStoreServiceBindingConfig({
  worker: {
    name: "ai-studio-applet-response-store",
    compatibilityDate: "2026-11-16",
  },
  bucket: "ai-studio-applet-response-store-cache-bodies",
});

export const responseStoreServiceBinding = responseStore.serviceBindingWorker;

export default defineConfig({
  worker: defineWorker({
    ...responseStore.applicationWorker,
    name: "ai-studio-applet",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-16",
    assets: {
      notFoundHandling: "none",
    },
    env: {
      ...responseStore.applicationWorker.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
  }),
});
