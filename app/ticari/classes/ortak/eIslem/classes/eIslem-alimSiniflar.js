class EAlimTicariyeDonusturucu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		const eYonetici = this.eYonetici = e.eYonetici || {};
		$.extend(this, { eConf: e.eConf ?? eYonetici.eConf ?? MQEConf.instance, eIslSinif: e.eIslSinif ?? eYonetici.eIslSinif, rec: e.rec, eFis: e.eFis, title: 'Alım Fişi İçeri Alımı' })
	}
	async fisGirisiYap(e) {
		const {rec} = this, {result} = e, irsaliyemi = (rec.efayrimtipi ?? rec.efbelge) == 'IR', ayrimTipi = (rec.ayrimtipi || '').trim(), iademi = !!rec.iade;
		const fisSinif = FisAyrimTipiBasit.gelenFisSinifFor({ irsaliyemi, iademi, ayrimTipi });
		if (!fisSinif) { $.extend(result, { isError: true, message: 'Fiş Sınıfı belirlenemedi' }); return result }
		const efDonusumler = await this.getEFDonusumBilgileri(), yerRec = await MQStokYer.getVarsayilanYerRec();
		rec.noYil = rec.noYil ?? app.params.zorunlu.cariYil; rec.fisNo = rec.no; delete rec.no;
		const eBilgi = { rec, efDonusumler, yerRec, gridKontrolcuSinif: EIslAlimGridKontrolcu };
		const fis = new fisSinif({ eBilgi }); await fis?.eBilgiIcinDetaylariYukle(e); let promise_fis = new $.Deferred();
		await fis.tanimla({
			islem: 'yeni',
			kaydedince: e => { result.message = 'Fiş kaydedildi'; promise_fis.resolve(true); fis._kaydedildimi = true },
			kapaninca: e => { if (!fis._kaydedildimi) { $.extend(result, { isError: true, message: 'İşlem iptal edildi' }); promise_fis.resolve(false) } }
		}); await promise_fis; return result
	}
	async belgeKontrol(e) {
		const {rec} = e, irsaliyemi = rec.efbelge == 'IR';
		let sent = new MQSent({
			from: 'piffis', sahalar: ['ayrimtipi'],
			where: [
				{ degerAta: irsaliyemi ? 'I' : 'F', saha: 'piftipi' }, { ticariTSN: TicariSeriliNo.fromText(rec.fisnox), fisAlias: '' },
				{ degerAta: rec.mustkod, saha: 'must' }, { ticariGC: true, fisAlias: '' }			/* 'ayrimtipi' kontrol edilmez */
			]
		});
		const ayrimTipi = await app.sqlExecTekilDeger(sent); return { varmi: ayrimTipi != null, ayrimTipi }
	}
	async getEFDonusumBilgileri() {
		const {rec} = this, fisSayac = rec.fissayac;
		let uni = new MQUnionAll([
			new MQSent({ from: 'efgecicialfatirs', where: { degerAta: fisSayac, saha: 'fissayac'}, sahalar: [`'I' sitip`, 'efirsnobilgi sibilgi'] }),
			new MQSent({ from: 'efgecicialfatsip', where: { degerAta: fisSayac, saha: 'fissayac'}, sahalar: [`'S' sitip`, 'efsipnobilgi sibilgi'] })
		]);
		let stm = new MQStm({ sent: uni, orderBy: ['sitip', 'sibilgi'] }), recs = await app.sqlExecSelect(stm);
		const result = { siparisler: [], irsaliyeler: [] };
		for (const rec of recs) { result[rec.sitip == 'S' ? 'siparisler' : 'irsaliyeler'].push(rec.sibilgi) } return result
	}
	async ekranOlustur_onBilgi(e) {
		const {rec} = this, promise_wnd = this.promise_wnd = new $.Deferred(), parentPart = e.parentPart = e.parentPart ?? app.activeWndPart;
		const rfb = this.rfb = new RootFormBuilder({ parentPart }); rfb.addStyle(e => `$elementCSS > .formBuilder-element { margin-block-end: 0 !important }`)
		let fbd_islemTuslari = rfb.addIslemTuslari({ tip: 'tamamVazgec', id2Handler: { tamam: e => this.tamamIstendi(e), vazgec: e => this.vazgecIstendi(e) } })
			.addStyle(e => `$elementCSS { padding-inline-end: 0 !important }`);
		/*rfb.addBaslik({ etiket: 'ABC' }); const a = rfb.addGroupBox({ etiket: 'ABC' }); a.addTextInput({ etiket: 'a1' }); a.addTextInput({ etiket: 'a2' });*/
		let fbd_eBilgi = rfb.addForm('eBilgi')
			.setLayout(e => {
				return $(
					`<div>
						<div class="row flex-row">
							<div class="tarih item"><span class="etiket">Tarih:</span> <span class="veri">${dateKisaString(rec.tarih)}</span></div>
							<div class="fisNox item"><span class="etiket">Fiş No:</span> <span class="veri">${rec.fisnox}</span></div>
							<div class="efBelge item"><span class="veri">${rec.efbelge == 'IR' ? 'İrsaliye' : 'Fatura'}</span></div>
						</div>
						<div class="row flex-row">
							<div class="item"><span class="etiket">Gönderici:</span> <span class="veri">${rec.efmustunvan}</span></div>
							<div class="item"><span class="etiket">VKN:</span> <span class="veri">${rec.vkno}</span></div>
						</div>
					</div>`
				)
			})
			.onAfterRun(e => makeScrollable(e.builder.layout))
			.addStyle(...[
				e => `$elementCSS { width: calc(var(--full) - 30px) !important; max-height: 150px; padding: 15px 30px; padding-right: 0 !important; border: 1px solid #aaa; overflow-y: auto !important }`,
				e => `$elementCSS .row .item { margin-inline-end: 10px !important; margin-block-end: 5px !important }`,
				e => `$elementCSS .row .item .veri { font-weight: bold }`,
				e => `$elementCSS .row .item.efBelge .veri { color: forestgreen }`
			]);
		let fbd_araIslemTuslari = rfb.addIslemTuslari({
			id: 'araIslemTuslari',
			ekButonlarIlk: [
				{ id: 'vknIcinArastir', text: 'VKN İçin Araştır', handler: e => this.vknIcinArastirIstendi($.extend({}, e, { builder: rfb })) },
				{ id: 'cariListe', text: 'Cari Liste', handler: e => this.cariListeIstendi($.extend({}, e, { builder: rfb })) },
				{ id: 'yeniCari', text: 'VKN İçin Yeni Satıcı', handler: e => this.yeniCariIstendi($.extend({}, e, { builder: rfb })) },
			]
		}).addStyle(...[
			e => `$elementCSS { text-align: center; margin-top: 13px !important }`,
			e => `$elementCSS button { width: ${90 / (e.builder.input.find('button').length)}% !important; height: 60px !important; margin-inline: 5px }`
		]);
		let fbd_ddCari = rfb.addModelKullan({ id: 'cari', mfSinif: MQCari, value: rec.mustkod });
		fbd_ddCari.comboBox().autoBind().etiketGosterim_placeholder().ozelQueryDuzenleBlock(e => {
				const vkn = rec.vkno; if (vkn) {
					const {aliasVeNokta, stm} = e;
					for (const sent of stm.getSentListe()) { sent.where.degerAta(vkn, `(case when ${aliasVeNokta}sahismi = '' then vnumara else tckimlikno end)`)}
				}
			}).onAfterRun(e => this.ddCari = e.builder.part);
		let form = rfb.addFormWithParent({ id: 'footer' }).addStyle(e => {
			const sagWidth = 180; return (
				`$elementCSS { margin-block-end: 8px } $elementCSS > .formBuilder-element.parent { min-width: unset !important }
				 $elementCSS > .formBuilder-element.parent:nth-child(1) { width: calc(var(--full) - ${sagWidth + 10}px) !important }
				 $elementCSS > .formBuilder-element.parent:nth-child(3) { width: ${sagWidth}px !important }
				 $elementCSS > .formBuilder-element.parent:nth-child(3) .jqx-dropdownlist-content { padding-top: 6px !important }`
			)
		});
		let fbd_yerText = form.addFormWithParent({ id: 'yerText' });
		fbd_yerText.addStyle(e => `$builderCSS { margin-top: 5px; padding: 0 10px }`).addCSS('lightgray')
			.onAfterRun(e => {
				const {builder} = e;
				(async () => {
					const rec = await MQStokYer.getVarsayilanYerRec();
					if (rec) {builder.layout.html(new CKodVeAdi({ kod: rec.kod.trim(), aciklama: rec.aciklama.trim() }).parantezliOzet({ styled: true }))}
				})()
			});
		let fbd_ddAyrimTipi = form.addModelKullan({ id: 'ayrimTipi', value: rec.ayrimtipi || ' ', placeholder: 'Ayrım Tipi', source: e => FisAyrimTipiBasit.instance.kaListe });
		fbd_ddAyrimTipi.dropDown().kodsuz().autoBind().etiketGosterim_placeholder().onAfterRun(e => this.ddAyrimTipi = e.builder.part);
		await rfb.run(); await new $.Deferred(p => setTimeout(() => p.resolve(), 10));
		const wnd = this.wnd = rfb.part.wnd = createJQXWindow({ content: rfb.layout, title: this.title, args: { isModal: false, width: 800, height: 460, closeButtonAction: 'close' } });
		wnd.on('close', evt => {
			wnd.jqxWindow('destroy');
			for (const key of ['rfb', 'wnd', 'ddCari', 'ddAyrimTipi']) { const elm = this[key]; if (elm && elm.destroyPart) { elm.destroyPart() } delete this[key] }
			$('body').removeClass('bg-modal'); promise_wnd.resolve({ isError: true, reason: 'close', message: 'İşlem iptal edildi' })
		}); $('body').addClass('bg-modal');
		if (!rec.mustkod) { this.vknIcinArastirIstendi() }
		return promise_wnd
	}
	async kaydet(e) {
		e = e || {}; const rec = e.rec = this.rec;
		const mustKod = rec.mustkod = this.ddCari.val()?.trimEnd(); if (!mustKod) { throw { isError: true, rc: 'emptyValue', errorText: `<b>Müşteri</b> belirtilmelidir` } }
		rec.ayrimtipi = this.ddAyrimTipi.val();
		let upd = new MQIliskiliUpdate({ from: 'efgecicialfatfis', where: { degerAta: rec.fissayac, saha: 'kaysayac' }, set: { degerAta: mustKod, saha: 'mustkod' } });
		return await app.sqlExecNone(upd)
	}
	async tamamIstendi(e) {
		const {wnd} = this;
		try {
			if (await this.kaydet(e)) {
				const {promise_wnd} = this;
				if (promise_wnd) { promise_wnd.resolve({ reason: 'kaydet', mustKod: this._mustKod, message: 'Ön Bilgi kaydedildi' }) }
				if (wnd?.length) { wnd.jqxWindow('close') }
			}
		}
		catch (ex) {
			wnd.addClass('jqx-hidden');
			try { await displayMessage(getErrorText(ex), this.title).result }
			catch (ex) { }
			wnd.removeClass('jqx-hidden');
		}
	}
	vazgecIstendi(e) { const {wnd} = this; if (wnd?.length) { wnd.jqxWindow('close') } }
	async vknIcinArastirIstendi(e) {
		e = e || {}; const {rec, ddCari} = this, vkn = rec.vkno;
		const vkn2Must = (await MQEIslVKNRef.getVKN2Must_yoksaOlustur({ vknListe: [vkn] })) || {}, mustKod = vkn2Must[vkn];
		if (mustKod) { rec.mustkod = mustKod; if (ddCari && !ddCari.isDestroyed) { ddCari.val(mustKod) } }
	}
	cariListeIstendi(e) {
		e = e || {}; const {wnd} = this; wnd.addClass('jqx-hidden'); $('body').removeClass('bg-modal');
		MQCari.listeEkraniAc({
			secimlerDuzenle: e => { const vkn = this.rec.vkno; if (vkn) { const sec = e.secimler; sec.vkn.value = vkn } },
			secince: e => { this.ddCari.val(e.value) },
			kapaninca: e => { wnd.removeClass('jqx-hidden'); wnd.focus(); $('body').addClass('bg-modal') }
		})
	}
	async yeniCariIstendi(e) {
		e = e || {}; const {wnd, rec} = this, {uuid} = rec;
		let {eFis} = this; if (!eFis && uuid) {
			const {eConf} = this, efAyrimTipi = rec.efayrimtipi || 'A'; let eIslAltBolum = eConf.getAnaBolumFor({ eIslTip: efAyrimTipi });
			if (eIslAltBolum) {
				const xmlDosyaAdi = `${uuid}.xml`; let xmlDosya = `${eIslAltBolum}\\ALINAN\\${xmlDosyaAdi}`, promise_xmlData, xmlData;
				promise_xmlData = app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi });
				try { xmlData = await promise_xmlData } catch (ex) { console.error(ex) }

				if (!xmlData && efAyrimTipi == 'A') {
					eIslAltBolum = eConf.getAnaBolumFor(); xmlDosya = `${eIslAltBolum}\\ALINAN\\${xmlDosyaAdi}`;
					promise_xmlData = app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi });
					try { xmlData = await promise_xmlData } catch (ex) { console.error(ex) }
				}
				try { const xml = xmlData ? $.parseXML(xmlData) : null; eFis = this.eFis = xml ? new EFis({ xml }) : null }
				catch (ex) { console.error(ex) }
			}
		}
		const inst = new MQCari(); inst.alimEIslIcinSetValues($.extend({}, e, { rec, eFis }));
		wnd.addClass('jqx-hidden'); $('body').removeClass('bg-modal');
		MQCari.tanimla({
			islem: 'yeni', inst,
			kaydedince: e => {
				const {inst} = e, {kod} = inst || {};
				if (kod) {
					const {ddCari} = this, _veriYukleninceBlock = ddCari.veriYukleninceBlock;
					ddCari.veriYukleninceBlock = e => { ddCari.veriYukleninceBlock = _veriYukleninceBlock; ddCari.val(kod) }; ddCari.dataBind()
				}
			},
			kapaninca: e => { wnd.removeClass('jqx-hidden'); $('body').addClass('bg-modal') }
		})
	}
}
