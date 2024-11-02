class MQDurumDegerlendirme extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Durum Değerlendirme' }
	static get kodListeTipi() { return 'CRMMUSDURUMDEG' } static get silinebilirmi() { return false }
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {sinifAdi} = this, {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e, grids = {}, gridSources = {};
		rfb.onAfterRun(e => $.extend(rfb.part, { grids, gridSources, title: `${sinifAdi} Ekranı` }));
		let header = e.fbd_header = tanimForm.addFormWithParent('kaForm').addStyle(e => `$elementCSS { position: relative; top: -85px; width: calc(var(--full) - 80px) !important }`);
			header.addModelKullan('mustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQCari).etiketGosterim_placeholder()
				.degisince(async e => { try { await this.mustKodDegisti(e) } catch (ex) { console.error(ex); hConfirm(getErrorText(ex), this.sinifAdi) } });
		this.formBuilder_addTabPanelWithGenelTab(e); let {tabPanel, tabPage_genel: tabPage} = e;
		tabPanel.addStyle(e => `$elementCSS { position: relative; top: -75px; height: calc(var(--full) + 60px) !important }`)
		let form = tabPage.addFormWithParent().altAlta().addStyle_fullWH().altAlta(); tabPage.etiket = 'CRM';
			form.addGridliGosterici('crm').addStyle_fullWH()
				.widgetArgsDuzenleIslemi(e => $.extend(e.args, { rowsHeight: 130 }))
				.onAfterRun(e => grids[e.builder.id] = e.builder.part)
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'tarihVeKisi', text: 'Tarih / Kişi', genislikCh: 40 }),
					new GridKolon({ belirtec: 'konu', text: 'Konu', minWidth: 500 }), new GridKolon({ belirtec: 'ekBilgi', text: 'Ek Bilgi', minWidth: 300 })
				])
				.setSource(e => gridSources.crm ?? [])
				.addStyle(e => `$elementCSS [role = row] > div > div { margin-top: 5px !important }`);
		tabPage = tabPanel.addTab('durumAnaliz', 'Durum Analiz').addStyle_fullWH().altAlta(); let yaslandirma_width = 300;
		form = tabPage.addFormWithParent().yanYana().addStyle_fullWH(null, '50%');
			form.addGridliGosterici('yaslandirma').addStyle_fullWH(yaslandirma_width).rowNumberOlmasin().notAdaptive()
				.onAfterRun(e => grids[e.builder.id] = e.builder.part)
				.setSource(e => gridSources.yaslandirma ?? []); form.addGridliGosterici('grid2').addStyle_fullWH(`calc(var(--full) - ${yaslandirma_width + 10}px)`).setSource([]);
		form = tabPage.addFormWithParent().altAlta().addStyle_fullWH(null, '50%');
			form.addGridliGosterici('kapanmayanHesaplar').addStyle_fullWH('calc(var(--full) - 5px)')
				.onAfterRun(e => grids[e.builder.id] = e.builder.part)
				.setSource(e => gridSources.kapanmayanHesaplar ?? [])
	}
	static async mustKodDegisti(e) {
		const {builder, value: mustKod} = e, {rootBuilder: rfb} = builder, {part, inst} = rfb, {grids, gridSources} = part, {tabPanel} = rfb.builders[0].id2Builder;
		let sent = new MQSent({
			from: `${MQMusIslem.table} fis`, fromIliskiler: [ { from: `${MQMusIslemDetay.table} har`, iliski: 'har.fissayac = fis.kaysayac' } ],
			where: ['fis.bitists IS NULL', { degerAta: mustKod, saha: 'fis.mustkod' }],
			sahalar: ['har.fissayac fisSayac', 'har.detayts ts', 'har.detayaciklama aciklama']
		});
		let stm = new MQStm({ sent, orderBy: ['fisSayac', 'ts DESC'] }), sayac2DetRec = {};
		for (const {fisSayac, ts, aciklama} of await this.sqlExecSelect(stm)) { (sayac2DetRec[fisSayac] = sayac2DetRec[fisSayac] ?? []).push({ts, aciklama}) }
		sent = new MQSent({
			from: `${MQMusIslem.table} misl`, fromIliskiler: [
				{ from: `${MQPersonel.table} gper`, iliski: 'misl.gorevlikullanicikod = gper.kod' },
				{ from: `${MQIslemTuru.table} itur`, iliski: 'misl.islemturkod = itur.kod' }
			],
			where: ['misl.bitists IS NULL', { degerAta: mustKod, saha: 'misl.mustkod' }],
			sahalar: ['misl.kaysayac sayac', 'misl.zamants zamanTS', 'misl.termints terminTS', 'itur.aciklama islemTurAdi', 'gper.aciklama kisiAdi', 'misl.yapilacakis konu']
		});
		stm = new MQStm({ sent, orderBy: 'zamants DESC' }); let recs = [];
		for (const {sayac, zamanTS, terminTS, kisiAdi, islemTurAdi, konu} of await this.sqlExecSelect(stm)) {
			const detRecs = sayac2DetRec[sayac] ?? [], islemTarih = asDate(zamanTS)?.clearTime();
			const _ekBilgiler = detRecs.filter(({ aciklama }) => !!aciklama).map(({ ts, aciklama }) =>
				`<li class="_row flex-row" style="margin-left: -20px">
					<div class="item flex-row bold green" style="width: 120px">${dateTimeAsKisaString(asDate(ts))}</div>
					<div class="item flex-row darkgray" style="margin-left: 10px">${aciklama}</div>
				</li>`), ekBilgi = _ekBilgiler?.length ? `<ul class="items">${_ekBilgiler.join('')}</ul>` : '';
			const rec = {
				oncelik: 1, tarih: islemTarih,
				tarihVeKisi: [
					(`<div class="item"><span class="ek-bilgi gray">İşlem:</span> <span class="bold royalblue">${dateKisaString(islemTarih)}</span></div>` +
						(terminTS ? `<div class="item" style="margin-left: 10px">(<span class="ek-bilgi gray">Termin:</span>
							<span class="bold orangered">${dateTimeAsKisaString(asDate(terminTS))}</span>)
						</div>` : '')),
					islemTurAdi?.trimEnd(), kisiAdi?.trimEnd()
				].filter(x => !!x).map(x => `<div class="_row flex-row">${x}</div>`).join(''),
				konu: konu?.trimEnd(), ekBilgi
			}; recs.push(rec)
		}
		let alias = 'zpln'; sent = new MQSent({
			from: `${MQZiyaretPlani.table} ${alias}`, fromIliskiler: [
				{ alias, leftJoin: `${MQZiyaret.table} ziy`, iliski: `${alias}.kaysayac = ziy.plansayac` },
				{ from: `${MQPersonel.table} gper`, iliski: `${alias}.gorevlikullanicikod = gper.kod` },
				{ from: `${MQZiyaretKonu.table} zkon`, iliski: `${alias}.konukod = zkon.kod` }
			],
			where: { degerAta: mustKod, saha: `${alias}.mustkod` },
			sahalar: [`${alias}.plantarih planTarih`, `${alias}.kisabilgi kisaBilgi`, 'zkon.aciklama konuAdi', 'gper.aciklama ziyaretciAdi', 'ziy.ziyaretzamani ziyaretTS']
		});
		stm = new MQStm({ sent, orderBy: 'planTarih DESC' });
		for (const {ziyaretTS, planTarih: _planTarih, kisaBilgi, konuAdi, ziyaretciAdi} of await this.sqlExecSelect(stm)) {
			const planTarih = asDate(_planTarih); recs.push({
				oncelik: 2, tarih: planTarih,
				tarihVeKisi: [
					(`<div class="item"><span class="ek-bilgi gray">Plan:</span> <span class="bold royalblue">${dateKisaString(planTarih)}</span></div>` +
						(ziyaretTS ? `<div class="item" style="margin-left: 10px">(<span class="ek-bilgi gray">Ziy.:</span>
							<span class="bold green">${dateTimeAsKisaString(asDate(ziyaretTS))}</span>)
						</div>` : '')),
					konuAdi?.trimEnd(), ziyaretciAdi?.trimEnd()
				].filter(x => !!x).map(x => `<div class="_row flex-row">${x}</div>`).join(''),
				konu: kisaBilgi?.trimEnd()
			})
		}
		alias = 'ziy'; sent = new MQSent({
			from: `${MQZiyaret.table} ${alias}`, fromIliskiler: [
				{ from: `${MQPersonel.table} gper`, iliski: `${alias}.gorevlikullanicikod = gper.kod` },
				{ from: `${MQZiyaretKonu.table} zkon`, iliski: `${alias}.konukod = zkon.kod` },
				{ from: `${MQZiyaretSonuc.table} zson`, iliski: `${alias}.sonuckod = zson.kod` }
			],
			where: [`${alias}.plansayac IS NULL`, { degerAta: mustKod, saha: `${alias}.mustkod` }],
			sahalar: [`${alias}.ziyaretzamani ziyaretTS`, `${alias}.gorusmenotu kisaBilgi`, 'zkon.aciklama konuAdi', /*'gper.aciklama ziyaretciAdi',*/ 'zson.aciklama sonucAdi']
		});
		stm = new MQStm({ sent, orderBy: 'ziyaretTS DESC' });
		for (const {ziyaretTS: _ziyaretTS, kisaBilgi, konuAdi, sonucAdi} of await this.sqlExecSelect(stm)) {
			const ziyaretTS = asDate(_ziyaretTS); recs.push({
				oncelik: 3, tarih: ziyaretTS,
				tarihVeKisi: [
					`<div class="item"><span class="ek-bilgi gray">Plansız:</span> <span class="bold royalblue">${dateTimeAsKisaString(ziyaretTS)}</span></div>`,
					konuAdi?.trimEnd(), sonucAdi?.trimEnd()
				].filter(x => !!x).map(x => `<div class="_row flex-row">${x}</div>`).join(''),
				konu: kisaBilgi?.trimEnd()
			})
		}
		recs.sort((a, b) => a.tarih == b.tarih ? a.oncelik - b.oncelik : b.tarih - a.tarih); gridSources.crm = recs;
		recs = gridSources.kapanmayanHesaplar = await MQKapanmayanHesaplar.loadServerData({ mustKod });
		for (const key of ['crm', 'kapanmayanHesaplar']) { grids.crm.tazele() }
		grids.yaslandirma.tazele()
		/*debugger*/
	}
}
