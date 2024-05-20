class MQCihazYonetimi extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cihaz Yönetimi' } static get table() { return 'ocihaz' } static get tableAlias() { return 'cih' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get orjBaslikListesi_defaultRowsHeight() { return 180 } static get orjBaslikListesi_defaultColCount() { return 5 } static get orjBaslikListesi_maxColCount() { return 20 }

	static orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(e) { const {liste} = e; liste.push('grupText', 'telNo', 'cihazTelNo', 'parkTelNo', 'cihazAdi', 'alanAdi', 'sozlesmeAdi', 'parkTS', 'durumKod') }
	static orjBaslikListesi_getPanelDuzenleyici(e) { const getCellLayoutIslemi = e => this.gridCell_getLayout(e); return new GridPanelDuzenleyici({ getCellLayoutIslemi }) }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.parentPart, butonlarPart = e.part;
		liste.splice(liste.findIndex(item => item.id == 'vazgec'), 0, ...[ { id: 'boyutlandir', text: 'BOYUT', handler: e => e.sender.panelDuzenleyici.boyutlandirIstendi(e) } ]);
		const ekSagButonIdSet = butonlarPart.ekSagButonIdSet = butonlarPart.ekSagButonIdSet || {}; $.extend(ekSagButonIdSet, asSet(['boyutlandir']))
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e)
		/*$.extend(args, { groupsRenderer: (text, group, expanded, groupInfo) => { const rec = (groupInfo.subItems || [])[0]; return `<div class="grid-cell-group"><b>(${rec.hatKod})</b> ${rec.hatAdi}</div>` } })*/
	}
	static orjBaslikListesi_panelGrupAttrListeDuzenle(e) { super.orjBaslikListesi_panelGrupAttrListeDuzenle(e); const {liste} = e; liste.push('grupText') }
	static orjBaslikListesi_groupsDuzenle(e) { super.orjBaslikListesi_groupsDuzenle(e); const {liste} = e; liste.push(...(this.orjBaslikListesi_panelGrupAttrListe || [])) }
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.devreDisimi)) { result.push('devreDisi') } }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'cihazAdi', text: 'Cihaz Adı' }).hidden(),
			new GridKolon({ belirtec: 'sozlesmeAdi', text: 'Sözleşme Adı' }).hidden(),
			new GridKolon({ belirtec: 'alanAdi', text: 'Alan Adı' }).hidden(),
			new GridKolon({ belirtec: 'grupText', text: 'Yerleşim Ve Alan' }).hidden()
		])
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			alanAdi: new SecimOzellik({ etiket: 'Alan Adı' }), sozlesmeAdi: new SecimOzellik({ etiket: 'Sözleşme Adı' }),
			cihazAktiflikSecim: new SecimTekSecim({ etiket: 'Cihaz Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="green">Aktif Olanlar</span>`, `<span class="red">DEVRE DIŞI Olanlar</span>`]) }),
			cihazDurumSecim: new SecimBirKismi({ etiket: 'Cihaz Durum', tekSecimSinif: CihazDurum })
		});
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.ozellik(sec.alanAdi, 'aln.aciklama'); wh.ozellik(sec.sozlesmeAdi, 'soz.aciklama');
			let tSec = sec.cihazAktiflikSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bdevredisi`)) }
			wh.birKismi(sec.cihazDurumSecim, `${alias}.durum`)
		})
	}
	static loadServerData_queryOlustur(e) {
		const {table} = this, alias = e.alias ?? this.tableAlias, {secimler} = e, sent = new MQSent({
			from: `${table} ${alias}`,
			fromIliskiler: [
				{ alias, leftJoin: 'ocagri cag', on: `${alias}.aktifcagriid = cag.id` },
				{ alias: 'cag', leftJoin: 'omobil mob', on: ['cag.mobilid = mob.id', 'mob.bdevredisi = 0'] },
				{ alias, leftJoin: 'oparkalani aln', on: `${alias}.alanid = aln.id` },
				{ from: 'takipmst soz', iliski: 'aln.sozlesmekod = soz.kod' },
				{ from: 'oyerlesim yer', iliski: 'aln.yerlesimkod = yer.kod' },
				{ from: 'oneden ned', iliski: `${alias}.nedenkod = ned.kod` },
				{ alias, leftJoin: 'oparkislem prk', iliski: `${alias}.aktifparkid = prk.id` },
				{ alias: 'prk', leftJoin: 'oucretlendirme ucr', iliski: 'prk.ucretid = ucr.id' },
				{ alias: 'prk', leftJoin: 'omobil pmob', on: ['prk.mobilid = pmob.id', 'pmob.bdevredisi = 0'] },
			],
			where: ['aln.bdevredisi = 0', 'soz.bkontisibitti = 0']
		});
		if (secimler) { sent.where.birlestir(secimler.getTBWhereClause(e)) }
		sent.addWithAlias(alias, 'id cihazId', 'aciklama cihazAdi', 'ipadresnum ipNum', 'bdevredisi devreDisimi', 'nedenkod nedenKod', 'alanid alanId', 'durum durumKod', 'bariyerdurum bariyerDurum',
			  'simkartno cihazTelNo', 'rezbasts rezervasyonBalangici', 'rezbitts rezervasyonBitisi', 'aktifcagriid aktifCagriId', 'aktifparkid aktifParkId');
		sent.add(
			'ned.aciklama nedenAdi', 'aln.yerlesimkod yerlesimKod', 'yer.aciklama yerlesimAdi', 'aln.aciklama alanAdi', 'mob.telno telNo', 'mob.aciklama mobilAdi',
			'prk.kayitts parkTS', 'prk.cikists parkCikisTS', 'ucr.aciklama ucretlendirmeAdi', 'prk.mobilid parkMobilId', 'pmob.telno parkTelNo', 'prk.ucretid ucretId'
		);	 
		const orderBy = ['yerlesimAdi', 'alanAdi']; return new MQStm({ sent, orderBy })
	}
	/* static async loadServerData(e) { e = e || {}; const {wsArgs} = e, gridPart = e.gridPart ?? e.sender; return [] } */
	static async loadServerData(e) {
		const recs = await super.loadServerData(e); if (!recs?.length) { return recs }
		const BlockSize = 10, query = 'ot_ucretHesapla'; let promises = [];
		for (const rec of recs) {
			const {ucretId, parkTS, parkCikisTS} = rec; if (!(ucretId && parkTS)) { continue }
			const params = [
				{ name: '@argUcretlendirmeID', value: ucretId }, { name: '@argBasTS', type: 'datetime', value: dateTimeToString(parkTS) },
				( parkCikisTS ? { name: '@argBitTS', type: 'datetime', value: dateTimeToString(parkCikisTS) } : null ),
				{ name: '@toplamBedel', type: 'dec', direction: 'output' }, { name: '@sureText', type: 'varchar', direction: 'output' }
			].filter(x => !!x);
			if (promises?.length >= BlockSize) { await Promise.all(promises); promises = [] }
			promises.push(app.sqlExecSP({ query, params }).then(result => {
				const {params} = result || {}; if (!params) { return null }
				let value = params['@toplamBedel']?.value; if (value != null) { rec.parkBedeli = roundToBedelFra(value) }
				value = params['@sureText']?.value; if (value != null) { rec.sureText = value?.trimEnd() }
			}))
		}
		if (promises?.length) { await Promise.all(promises); promises = [] }
		return recs
	}
	static orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); let {recs} = e;
		for (const rec of recs) { rec.grupText = `<div><div>${rec.yerlesimAdi}</div><div>${rec.alanAdi}</div></div>` }
	}
	static gridVeriYuklendi(e) { super.gridVeriYuklendi(e); app.sonSyncTS = now() }
	static orjBaslikListesi_gridRendered(e) {
		super.orjBaslikListesi_gridRendered(e); const {dev} = config, {gridPart} = e, {gridWidget} = gridPart;
		const buttons = gridWidget.table.find(`[role = row] > * button`); if (buttons?.length) {
			buttons.jqxButton({ theme }).off('click').on('click', evt => {
				$.extend(e, { event: evt, gridPart }); const id = evt.currentTarget.id, {parentRec, rec} = this.gridCellHandler_ilkIslemler(e); $.extend(e, { parentRec, rec });
				const {grupText, cihazAdi} = rec, {boundindex, visibleindex} = parentRec;
				switch (id) {
					case 'parkIslem': if (dev) { this.parkIslemIstendi(e); break }
					default:
						eConfirm(`<p><b>${visibleindex + 1}. satırdaki</b></p><p><b class="cadetblue">${grupText}</b></p><p>grubuna ait <b class="royalblue">${cihazAdi}</b> cihazına ait kayıt için</p><p><b class="green">${id}</b> id'li butona tıklandı</p>`, 'DEBUG');
						break
				}
			})
		}
		console.debug('gridRendered', e)
	}
	static async parkIslemIstendi(e) {
		try {
			const evt = e.event, gridPart = e.gridPart ?? e.parentPart ?? e.sender, {rec} = e; if (!rec) { return }
			const id = rec.aktifParkId, cihazId = rec.cihazId, inst = new MQParkIslem({ id });
			if (id) {
				if (evt?.ctrlKey) {
					let rdlg = await ehConfirm(`Seçilen cihaza ait <b class="red">Park İşlem Bağlantısı KALDIRILACAK</b>, devam edilsin mi?`, 'Park Kaydı SİL'); if (rdlg != true) { return }
					const {inst} = e, toplu = new MQToplu([
						new MQIliskiliUpdate({ from: 'ocihaz', where: { degerAta: cihazId, saha: 'id' }, set: [ `aktifparkid = NULL`, `durum = ''`] }),
						new MQIliskiliUpdate({ from: 'oparkislem', where: { degerAta: id, saha: 'id' }, set: [`cikists = getdate()`] })
					]);
					await app.sqlExecNone(toplu); gridPart.tazele(); return
				}
				else { await inst.yukle() }
			}
			else { const  {aktifCagriId} = rec; $.extend(inst, { id: newGUID(), cihazId, aktifCagriId }) }
			MQParkIslem.tanimla({
				islem: id ? 'degistir' : 'yeni', inst,
				kaydedince: async e => {
					try {
						const {inst} = e; await app.sqlExecNone(new MQIliskiliUpdate({ from: 'ocihaz', where: { degerAta: cihazId, saha: 'id' }, set: [`durum = 'KUL'`, { degerAta: inst.id, saha: 'aktifparkid' }] }))
						gridPart.tazele(e)
					}
					catch (ex) { hConfirm(getErrorText(ex), 'Park İşlem Kaydı'); throw ex }
				}
			})
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Park İşlem Tanımı'); throw ex }
	}
	static gridCell_getLayout(e) {
		const {dev} = config, {rec} = e, devreDisimi = asBool(rec.devreDisimi), durumKod = rec.durumKod ?? '', nedenAdi = rec.nedenAdi ?? '';
		const {cihazAdi, mobilAdi, cihazTelNo, parkTelNo, parkTS, parkCikisTS, ucretlendirmeAdi, sureText, parkBedeli} = rec;
		const durumKod2Adi = { KUL: 'Kullanımda', REZ: 'Rezerve' }, durumAdi = devreDisimi ? nedenAdi : durumKod2Adi[durumKod] ?? durumKod;
		const mobilText = (durumKod == 'KUL' || durumKod == 'REZ' ? mobilAdi || parkTelNo || cihazTelNo : cihazTelNo || '') ?? '??';
		const parkHTML = (parkTS ? `<span class="parkZamani sub-item">${timeToString(asTime(parkTS))}</span>` : '');
		const ucretSubHtmlList = []; if (ucretlendirmeAdi) { ucretSubHtmlList.push(`<span class="ucretlendirme sub-item">${ucretlendirmeAdi}</span>`) }
			if (sureText) { ucretSubHtmlList.push(`<span class="sureText sub-item">${sureText}</span>`) }
			if (parkBedeli) { ucretSubHtmlList.push(`<span class="parkBedeli sub-item">${toStringWithFra(parkBedeli)} <span class="ek-bilgi">TL</span></span>`) }
		let ucretHTML = ucretSubHtmlList?.length ? ucretSubHtmlList.join('') : '';
		return (
			`<div class="ust ust-alt">
				<table class="parent">
				<tbody>
					<tr class="cihaz item">
						${devreDisimi ? '' : `<td class="islemTuslari"><button id="cihaz" aria-disabled="true">C</button></td>`}
						<td class="veri"><b>${cihazAdi || ''}</b></td>
					</tr>
					<tr class="mobil item">
						${devreDisimi ? '' : `<td class="islemTuslari"><button id="mobil" aria-disabled="true">M</button></td>`}
						<td class="veri"><b>${mobilText}</b></td>
					</tr>
					<tr class="parkIslem item">
						${devreDisimi ? '' : `<td class="islemTuslari"><button id="parkIslem" aria-disabled="${!dev}">P</button></td>`}
						<td class="veri"><b>${parkHTML}</b></td>
					</tr>
					<tr class="ucretlendirme item">
						${devreDisimi ? '' : `<td class="islemTuslari"><button id="ucretlendirme" aria-disabled="true">Ü</button></td>`}
						<td class="veri"><b>${ucretHTML}</b></td>
					</tr>
				</tbody>
				</table>
			</div>
			<div class="alt ust-alt flex-row" data-durum="${durumKod}">
				<div class="durumText veri full-wh">${durumAdi}</div>
			</div>`
		)
	}
}
