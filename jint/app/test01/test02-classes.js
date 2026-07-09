class WS {
	async handleReq({ ctx, ws }) {
		let { WSPath: path } = ws
		let { RemoteIP: ip } = ctx
		let tip = makeArray(path).at(-1)
		switch (tip) {
			case 'x': {
				console.debug('handle req from:', ip)
				return { result: 'ok' }
			}
		}
		return null
	}
}
