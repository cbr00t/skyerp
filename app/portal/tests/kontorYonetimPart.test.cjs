const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../..');

function ortam() {
	const sql = [], mesajlar = [], cagrilar = [];
	const ctx = { console, setTimeout, clearTimeout, setInterval, clearInterval };
	ctx.window = ctx.self = ctx;
	ctx.document = { hasFocus: () => true, addEventListener() {} };
	ctx.addEventListener = () => {};
	ctx.navigator = {};
	ctx.$ = {
		extend: Object.assign, isArray: Array.isArray,
		makeArray: v => v == null ? [] : Array.isArray(v) ? v : [v],
		isEmptyObject: v => !Object.keys(v ?? {}).length,
		isPlainObject: v => v != null && Object.getPrototypeOf(v)?.constructor?.name == 'Object'
	};
	ctx.config = { dev: false, offlineMode: false };
	ctx.app = { sqlExecSelect: async () => [] };
	ctx.hConfirm = (...args) => mesajlar.push(args);
	ctx.wConfirm = ctx.hConfirm;
	ctx.ehConfirm = async () => true;
	ctx.hideProgress = () => {};
	vm.createContext(ctx);
	const oku = file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
	for (const file of ['lib/ortak/utils.js', 'classes/ortak/CObject.js', 'lib/ortak/extensions.js',
		'classes/stmYapi/mqSQLOrtak.js', 'classes/stmYapi/dbCommand.js', 'classes/stmYapi/dbIliskiliYapiOrtak.js',
		'classes/stmYapi/dbClause.js', 'classes/stmYapi/dbSent.js', 'classes/stmYapi/dbStm.js', 'lib/partBase/simplePart.js']) oku(file);
	vm.runInContext('applyExtensions()', ctx);
	ctx.hConfirm = (...args) => mesajlar.push(args);
	ctx.wConfirm = ctx.hConfirm; ctx.ehConfirm = async () => true; ctx.hideProgress = () => {};
	ctx.MQCogul = { sqlExecSelect: async ({ query }) => { sql.push(query.toString()); return ctx.sonuc ?? []; } };
	const detay = {
		kontor_degistirIstendi: e => { cagrilar.push(['degistir', e]); return true; },
		kontor_sil: async e => { cagrilar.push(['sil', e]); return true; }
	};
	const cls = { sinifAdi: 'e-Belge', detaySinif: detay, faturalastirmaYapilirmi: true,
		kontor_topluFaturalastirIstendi: async e => { cagrilar.push(['faturalastir', e]); return true; } };
	ctx.MQKontor = { detaySinif: detay, kontor_yeniIstendi: async e => { cagrilar.push(['yeni', e]); return true; } };
	ctx.MQKontorDetay = detay;
	ctx.KontorTip = class { constructor(tip) { this.ekBilgi = tip == 'BL' ? cls : null; this.aciklama = tip; } };
	ctx.KontorTip.kaDict = { BL: { aciklama: 'e-Belge', ekBilgi: cls } };
	ctx.KontorTipBasit = { kaListe: [{ kod: 'BL', aciklama: 'e-Belge', ekBilgi: cls }] };
	ctx.KontorFatDurum = { kaDict: { B: { aciklama: 'Fatura Edilecek' } } };
	ctx.MQLogin = { current: { adminmi: true, bayimi: false, sefmi: false,
		yetkiVarmi: () => true,
		yetkiClauseDuzenle: ({ sent, clauses }) => sent.where.degerAta('M1', clauses.musteri) } };
	oku('app/portal/classes/kontorYonetimPart.js');
	const part = new ctx.KontorYonetimPart();
	part.tazele = () => cagrilar.push(['tazele']);
	part.grids.har = { selectedRecs: [], selectedRec: null };
	part.grids.ozet = { selectedRecs: [] };
	return { ctx, part, sql, mesajlar, cagrilar, cls };
}

