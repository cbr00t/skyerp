class MQYerelParam extends MQYerelParamTicari {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('lastSession')
	}
	yukleSonrasi(e) {
		super.yukleSonrasi(e)
		let  { session } = config
		if (session?.user) {
			this.lastSession = session
			this.kaydetDefer()
		}
	}
}
