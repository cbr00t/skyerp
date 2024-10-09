<?php header('Content-Type: text/javascript'); require_once('config.php') ?>
const APP_NAME = '<?=$globalAppName?>', VERSION = '<?=$appVersion?>';
const CACHE_NAME = `cache-${APP_NAME}-${VERSION}`, StreamHeaders = { 'text/event-stream': true, 'application/x-ndjson': true };
addEventListener('install', async e => {
    skipWaiting(); const staticAssets = ['./', './lib', './ortak', './app', './images'];
    const cache = await caches.open(CACHE_NAME); for (const url of staticAssets) { try { cache.add(url) } catch (ex) { } }
});
addEventListener('activate', evt => { /*clients.claim()*/ });
addEventListener('fetch', evt => {
    const req = evt.request;
    /*if (!req.referrer || req.url.startsWith(new URL(evt.referrer).origin))*/
    evt.respondWith(handleFetchFromNetwork(req))
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
		if (req.method == 'GET' && !StreamHeaders[req.headers?.get('Content-Type')]) { try { await cache.put(req, await resp.clone()) } catch (ex) { } }
		return resp
	} catch (ex) { const cachedResponse = await cache.match(req); if (!cachedResponse) { throw ex } return cachedResponse }
}
async function handleFetchFromCache(req) { const cache = await caches.open(CACHE_NAME), cachedResponse = await cache.match(req); return cachedResponse || await handleFetchFromNetwork(req) }
