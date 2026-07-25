class DRapor_AIEngine {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	async process({ actions }) {
		let queue = [...actions]
		let e = { ...arguments[0], actions }
			while (!empty(queue)) {
				extend(e, { action: queue.shift(), requiredSubPrompt: null })
				let selector = this.findSelector(e)
				if (!selector)
					continue
				let res = e.result = await this.processAction(e)
				if (!res)
					continue
				let { requiredSubPrompt: prompt } = e
				if (prompt) {
					e.prompt = prompt
					queue.unshift( await this.getAction({ e }) )
				}
				await this.processResult(e)
			}
	}
	async processAction({ action }) {
		let { cmd, args } = action
		switch (cmd) {
			case 'create_report':
				return await this.processAction_createReport(e)
		}
		return false
	}
	async processAction_createReport(e) {
		let { action } = e, { args } = action
		let { menuId, reportClass: cls, def } = args
		cls = cls
			? getFunc(cls)                                               // 'ClassName' -> eval(str) -> ClassName
			: app.frMenu.id2Item[menuId] ?? this.findMenuById(menuId)    // TICARI-SATISHAR veya SATISHAR
		
		let rapor = new cls()
		let { main } = rapor
		if (def && main) {
			let { raporTanim, secimler } = main
			let { raporAdi: aciklama, grup, icerik, ozetMaxSayi, filtreKaydedilir: filtreKaydedilirmi, temp } = def
			let tan = main.raporTanim ??= new DMQRapor()
			extend(tan, { aciklama, grup, icerik, ozetMaxSayi, filtreKaydedilirmi })
			for (let [key, sd] of entries( defs.secimler ?? {} )) {
				let sec = secimler[key]
				sec?.readFrom(sd)
			}
			if (!temp)
				await tan.kaydet()
			
			let ({ part }) = await rapor.raporGoster() ?? {} part?.tazele?.()
			return !!part
		}
	}
}
