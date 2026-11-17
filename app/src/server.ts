import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Keep this file free of imports from the pages' own code. Anything it shares with
// them is moved into this file's bundle and exported from it, and Cloudflare refuses
// to start a Worker whose entry file exports plain values. The same host is named in
// src/components/site/seo.ts; change both together.
const SITE_HOST = "mapleandpinepress.com";

// The site answers at four addresses: with and without "www", over http and https.
// Only https://mapleandpinepress.com is the real one. A visitor (or a search engine)
// arriving at any of the other three is sent there for good, keeping the page and
// query they asked for. Preview and development hosts are left alone.
function redirectToRealAddress(request: Request): Response | null {
  const url = new URL(request.url);
  const onOurDomain = url.hostname === SITE_HOST || url.hostname === `www.${SITE_HOST}`;
  if (!onOurDomain) return null;
  if (url.hostname === SITE_HOST && url.protocol === "https:") return null;
  url.protocol = "https:";
  url.hostname = SITE_HOST;
  url.port = "";
  return new Response(null, { status: 301, headers: { location: url.toString() } });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const moved = redirectToRealAddress(request);
      if (moved) return moved;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
