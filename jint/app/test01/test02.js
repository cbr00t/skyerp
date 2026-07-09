const AppRoot = `app/test01`
importLibs(`${AppRoot}/test02-classes`)

extend(app.__proto__, {
	async run() {
		// console.log(self.test())
		console.warn('app run')
		//console.info(new MQCogul)
		//console.info(new CBasiSonu({ basi: 10 }).toString())
	}
})
app.ws = new WS()

