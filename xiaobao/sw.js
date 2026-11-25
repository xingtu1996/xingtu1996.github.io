"use strict";

const scope = new URL(self.registration.scope);
const prefix = `xiaobao-playgarden:${scope.pathname}:`;
const cacheName = `${prefix}v5`;
const files = ["./index.html", "./manifest.webmanifest"];
const resources = new Set(files.map(file => new URL(file, scope).href));
const page = new URL("./index.html", scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...resources].map(url => new Request(url, { cache: "reload" })));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isMainPage = request.mode === "navigate" && (url.pathname === scope.pathname || url.pathname === new URL(page).pathname);
  if (url.origin !== scope.origin || (!isMainPage && !resources.has(url.href))) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(isMainPage ? page : request)) || fetch(request);
  })());
});
