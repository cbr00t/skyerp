class TabSayimFis extends TabStokFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SAYIM' } static get sinifAdi() { return 'Sayım' }
	// static get onlineFisSinif() { return StokSayimFis }
	static get sayimmi() { return true }
}
class TabTransferFis extends TabStokFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TRF' } static get sinifAdi() { return 'Transfer' }
	static get onlineFisSinif() { return StokTransferFis }
	static get transfermi() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { refYerKod: new PInstStr('refyerkod') })
	}
	async dataDuzgunmuDuzenle({ eskiInst: eskiFis, parentPart, gridPart, result }) {
		let {refYerKod} = this
		if (refYerKod && !await MQTabYer.kodVarmi(refYerKod))
			result.push(`<b>Ref.Yer (Depo) [<span class=firebrick>${refYerKod}</span>]</b> hatalıdır`)
		return await super.dataDuzgunmuDuzenle(...arguments)
	}
	refYerDegisti({ oldValue = this._prev.refYerKod, value = this.refYerKod }) {
		this._prev.refYerKod = value
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb }) {
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(e)
		{
			let mfSinif = MQTabYer, {sinifAdi: etiket} = mfSinif
			etiket = `Ref. ${etiket}`
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('refYerKod', etiket, etiket)
				.etiketGosterim_yok()
				// .addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type != 'batch')
						return
					let _e = { type, events, ...rest, oldValue: fis.refYerKod, value: events.at(-1).value?.trimEnd() }
					setTimeout(() => fis.refYerDegisti({ ...e, ..._e, tanimPart }), 5)
				})
				.onAfterRun(({ builder: { part } }) =>
					tanimPart.ddRefYer = part)
		}
	}
}
class TabTransferSiparisFis extends TabTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TRFS' } static get sinifAdi() { return 'Transfer Sipariş' }
	static get onlineFisSinif() { return StokTransferSiparisFis }
	static get siparismi() { return true }
}
class TabIrsaliyeliTransferFis extends TabTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TRFI' } static get sinifAdi() { return 'İrsaliyeli Transfer' }
	static get onlineFisSinif() { return IrsaliyeliTransferFis }
	static get irsaliyemi() { return true }
}