test('Özet, hareketlerin tamamını ve müşteri yetkisini kapsar', async () => {
	const { ctx, part, sql } = ortam();
	ctx.sonuc = [{ fisID: 10, mustKod: 'M1', mustUnvan: 'Deneme', tip: 'BL', topAlinan: 100, topHarcanan: 25, topKalan: 75 }];
	part.durum = 'bekleyen';
	const recs = await part.getData_ozet();
	assert.equal(recs.length, 1);
	assert.match(sql[0], /SUM\(case when har\.ahtipi = 'A'/i);
	assert.match(sql[0], /GROUP BY/i);
	assert.match(sql[0], /fis\.mustkod = 'M1'/);
	assert.doesNotMatch(sql[0], /btamamlandi\s*=/);
});

test('Satış sorgusu durum, tip, özet fişleri ve müşteri yetkisiyle daralır', async () => {
	const { part, sql } = ortam();
	part.durum = 'tamamlanan'; part.tip = 'BL'; part.ozetFisIDListe = [10, 20];
	await part.getData_har();
	assert.match(sql[0], /har\.btamamlandi <> 0/);
	assert.match(sql[0], /fis\.tip = 'BL'/);
	assert.match(sql[0], /fis\.kaysayac IN \(10, 20\)/i);
	assert.match(sql[0], /fis\.mustkod = 'M1'/);
});

test('Değiştir tam detayı okur, detay kimliğini ve eşlenen kontör sınıfını taşır', async () => {
	const { ctx, part, sql, cagrilar, cls } = ortam();
	const rec = { id: 101, fisID: 10, tip: 'BL', mustKod: 'M1' };
	ctx.sonuc = [{ ...rec, kaysayac: 101, fissayac: 10, mustkod: 'M1', altmustvkn: '1234567890', kontorsayi: 100, fiyat: 9, fiyat2: 3, ayrimtipi: 'O1M', ahtipi: 'A' }];
	assert.equal(typeof part.degistir, 'function');
	assert.equal(await part.degistir({ rec }), true);
	assert.match(sql[0], /har\.kaysayac = 101/);
	const args = cagrilar.find(([k]) => k == 'degistir')[1];
	assert.equal(args.rec.kaysayac, 101); assert.equal(args.rec.fiyat, 9);
	assert.equal(args.parentRec.kaysayac, 10); assert.equal(args.parentRec.mustkod, 'M1');
	assert.equal(args.mfSinif, cls); assert.equal(args.sender, part);
});

test('Yetkisiz yeni/değiştir/sil/faturalaştır mutasyon veya sorgu başlatmaz', async () => {
	const { ctx, part, sql, cagrilar } = ortam();
	ctx.MQLogin.current = { adminmi: false, bayimi: false, sefmi: false, yetkiVarmi: () => false };
	part.grids.har.selectedRecs = [{ id: 101, fisID: 10, tip: 'BL', mustKod: 'M1' }];
	for (const islem of ['yeni', 'degistir', 'sil', 'faturalastir']) {
		assert.equal(typeof part[islem], 'function');
		assert.equal(await part[islem](), false);
	}
	assert.equal(sql.length, 0); assert.equal(cagrilar.length, 0);
});

test('Faturalaştır aynı başlığı tek kez iletir ve sonucu yeniler', async () => {
	const { part, cagrilar } = ortam();
	part.grids.har.selectedRecs = [
		{ id: 101, fisID: 10, tip: 'BL' }, { id: 102, fisID: 10, tip: 'BL' }, { id: 103, fisID: 20, tip: 'BL' }
	];
	await part.faturalastir();
	const args = cagrilar.find(([k]) => k == 'faturalastir')[1];
	assert.deepEqual(Array.from(args.recs, r => r.fissayac), [10, 20]);
	assert.ok(cagrilar.some(([k]) => k == 'tazele'));
});

module.exports = { ortam };

test('Sil, seçilen detayları başlıklarına göre ayırır ve çift kimlikleri tekilleştirir', async () => {
	const { part, cagrilar } = ortam();
	part.grids.har.selectedRecs = [{id:101,fisID:10,tip:'BL'},{id:102,fisID:10,tip:'BL'},{id:201,fisID:20,tip:'BL'}];
	assert.equal(await part.sil(),true);
	assert.deepEqual(cagrilar.filter(([k])=>k=='sil').map(([,e])=>({fisID:e.fisSayac,ids:Array.from(e.sayacListe)})),
		[{fisID:'10',ids:[101,102]},{fisID:'20',ids:[201]}]);
	assert.ok(cagrilar.some(([k])=>k=='tazele'));
});

test('Hücreden sil yalnızca tıklanan detay üzerinde çalışır', async () => {
	const { part, cagrilar } = ortam();
	part.grids.har.selectedRecs = [{id:101,fisID:10,tip:'BL'},{id:201,fisID:20,tip:'BL'}];
	await part.sil({rec:{id:102,fisID:10,tip:'BL'}});
	assert.deepEqual(cagrilar.filter(([k])=>k=='sil').map(([,e])=>Array.from(e.sayacListe)),[[102]]);
});

test('İptal edilen sil/faturalaştır hiçbir kayıt işlemi başlatmaz', async () => {
	const { ctx, part, cagrilar } = ortam();
	ctx.ehConfirm = async () => false;
	part.grids.har.selectedRecs = [{id:101,fisID:10,tip:'BL'}];
	assert.equal(await part.sil(),false); assert.equal(await part.faturalastir(),false);
	assert.equal(cagrilar.length,0);
});

test('Yetki matrisi, bayi/şef/müşteri kurallarına uyar', () => {
	const { ctx, part } = ortam();
	for(const [role,yetki,want] of [
		[{adminmi:true},true,[true,true,true,true]],
		[{bayimi:true},true,[true,true,true,false]],
		[{bayimi:true},false,[false,false,false,false]],
		[{bayimi:true,sefmi:true},false,[false,false,true,false]],
		[{musterimi:true},false,[false,false,false,false]]
	]) {
		ctx.MQLogin.current = {...role,yetkiVarmi:()=>yetki};
		assert.deepEqual(['yeni','degistir','sil','faturalastir'].map(k=>!!part.yetkiVarmi(k)),want);
	}
});

test('Geçersiz veya yetki kapsamından çıkmış kayıt düzenleme açmaz', async () => {
	const { ctx, part, cagrilar } = ortam();
	ctx.sonuc=[];
	assert.equal(await part.degistir({rec:{id:101,fisID:10,tip:'BL'}}),false);
	assert.equal(cagrilar.filter(([k])=>k=='degistir').length,0);
});

test('Kartta kullanıcı verisi HTML olarak çalıştırılmaz', () => {
	const { part } = ortam();
	const text=part.getLayout_ozet({tipAdi:'<script>alert(1)</script>',mustUnvan:'" onmouseover="alert(2)',mustKod:'<img src=x>',topKalan:-5});
	assert.doesNotMatch(text,/<script>|<img src=x>/);
	assert.match(text,/&lt;script&gt;/); assert.match(text,/kontor-negatif/);
});

test('Yavaş sorgu sırasında değişen durum, eski veriyi gride geri getirmez', async () => {
	const { ctx, part } = ortam();
	let ilkCevap, count=0;
	ctx.MQCogul.sqlExecSelect = () => ++count==1 ? new Promise(r=>ilkCevap=r) : Promise.resolve([]);
	part.durum='bekleyen';
	const p=part.getData_har();
	part.durum='tamamlanan';
	ilkCevap([{id:101,fisID:10,tip:'BL',mustKod:'M1',tamamlandi:0,tarih:null,miktar:100}]);
	assert.equal((await p).length,0);
	assert.equal(count,2);
});

test('Son tıklanan hücre gerçek satır seçimi yerine kullanılmaz', () => {
	const { part } = ortam();
	const rec={id:101,fisID:10,tip:'BL'};
	part.grids.har={selectedRecs:[rec],gridWidget:{
		_lastClickedCell:{row:0}, getselectedrowindexes:()=>[],getrowdata:()=>rec
	}};
	assert.equal(part.selectedRecs.length,0);
});

test('Eksik sayaçlı düzenleme kaydı sorgu başlatmaz', async () => {
	const { part, sql } = ortam();
	assert.equal(await part.degistir({rec:{tip:'BL',fisID:10}}),false);
	assert.equal(sql.length,0);
});

test('Gerçek kontör tipleri ve detay setValues, düzenleme alanlarını korur', () => {
	const { ctx } = ortam();
	for (const file of ['lib_external/etc/date.js','classes/ortak/CIdVeAdi.js','classes/ortak/CKodVeAdi.js',
		'classes/cIO/cIO.js','classes/cIO/pInst.js','classes/tekSecim/tekSecim.js',
		'classes/mq/mqYapi.js','classes/mq/cogul/mqCogul.js','classes/mq/cogul/kod/mqKod.js','classes/mq/cogul/fis/mqSayacli.js',
		'classes/mq/cogul/fis/mqDetayli.js','classes/mq/cogul/detay/mqDetay.js',
		'ortak/grid/classes/gridKontrolcu.js','app/portal/classes/mqKontor.js','app/portal/classes/tekSecim.js'])
		vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
	for(const tip of ['BL','TR','FN','DN']) {
		const cls=new ctx.KontorTip(tip).ekBilgi;
		assert.ok(cls,tip+' için gerçek kontör sınıfı');
		const inst=new cls.detaySinif();
		inst.setValues({rec:{kaysayac:101,fissayac:10,ahtipi:'A',kontorsayi:100,fiyat:9,fiyat2:3,
			altmustvkn:'1234567890',ayrimtipi:'O1M',btamamlandi:1,fatdurum:'B',fisnox:'SKY-101'}});
		assert.equal(inst.okunanHarSayac,101);
		assert.equal(inst.kontorSayi,100); assert.equal(inst.fiyat,9);assert.equal(inst.fiyat2,3);
		assert.equal(inst.altMustVKN,'1234567890');assert.equal(inst.ayrimTipi.char,'O1M');
		assert.equal(inst.tamamlandimi,true);assert.equal(inst.fatDurum.char,'B');
	}
});
