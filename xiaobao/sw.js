"use strict";

const scope = new URL(self.registration.scope);
const prefix = `xiaobao-playgarden:${scope.pathname}:`;
const cacheName = `${prefix}family-field-v8`;
const files = ["./index.html", "./manifest.webmanifest", "./sound-sources.html",
  "./voice/welcome.mp3", "./voice/depart.mp3", "./voice/driver.mp3", "./voice/approach.mp3", "./voice/arrive.mp3", "./voice/doors.mp3", "./voice/grandma.mp3", "./voice/nana.mp3", "./voice/dad.mp3", "./voice/send.mp3", "./voice/together.mp3", "./voice/baby.mp3", "./voice/beijingTrip.mp3", "./voice/houmaTrip.mp3", "./voice/beijingEnd.mp3", "./voice/houmaEnd.mp3", "./voice/horn.mp3", "./voice/open.mp3", "./voice/close.mp3", "./voice/trainReal.mp3", "./voice/metro.mp3", "./voice/bus.mp3", "./voice/pass.mp3", "./voice/parents.mp3", "./voice/grands.mp3", "./voice/team.mp3", "./voice/grandpa.mp3", "./voice/outbound.mp3", "./voice/quiet.mp3", "./voice/shanghaiTrip.mp3", "./voice/shanghaiEnd.mp3", "./voice/garden.mp3", "./voice/journey.mp3", "./voice/pickGrandma.mp3", "./voice/pickNana.mp3", "./voice/pickDad.mp3", "./voice/pickGrandpa.mp3", "./voice/pickTeam.mp3", "./voice/pickSend.mp3", "./voice/pickParents.mp3", "./voice/pickGrands.mp3", "./voice/pickOutbound.mp3", "./voice/pickBaby.mp3", "./voice/pickTogether.mp3", "./voice/hello.mp3", "./voice/softHello.mp3", "./voice/softTurn.mp3", "./voice/softThanks.mp3", "./voice/softAgain.mp3", "./voice/softBye.mp3", "./voice/brightHello.mp3", "./voice/brightTurn.mp3", "./voice/brightThanks.mp3", "./voice/brightAgain.mp3", "./voice/brightBye.mp3", "./voice/steadyHello.mp3", "./voice/steadyTurn.mp3", "./voice/steadyThanks.mp3", "./voice/steadyAgain.mp3", "./voice/steadyBye.mp3"];
const resources = new Set(files.map(file => new URL(file, scope).href));
const page = new URL("./index.html", scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...resources].map(url => new Request(url, { cache: "reload" })));
    await self.skipWaiting();
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
    const hit = await cache.match(isMainPage ? page : url.href);
    if (!hit) return fetch(request);
    const range = request.headers.get("Range");
    if (!range || !url.pathname.endsWith(".mp3")) return hit;
    // Safari may probe with bytes=0-1 before asking for the rest of a clip.
    const bytes = await hit.arrayBuffer();
    const size = bytes.byteLength;
    const match = /^bytes=(\d*)-(\d*)$/i.exec(range);
    if (!match || !(match[1] || match[2])) return hit;
    const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
    }
    return new Response(bytes.slice(start, end + 1), { status: 206, headers: {
      "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1)
    } });
  })());
});
