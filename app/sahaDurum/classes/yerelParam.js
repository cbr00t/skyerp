class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('lastSession') }
	yukleSonrasi(e) {
		super.yukleSonrasi(e); const {session} = config;
		if (session?.user) { this.lastSession = session; setTimeout(() => this.kaydet(), 100) }
	}
}
