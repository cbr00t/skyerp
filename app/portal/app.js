class PortalApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get configParamSinif() { return MQYerelParamConfig_App }
	get yerelParamSinif() { return MQYerelParam }
	get dataKey() { return 'portal' }
	get defaultWSPath() { return 'ws/vioPortal' }
	get defaultLoginTipi() { return 'bayiLogin' }
	get autoExecMenuId() { return null }

	constructor(e) {
		super(e)
		extend(this, {
			defaultSurum: '417',
			dbNames: {
				skylog: 'YI26SKYLOGFAT',
				polen: 'YI26POLENFAT'
			}
		})
	}
	loginTipleriDuzenle({ loginTipleri }) {
		/* super yok */
		loginTipleri.push(...[
			{ kod: 'login', aciklama: 'Yönetici' },
			{ kod: 'bayiLogin', aciklama: 'Bayi' },
			{ kod: 'musteriLogin', aciklama: 'Müşteri' }
		])
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
	}
	async paramsDuzenleSonrasi(e) {
		await super.paramsDuzenleSonrasi(e)
		let { params } = this
		;{
			let { ticariGenel: par } = params
			let { kullanim: kull } = par
			if (!kull.eFatura) {
				kull.eFatura = true
				par.kaydet()
			}
		}
	}
	async afterRun(e) {
		let { loginTipi, user: kod } = config.session
		;{
			let l = MQLogin.current = MQLogin.newFor({ loginTipi, kod })
			await l?.yukle()
		}
		await super.afterRun(e)
	}
	async anaMenuOlustur(e) {
		await this.promise_ready
		let eksikParamIsimleri = []
		if (eksikParamIsimleri.length) {
			this.noMenuFlag = true
			let paramIsimleriGosterim = eksikParamIsimleri
				.map(x => `<span class="bold firebrick">${x}</span>`)
				.join(' VE ')
			let wnd = createJQXWindow({
				content: (
					`<div>${paramIsimleriGosterim} parametreleri</div>
					<div>Vio Ticari Program &gt; <span class="bold royalblue">Ticari ?? Parametreleri</span> kısmından açılmalıdır.</div><p/>
					<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel Ticari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
				),
				title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
				args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
				// buttons: { TAMAM: e => e.close() }
			})
			wnd.css('font-size', '130%')
			wnd.find('div > .jqx-window-header')
					.addClass('bg-darkred')
		}
		await super.anaMenuOlustur(e)
	}
	getAnaMenu(e) {
		if (this.noMenuFlag)
			return new FRMenu()
		
		let { current: login } = MQLogin
		let { adminmi, bayimi } = login
		let items = [
			(adminmi || bayimi ? new FRMenuCascade({
				mne: 'TAN', text: 'Tanımlar', items: (
					[MQLogin_Admin, MQLogin_Bayi, MQVPAnaBayi, MQVPAltMusteri]
						.filter(cls => cls.uygunmu)
						.map(cls => {
							let { kodListeTipi: mne, sinifAdi: text } = cls
							return new FRMenuChoice({
								mne, text,
								block: e =>
									cls.listeEkraniAc(e)
							})
						})
				)
			}) : null),
			...[MQLogin_Musteri, MQAktivasyon]
				.filter(cls => cls.uygunmu != false)
				.map(cls => {
					let { kodListeTipi: mne, sinifAdi: text } = cls
					return new FRMenuChoice({
						mne, text,
						block: e =>
							cls.listeEkraniAc(e)
					})
				}),
			new FRMenuCascade({
				mne: 'KHA', text: 'Kontör<br/><b class=royalblue>Hareketler</b>',
				items: (
					[MQKontorHareket, ...MQKontorHareket.subClasses]
						.filter(cls => cls.uygunmu != false).map(cls => {
							let { kodListeTipi: mne, sinifAdi: text } = cls
							return new FRMenuChoice({
								mne, text,
								block: e =>
									cls.listeEkraniAc(e)
							})
						})
				)
			}),
			new FRMenuCascade({
				mne: 'KMD', text: 'Kontör<br/><b class=forestgreen>Müşteri Durumu</b>',
				items: (
					[MQKontor, ...MQKontor.kaListe.map(ka => ka.ekBilgi)].map(cls => {
						let { kodListeTipi: mne, sinifAdi: text } = cls
						return new FRMenuChoice({
							mne, text,
							block: e =>
								cls.listeEkraniAc(e)
						})
					})
				)
			}),
			(
				config.dev && adminmi
				? new FRMenuChoice({
					 mne: 'TURMOB_IMPORT', text: 'Turmob Kayıtlarını İçeri Al',
					 block: e => MQKontor_Turmob.importRecordsIstendi(e)
				})
				: null
			)
		].filter(Boolean)
		
		return new FRMenu({ items })
	}
	onMuhDBDo_skylog(block) { return this.onMuhDBDo(this.dbNames.skylog, block) }
	onMuhDBDo_polen(block) { return this.onMuhDBDo(this.dbNames.polen, block) }
	onMuhDBDo(dbName, block) { return this.setCurrentDBAndDo(dbName, '(local)\\SKYLOG', block) }
}
