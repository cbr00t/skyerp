class MiscApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	constructor(e) { e = e || {}; super(e) } async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); $.extend(e.params, { localData: MQLocalData.getInstance(), misc: MQParam_Misc.getInstance() }) }
	async afterRun(e) {
		await super.afterRun(e)
		if (!config.dev)
			this.divMenu?.hide()
	}
	navBarDuzenle(e) {
		if (config.dev)
			return super.navBarDuzenle(e)
		let {mainNav} = this
		new FRMenu().navLayoutOlustur({ parent: mainNav })
	}
	async getAnaMenu(e) {
		const {noMenuFlag, params} = this; if (noMenuFlag) { return new FRMenu() } let items = [];
		const addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls =>
				new FRMenuChoice({
					mne: cls.kodListeTipi || cls.partName, text: cls.sinifAdi,
					block: e => cls.listeEkraniAc ? cls.listeEkraniAc(e) : new cls(e).run()
				})
			);
			let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
			return menuItems
		};
		addMenuSubItems('HESNA', 'Hesna', [...MQHesnaStok.subClasses]);
		addMenuSubItems('UTILS', 'Utils', [MQFirewall]);
		// addMenuSubItems('AI', 'AI Training', [AITraining01Part]);
		return new FRMenu({ items })
	}
	wsX(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'testBilgi', args }) }) }
	wsY(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, url: this.getWSUrl({ api: 'testSonucKaydet', args }), data })
	}

	/*// --- Performance Estimator (cbr00t sürümü) ---
	const cfg = { base: 200, kdWeight: 15, kpmWeight: 20, idlePenaltyPer10pct: 7.5 }    // katsayılar
	// kills, deaths, minutes, idlePct(%) alır → KD, KPM, Perf döner
	function calcPerf({ kills, deaths, minutes, idlePct = 0 }) {
	  // safety      if (!minutes || minutes <= 0) { minutes = 1 }
	  // KD          const kd  = deaths > 0 ? kills / deaths : kills
	  // KPM         const kpm = kills / minutes
	  // ham puan    const raw = cfg.base + cfg.kdWeight * kd + cfg.kpmWeight * kpm
	  // idle cezası (isteğe bağlı)  const penalty = cfg.idlePenaltyPer10pct * (idlePct / 10)
	  // sonuç        const perf = raw - penalty
	  return { kd, kpm, perf }
	}
	// Örnek kullanım (dakika sürelerini sen gir):
	//   - Dün 114/3  → minutes=? (Az‑Orta tempo)
	//   - Bugün 103/21 → minutes=? (Çok tempo)
	//   - Bugün 36/5   → minutes=? (Çok tempo)
	// console.log(calcPerf({ kills: 114, deaths: 3,  minutes:  ? , idlePct: 0 }))  // ≈ 316–320 hedef bandı
	// console.log(calcPerf({ kills: 103, deaths: 21, minutes:  ? , idlePct: 0 }))  // ≈ 321–323 hedef bandı
	// console.log(calcPerf({ kills: 36,  deaths: 5,  minutes:  ? , idlePct: 0 }))  // ≈ 338–342 hedef bandı
	
	// İnce ayar rehberi:
	//   - Perf düşük çıkıyorsa ama tempolu oynuyorsan → kpmWeight ↑ (örn. 22–24)
	//   - Perf fazla KD’yi ödüllüyorsa → kdWeight ↓ (örn. 12–14)
	//   - Idle yüzdesi belirgin ise → idlePenaltyPer10pct ↑ (örn. 10)
	*/
}
