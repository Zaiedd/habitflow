import { httpServerHandler } from "cloudflare:node";
import { createApp } from "./dist/app.factory.js";

let handlerPromise;

async function getHandler() {
  handlerPromise ??= (async () => {
    const app = await createApp();
    const server = app.getHttpServer();
    return httpServerHandler(server).fetch;
  })();
  return handlerPromise;
}

export default {
  async fetch(request, env, ctx) {
    for (const [key, value] of Object.entries(env ?? {})) {
      if (typeof value === "string") {
        process.env[key] ??= value;
      }
    }
    const handler = await getHandler();
    return handler(request, env, ctx);
  },
};
