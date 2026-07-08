(async () => {
	/*const libs = [
		'./lib/ortak/utils.js',
		'./classes/ortak/CObject.js',
		'./classes/ortak/CKodVeAdi.js',
		'./classes/ortak/basitSiniflar.js'
	]
	await Promise.all(
		libs.map(l => import(l)))
	*/

	self.myFunc = async function myFunc(e) {
		//debugger
		callback('callback test')
		await delay(500)
		callback('callback test 2')
		delay(1000).then(() =>
			callback('defer callback test 3'))
		console.info('deneme')
		return new CBasiSonu({ basi: 1, sonu: 3 })
	}
})()
