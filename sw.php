<?php header('Content-Type: text/javascript'); require_once('config.php') ?>
const APP_NAME = '<?=$globalAppName?>', VERSION = '<?=$appVersion?>';
const CACHE_NAME = `cache-${APP_NAME}-${VERSION}`;
const StreamHeaders = { 'text/event-stream': true, 'application/x-ndjson': true };
addEventListener('install', async e => {
    skipWaiting(); const staticAssets = ['./', './lib', './ortak', './app', './images'];
    const cache = await caches.open(CACHE_NAME); for (const url of staticAssets) { try { cache.add(url) } catch (ex) { } }
	self.skipWaiting()
});
addEventListener('activate', evt => { clients.claim() });
addEventListener('fetch', evt => {
    const req = evt.request, {url, referrer} = req; /*if (!referrer || req.url.startsWith(new URL(referrer).origin))*/
	const {headers} = req ?? {}, upgradeHeader = headers?.get?.('Upgrade'), method = req.method?.toUpperCase();
	/*if (method == 'GET' && !StreamHeaders[headers?.get('Content-Type')] ) { return }*/
	if (!(referrer && url.startsWith(new URL(referrer).origin))) { return }
	if (method != 'GET' || StreamHeaders[headers?.get('Content-Type')] || upgradeHeader == 'websocket') { return }
	if (url.includes('ws/skyMES')) { return }
	const resp = handleFetchFromNetwork(req); evt.respondWith(resp)
});
addEventListener('push', evt => {
    const data = evt.data?.json() ?? {}, {title, icon} = data, body = data.text ?? data.body;
    console.warn('sw push notification: ', data);
    evt.waitUntil(registration.showNotification(title, { body, icon }))
});
addEventListener('notificationclick', evt => {
    const {data, notification} = evt; notification.close();
    const fullPath = location.origin + data.path; clients.openWindow(fullPath)
});
async function handleFetchFromNetwork(req) {
	const cache = await caches.open(CACHE_NAME);
	try {
		const resp = await fetch(req);
		try { await cache.put(req, await resp.clone()) } catch (ex) { }
		return resp
	}
	catch (ex) {
		const cachedResponse = await cache.match(req); if (!cachedResponse) { throw ex }
		return cachedResponse
	}
}
async function handleFetchFromCache(req) { const cache = await caches.open(CACHE_NAME), cachedResponse = await cache.match(req); return cachedResponse || await handleFetchFromNetwork(req) }
