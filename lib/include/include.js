(function() {
	if (!window.$) {
		(async () => {
			let script = document.createElement('SCRIPT');
			script.src = `../../../../vio/vioweb/lib_external/jqx/jquery-3.3.1.min.js`;
			script.async = script.defer = false;
			document.head.prepend(script);
			
			while (true) {
				const result = await new Promise(c =>
					setTimeout(() => c(!!window.$), 10));
				if (result)
					break;
			}

			script = document.createElement('SCRIPT');
			script.src = `../../lib/include.js`;
			script.async = script.defer = true;
			document.head.append(script);
		})();
		
		return;
	}
	
	cache = {};
	async function include(recursiveFlag) {
		const elms = $('include');
		let loaded = false, signalCount = 0;
		const signal = () => {
			signalCount++;
			if (loaded && signalCount == elms.length)
				$(() => include(true));
		}
		
		for (let i = 0; i < elms.length; i++) {
			const elm = elms.eq(i);
			const src = elm.attr('src') || elm.text();
			if (!(src && elm[0].parentElement))
				return;

			const cacheData = cache[src];
			setTimeout(async (i, elm, src, cacheData) => {
				try {
					html = await cacheData;
					if (html == null) {
						html = await $.get({
							cache: true, async: true,
							dataType: 'html', url: src
						});
						cache[src] = html;
					}
				}
				catch (ex) { console.error(ex) }
				finally { signal() }

				if (html) {
					if (elm[0].parentElement) {
						if (elm.attr('head') != null)
							$(html).appendTo('head');
						else
							$(html).insertAfter(elm);
						elm.remove();
					}
					loaded = true;
				}
			},
			   0,  /*1 * (i + 1),*/
			   i, elm, src, cacheData
			);
			if (cacheData == null && i > 0)
				await new Promise(c => setTimeout(c, 50));
		}
	}
	
	$(() => include())
})()
