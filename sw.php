<?php
	header('Content-Type: text/javascript');
	require_once('config.php');
?>
const APP_NAME = '<?=$globalAppName?>';
const VERSION = '<?=$appVersion?>';
const CACHE_NAME = `cache-${APP_NAME}-${VERSION}`;

const staticAssets = [
	'./',
	'../',
	'../../',
	'../../lib'
];

self.addEventListener('install', async e => {
	const cache = await caches.open(CACHE_NAME); 
	for (const i in staticAssets) {
		const url = staticAssets[i];
		try { await cache.add(url) }
		catch (ex) { }
	}
	self.skipWaiting();
	/*setTimeout(() =>
		self.skipWaiting(),
		1000);*/
});

self.addEventListener('activate', async e => {
	self.clients.claim();
	/*e.waitUntil(self.clients.claim());*/
});

self.addEventListener('fetch', e => {
	const req = e.request;
	//if (!req.referrer || req.url.startsWith(new URL(e.referrer).origin))
	e.respondWith(networkFirst(req));
	
	/*if (/.*(json)$/.test(req.url) || !req.url.startsWith(location.origin) ||
		/(layout)$/.test(req.url)) {
		e.respondWith(networkFirst(req));
	} else {
		e.respondWith(cacheFirst(req));
	}*/
});

self.addEventListener('push', e => {
	console.warn('sw push notification: ' + e.data.text());
});


async function networkFirst(req) {
	const cache = await caches.open(CACHE_NAME);
	try { 
		const fresh = await fetch(req);
		if (req.method == 'GET') {
			try { await cache.put(req, await fresh.clone()) }
			catch (ex) { }
		}

		return fresh;
	} catch (ex) { 
		const cachedResponse = await cache.match(req);
		if (!cachedResponse)
			throw ex;
		return cachedResponse;
	}
}

async function cacheFirst(req) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(req);
	
	return cachedResponse || await networkFirst(req);
}
