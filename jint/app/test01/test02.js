async function run() {
	ctx.HandleReq = handleReq
}

async function handleReq(req) {
	let { RemoteIP: ip } = req
	console.debug('handle req from:', ip)
}
