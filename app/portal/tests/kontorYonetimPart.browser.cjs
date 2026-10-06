// Node 22.13+ ve playwright + Chromium gerektirir.
// node app/portal/tests/kontorYonetimPart.browser.cjs
// Alternatif Chromium: KONTOR_CHROMIUM_PATH=/path/chromium node app/portal/tests/kontorYonetimPart.browser.cjs
// Gerçek FormBuilder/jqxGrid; dış SQL ve kayıt işlemleri yerel örnek verilerle yürütülür.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE musteri (kod TEXT, aciklama TEXT, bayikod TEXT);
CREATE TABLE bayi (kod TEXT, anabayikod TEXT);
CREATE TABLE muskontor (kaysayac INTEGER, mustkod TEXT, tip TEXT);
CREATE TABLE muskontordetay (kaysayac INTEGER, fissayac INTEGER, ahtipi TEXT, tarih TEXT,
fisnox TEXT, kontorsayi INTEGER, btamamlandi INTEGER, fatdurum TEXT, fiyat REAL,
fiyat2 REAL, ayrimtipi TEXT, altmustvkn TEXT);
INSERT INTO bayi VALUES ('B1', 'AB1');
INSERT INTO musteri VALUES ('M1', 'Örnek Market', 'B1'), ('M2', 'Uzun Ünvanlı Örnek Yazılım ve Ticaret Ltd. Şti.', 'B1');
INSERT INTO muskontor VALUES (10, 'M1', 'BL'), (20, 'M1', 'TR'), (30, 'M2', 'BL'), (40, 'M2', 'FN');
INSERT INTO muskontordetay VALUES
(101,10,'A','2026-10-05','SKY-101',100,0,'B',9,3,'O1M','1234567890'),
(102,10,'A','2026-10-04','SKY-102',50,1,'X',9,3,'',''),
(103,10,'H','2026-10-03','KULLANIM',25,1,'',0,0,'',''),
(201,20,'A','2026-10-05','SKY-201',250,0,'B',4,0,'',''),
(301,30,'A','2026-10-06','SKY-301',500,0,'B',5,0,'',''),
(401,40,'A','2026-10-05','SKY-401',10,0,'B',5,0,'','');`);
const sql = [];
const libs = [
	'lib_external/jqx/jquery-3.3.1.min.js', 'lib_external/jqx/jquery-ui.min.js', 'lib_external/jqx/jqx-all.js',
	'lib_external/etc/md5.min.js', 'lib_external/etc/date.js', 'lib/ortak/utils.js', 'classes/ortak/CObject.js', 'classes/ortak/CIdVeAdi.js',
	'classes/ortak/CKodVeAdi.js', 'lib/ortak/extensions.js', 'lib/etc/localization.js',
	'classes/cIO/cIO.js', 'classes/cIO/pInst.js', 'classes/tekSecim/tekSecim.js',
	'classes/stmYapi/mqSQLOrtak.js', 'classes/stmYapi/dbCommand.js', 'classes/stmYapi/dbIliskiliYapiOrtak.js',
	'classes/stmYapi/dbClause.js', 'classes/stmYapi/dbSent.js', 'classes/stmYapi/dbStm.js',
	'lib/layoutBase/layoutBase.js', 'lib/partBase/part.js', 'lib/partBase/simplePart.js',
	'ortak/butonlar/part.js', 'ortak/filtreForm/part.js', 'ortak/simpleComboBox/simpleComboBox.js',
	'ortak/grid/kolon/gridKolonVeGrupOrtak.js', 'ortak/grid/kolon/gridKolon.js', 'ortak/grid/kolon/gridKolonTip.js',
	'ortak/gridliKolonFiltre/classes.js', 'ortak/grid/classes/ekSiniflar.js',
	'ortak/grid/gridPart/gridPart.js', 'ortak/grid/gridPart/gridliGostericiPart.js', 'ortak/grid/gridPart/gridliGirisPart.js',
	'ortak/formBuilder/formBuilderBase.js', 'ortak/formBuilder/formBuilder.js', 'ortak/formBuilder/rootFormBuilder.js',
	'ortak/formBuilder/formBuilder-altSiniflar-form.js', 'ortak/formBuilder/formBuilder-altSiniflar-subPart.js'
];
const bootstrap = `
var qs = {}, webRoot = '', appVersion = 'test', config = { dev: false, offlineMode: false };
var app = { _activePartStack: [], params: { yerel: {} }, activePart: null, injectResult: {},
getLayout: () => $('#root'), getCSS: () => null };
var cagrilar = [], mesajlar = [];
applyExtensions();
theme = ''; animationType = 'none';
class MQKA extends CObject { static get kodSaha() { return 'kod' } static get adiSaha() { return 'aciklama' } }
class MQLogin_Musteri extends MQKA {
static async loadServerData(e) { return await this.loadServerDataDogrudan(e) }
static async loadServerDataDogrudan(e = {}) {
let sent = new MQSent({ from: 'musteri mus', sahalar: ['mus.kod','mus.aciklama'] });
if(e.value) sent.where.degerAta(e.value, 'mus.kod');
let stm = new MQStm({ sent });
e.ozelQueryDuzenle?.({ stm, aliasVeNokta: 'mus.', mfSinif: this });
return await MQCogul.sqlExecSelect({ query: stm });
}}
var MQLogin = { current: { adminmi: true, bayimi: false, sefmi: false,
yetkiVarmi: () => true, yetkiClauseDuzenle: () => {} } };
var MQCogul = { sqlExecSelect: async ({query}) => {
let res = await fetch('/sql', {method:'POST',body:query.toString()});
if(!res.ok) throw new Error(await res.text()); return await res.json();
} };
var detaySinif = {
kontor_degistirIstendi: e => { cagrilar.push({islem:'degistir', id:e.rec.kaysayac, fisID:e.parentRec.kaysayac, fiyat:e.rec.fiyat}); return true },
kontor_sil: async e => { cagrilar.push({islem:'sil', ids:e.sayacListe, fisID:e.fisSayac}); return true }
};
var tip2Cls = Object.fromEntries([['BL','e-Belge'],['TR','Türmob'],['FN','NES e-İşlem']].map(([tip,tipAdi]) =>
[tip, {sinifAdi: tipAdi, tip, detaySinif, faturalastirmaYapilirmi: true,
kontor_yeniIstendi: async e => {cagrilar.push({islem:'yeni',mustKod:e.mustKod,tip});return true},
kontor_topluFaturalastirIstendi: async e => {cagrilar.push({islem:'faturalastir',fisler:e.recs});return true}}]));
var MQKontorDetay = detaySinif;
var MQKontor = {kontor_yeniIstendi:async e=>{cagrilar.push({islem:'yeni',mustKod:e.mustKod});return true}};
class KontorTip { constructor(tip) {this.ekBilgi=tip2Cls[tip];this.aciklama=this.ekBilgi?.sinifAdi} }
KontorTip.kaDict = Object.fromEntries(Object.entries(tip2Cls).map(([kod,ekBilgi])=>[kod,{kod,aciklama:ekBilgi.sinifAdi,ekBilgi}]));
var KontorTipBasit = { kaListe: Object.values(KontorTip.kaDict) };
var KontorFatDurum = { kaDict: { B: {aciklama:'Fatura Edilecek'}, X: {aciklama:'Fatura Edildi'} } };
hConfirm = (...a) => mesajlar.push(a); wConfirm=hConfirm;
ehConfirm=async (...a)=>{mesajlar.push(a);return true}; hideProgress=()=>{};
`;
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${['lib_external/jqx/css/jqx.base.css','lib/appBase/cssClasses.css','lib/appBase/buttons.css','ortak/formBuilder/part.css','ortak/grid/gridPart/gridPart.css','ortak/butonlar/part.css','ortak/simpleComboBox/simpleComboBox.css'].map(p=>`<link rel="stylesheet" href="/${p}">`).join('')}
<style>:root{--full:100%;--islemTuslari-height:44px}html,body{margin:0;width:100%;height:100%}#root{position:relative;width:100%;height:100%;overflow:hidden}.basic-hidden,.jqx-hidden{display:none!important}</style>
${libs.map(p=>`<script src="/${p}"></script>`).join('')}
<script>${bootstrap}</script><script src="/app/portal/classes/kontorYonetimPart.js"></script>
</head><body><main id="root"></main><script>
try { window.p = new KontorYonetimPart().asForm().setLayout($('#root')); p.run(); }
catch(ex) { console.error(ex); window.baslatmaHatasi = ex.message ?? ex.errorText; }
</script></body></html>`;
const server = http.createServer(async (req,res) => {
	if(req.url == '/sql') {
		let body = ''; for await(const chunk of req) body += chunk;
		try { sql.push(body); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(db.prepare(body).all())); }
		catch(e) { res.statusCode=500; res.end(e.message+'\n'+body); }
		return;
	}
	if(req.url == '/') { res.setHeader('Content-Type','text/html');res.end(html);return; }
	const file = path.join(root, decodeURI(req.url.split('?')[0]));
	if(!file.startsWith(root) || !fs.existsSync(file)) {res.statusCode=404;res.end('Missing '+req.url);return;}
	res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/plain');
	res.end(fs.readFileSync(file));
});

