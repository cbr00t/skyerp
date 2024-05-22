class ParkBulurumApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'CYON' }
	get defaultWSPath() { return `${super.superDefaultWSPath}/parkBulurum` }
	async run(e) { await super.run(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { yerel: MQYerelParam.getInstance() }) }
	getAnaMenu(e) {
		const {dev} = config, items = [
			new FRMenuChoice({ mnemonic: 'CYON', text: 'Cihaz Yönetimi', block: e => MQCihazYonetimi.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'YKO', text: 'Yakındaki Otoparklar', block: e => MQYakindakiOtoparklar.tanimla($.extend({}, e, { islem: 'yeni' })) }),
			new FRMenuChoice({ mnemonic: 'REZ', text: `Rezervasyon`, block: e => MQRezervasyon.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'PAR', text: `Park İşlemi`, block: e => MQParkIslem.listeEkraniAc(e) }),
			new FRMenuCascade({
				mnemonic: 'TAN', text: 'Tanımlar', items: [
					new FRMenuChoice({ mnemonic: 'MOB', text: 'Mobil Cihazlar', block: e => MQMobil.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'KRT', text: 'Mobil Kartlar', block: e => MQMobilKart.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'CIH', text: 'Cihazlar', block: e => MQCihaz.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'PBL', text: 'Otopark Bölümleri', block: e => MQParkBolum.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'ALN', text: 'Otopark Alanları', block: e => MQAlan.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'SOZ', text: 'Sözleşmeler', block: e => MQSozlesme.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'UCR', text: 'Ücretlendirme', block: e => MQUcretlendirme.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'YER', text: 'Yerleşimler', block: e => MQYerlesim.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'NED', text: 'DevreDışı Nedenleri', block: e => MQArizaNedeni.listeEkraniAc(e) })
				].filter(x => !!x)
			})
		].filter(x => !!x);
		return new FRMenu({ items })
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); const {sonSyncTS} = this; if (sonSyncTS) { args.sonSyncTS = dateTimeToString(sonSyncTS) }
	}
	wsYakindakiOtoparklar(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'yakindakiOtoparklar', args: e }) }) }
	wsOtoparkCihazlari(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'otoparkCihazlari', args: e }) }) }
}



/*

	// api call stress test
for (let t = 0; t < 5; t++) {
	console.info('- başladı -'); const promises = [];
	for (let i = 0; i < 100; i++) {
		const promise = new $.Deferred(), results = [];
		try {
			results.push(await ajaxGet({
				url: `https://localhost:9200/ws/parkBulurum/getSessionInfo`,
				data: { loginTipi: 'mobilLogin', user: '905388569274', pass: '92eb5ffee6ae2fec3ad71c777531578f' }
			}));
			results.push(await ajaxGet({
				url: `https://localhost:9200/ws/parkBulurum/bolumler`,
				data: { loginTipi: 'mobilLogin', user: '905388569274', pass: '92eb5ffee6ae2fec3ad71c777531578f' }
			}));
			results.push(await ajaxGet({
				url: `https://localhost:9200/ws/parkBulurum/alanlar`,
				data: { loginTipi: 'mobilLogin', user: '905388569274', pass: '92eb5ffee6ae2fec3ad71c777531578f' }
			}))
			promise.resolve({ results })
		}
		catch (ex) { console.error(getErrorText(ex)); promise.resolve({ isError: true, ex: ex, errorText: getErrorText(ex) }) }
	}
	try { await Promise.all(promises) } catch (ex) { }
	console.info('- bitti -'); await new $.Deferred(p => setTimeout(() => p.resolve()), 2000)
}

	// register
const StartIndex = 1; TestCount = 1, EndIndex = StartIndex + TestCount - 1, pass = '92eb5ffee6ae2fec3ad71c777531578f';
const TelNo_Size = 12, TelNo_Prefix = '905382', TelNo_RemainingSize = TelNo_Size - TelNo_Prefix.length;
for (let i = StartIndex; i <= EndIndex; i++) {
	const cred = { user: `${TelNo_Prefix}${i.toString().padStart(TelNo_RemainingSize, '0')}`, pass }, telNo = cred.user;
	try {
		const result_ssoSMSSend = await ajaxGet({ url: `https://localhost:9200/ws/parkBulurum/ssoSMSSend`, data: { telNo } }); let ssoPass = result_ssoSMSSend.debugSSOPass;
		let result_register = await ajaxGet({
			url: `https://localhost:9200/ws/parkBulurum/register`,
			data: { ssoPass, telNo, isim: `TEST ${i.toString().padStart(TelNo_RemainingSize, '0')}`, sifre: cred.pass }
		});
		console.info({ result_ssoSMSSend, result_register })
	}
	catch (ex) { console.error(getErrorText(ex)) }
}
try { console.table(await app.sqlExecSelect(`select * from omobil`)) }
catch (ex) { console.error(getErrorText(ex)) }


	// login + parkBaslat api call
const StartIndex = 1; TestCount = 1, EndIndex = StartIndex + TestCount - 1;
const TelNo_Size = 12, TelNo_Prefix = '905382', TelNo_RemainingSize = TelNo_Size - TelNo_Prefix.length, pass = '92eb5ffee6ae2fec3ad71c777531578f';
for (let i = StartIndex; i <= EndIndex; i++) {
	const cred = { user: `${TelNo_Prefix}${i.toString().padStart(TelNo_RemainingSize, '0')}`, pass }; let sessionID;
	const cihazId = '53931415-f2eb-461c-87ba-7ca5024de08a';
	try {
		let result_login = await ajaxGet({ url: `https://localhost:9200/ws/parkBulurum/mobilLogin`, data: cred }); sessionID = result_login.sessionID;
		let result_parkBaslat = await ajaxGet({ url: `https://localhost:9200/ws/parkBulurum/parkBaslat`, data: { sessionID, cihazId } });
		console.info({ result_login, sessionID, result_parkBaslat })
	}
	catch (ex) { console.error(getErrorText(ex)) }
}

*/