(async () => {
	await new Promise(r=>server.listen(0,'127.0.0.1',r));
	const browser = await chromium.launch({headless:true,
		...(process.env.KONTOR_CHROMIUM_PATH ? {executablePath:process.env.KONTOR_CHROMIUM_PATH} : {}),
		args:['--no-sandbox','--disable-gpu']});
	try {
		const page = await browser.newPage({viewport:{width:1440,height:950}});
		const errors=[]; page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR:',e.stack)});
		page.on('console',m=>{if(m.type()=='error') console.log('CONSOLE:',m.text())});
		await page.goto('http://127.0.0.1:'+server.address().port);
		await page.waitForTimeout(1000);
		console.log('Grids:', await page.evaluate(()=>Object.keys(p.grids)));
		assert.equal(await page.evaluate(()=>window.baslatmaHatasi),undefined);
		await page.waitForFunction(()=>p.grids.har?.gridWidget?.getboundrows().length == 5);
		assert.equal(await page.evaluate(()=>p.grids.ozet.gridWidget.getboundrows().length),4);
		assert.equal(await page.evaluate(()=>p.grids.ozet.gridWidget.getboundrows().find(r=>r.fisID==10).topKalan),125);
		await page.selectOption('.kontor-durum select','bekleyen');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==4);
		await page.selectOption('.kontor-durum select','tamamlanan');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==1);
		await page.selectOption('.kontor-durum select','tumu');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==5);
		await page.evaluate(()=>{let w=p.grids.ozet.gridWidget;w.selectrow(w.getboundrows().find(r=>r.fisID==10).boundindex)});
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==2);
		assert.deepEqual(await page.evaluate(()=>p.grids.har.gridWidget.getboundrows().map(r=>r.fisID)),[10,10]);
		await page.locator('.kontor-grid-har button[data-islem=degistir]').first().click();
		await page.waitForFunction(()=>cagrilar.some(c=>c.islem=='degistir'));
		assert.deepEqual(await page.evaluate(()=>cagrilar.find(c=>c.islem=='degistir')),{islem:'degistir',id:101,fisID:10,fiyat:9});
		await page.evaluate(()=>{p.grids.har.gridWidget.selectrow(0);p.grids.har.gridWidget.selectrow(1)});
		await page.locator('.kontor-toolbar button#faturalastir').click();
		await page.waitForFunction(()=>cagrilar.some(c=>c.islem=='faturalastir'));
		assert.deepEqual(await page.evaluate(()=>cagrilar.find(c=>c.islem=='faturalastir').fisler),[{fissayac:10}]);
		await page.locator('.kontor-toolbar button#secimTemizle').click();
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==5);
		await page.locator('.kontor-arama input').fill('Market e-Belge');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==2);
		await page.locator('.kontor-arama input').fill('');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==5);
		await page.selectOption('.kontor-tip select','TR');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==1);
		assert.equal(await page.evaluate(()=>p.grids.har.gridWidget.getboundrows()[0].id),201);
		await page.selectOption('.kontor-tip select','');
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==5);
		await page.locator('.kontor-musteri input').fill('M1');
		await page.locator('.kontor-musteri input').press('Enter');
		await page.waitForFunction(()=>p.mustKod=='M1' && p.grids.har.gridWidget.getboundrows().length==3);
		assert.equal(await page.evaluate(()=>p.grids.ozet.gridWidget.getboundrows().length),2);
		await page.locator('.kontor-musteri input').fill('');
		await page.locator('.kontor-musteri input').press('Enter');
		await page.waitForFunction(()=>!p.mustKod && p.grids.har.gridWidget.getboundrows().length==5);
		await page.waitForTimeout(100);
		assert.equal(await page.evaluate(()=>p.selectedRecs.length),0);
		// Sanallaştırma: ilk çizilen DOM satırlarının çok altındaki gerçek kayda basılır.
		const insert=db.prepare("INSERT INTO muskontordetay VALUES (?,10,'A','2026-10-06',?,1,0,'B',2,0,'','')");
		for(let i=0;i<80;i++) insert.run(500+i,'SCROLL-'+i);
		await page.evaluate(()=>p.tazele());
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==85);
		const expected=await page.evaluate(()=>{let w=p.grids.har.gridWidget;let r=w.getrowdata(55);w.ensurerowvisible(55);return {id:r.id,fisID:r.fisID,fisNox:r.fisNox}});
		await page.waitForTimeout(100);
		const card=page.locator('.kontor-grid-har article').filter({hasText:expected.fisNox});
		await card.locator('button[data-islem=degistir]').click();
		await page.waitForFunction(()=>cagrilar.filter(c=>c.islem=='degistir').length==2);
		const changed=await page.evaluate(()=>cagrilar.filter(c=>c.islem=='degistir').at(-1));
		assert.equal(changed.id,expected.id); assert.equal(changed.fisID,expected.fisID);
		await card.locator('button[data-islem=sil]').click();
		await page.waitForFunction(()=>cagrilar.some(c=>c.islem=='sil'));
		assert.deepEqual(await page.evaluate(()=>cagrilar.find(c=>c.islem=='sil').ids),[expected.id]);
		// Yetki hem araç çubuğunda hem yeniden üretilen hücrelerde yansır.
		await page.evaluate(()=>{MQLogin.current={musterimi:true,yetkiVarmi:()=>false,yetkiClauseDuzenle:({sent,clauses})=>sent.where.degerAta('M1',clauses.musteri)};p.tazele()});
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().every(r=>r.mustKod=='M1'));
		await page.waitForTimeout(100);
		assert.equal(await page.locator('.kontor-toolbar button#yeni').isVisible(),false);
		assert.equal(await page.locator('.kontor-grid-har button[data-islem]').count(),0);
		await page.evaluate(()=>{MQLogin.current={adminmi:true,yetkiVarmi:()=>true,yetkiClauseDuzenle:()=>{}};p.tazele()});
		await page.waitForFunction(()=>p.grids.har.gridWidget.getboundrows().length==85);
		for(const width of [1440,900,768,390,320]) {
			await page.setViewportSize({width,height:950}); await page.waitForTimeout(250);
			const layout=await page.evaluate(()=>{
				const root=document.querySelector('.kontor-shell'),oz=document.querySelector('.kontor-grid-ozet'),har=document.querySelector('.kontor-grid-har');
				return {client:root.clientWidth,scroll:root.scrollWidth,oz:oz.getBoundingClientRect().toJSON(),har:har.getBoundingClientRect().toJSON()};
			});
			if(layout.scroll>layout.client+2) {
				await page.screenshot({path:'/tmp/kontor-overflow.png',fullPage:true});
				console.log('OVERFLOW:',await page.evaluate(()=>Array.from(document.querySelectorAll('.kontor-shell *')).filter(e=>e.getBoundingClientRect().right>document.querySelector('.kontor-shell').getBoundingClientRect().right+2).slice(0,15).map(e=>{let s=getComputedStyle(e),r=e.getBoundingClientRect();return {cls:e.className,width:r.width,right:r.right,padding:s.padding,box:s.boxSizing,height:r.height}})));
			}
			assert.ok(layout.scroll<=layout.client+2,'Horizontal overflow at '+width+': '+JSON.stringify(layout));
			if(width<850) assert.ok(layout.har.y>layout.oz.y,'Grids should stack at '+width);
			console.log('LAYOUT',width,'no overflow, summary width:',layout.oz.width,'sales width:',layout.har.width);
		}
		assert.deepEqual(errors,[]);
		console.log('PASS: SQL totals, filters, summary selection, cellclick after virtualization, invoice scope, search, customer selection, permissions, responsive layout. SQL queries:',sql.length);
		if(process.env.KONTOR_SCREENSHOT) await page.screenshot({path:process.env.KONTOR_SCREENSHOT,fullPage:true});
	} finally { await browser.close();server.close();db.close(); }
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
