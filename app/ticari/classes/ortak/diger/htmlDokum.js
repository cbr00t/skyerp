class HTMLDokum extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get doc() {
		let {_doc: result} = this; if (!result) {
			let {sablon, parser} = this; if (!sablon) { return null }
			result = this._doc = parser.parseFromString(sablon, 'text/html')
		}
		return result
	}
	set doc(value) { this._doc = value }
	get sablon() { return this._sablon } set sablon(value) { this._sablon = value; this.doc = null }
    constructor(e, _tableSeq, _headerRowCount) {
		e = e ?? {}; super(e); if (typeof e != 'object') { e = { sablon: e } }
		$.extend(this, {
			tableSeq: e.tableSeq ?? e.tabloNo ?? _tableSeq,
			headerRowCount: e.headerRowCount ?? e.headerCount ?? e.baslikSatirSayisi ?? e.baslikSayisi ?? _headerRowCount,
			parser: new DOMParser()
		})
		let sablon = e.sablon ?? e.sablonText ?? e.sablon ?? e.html ?? e.htmlString ?? e.elm;
		if (isFunction(sablon) || sablon?.run) { sablon = getFuncValue.call(this, sablon, { ...e, sender: this }) }
		if (sablon?.html) { sablon = sablon[0] } this.sablon = sablon?.outerHTML ?? sablon
    }
    /** HTML içerisinde geçen tüm köşeli parantez içindeki ifadeleri tarar. Bunları bir liste halinde döndürür */
    extractKeys() {
		let doc = this.getDocWithError(), htmlText = this.doc.documentElement.outerHTML;
        let matches = [...htmlText.matchAll(/\[([A-Z0-9-_]+)\]/g)], keys = asSet([...new Set(matches.map(m => m[1]))]); /* Tekrar edenleri kaldır */
        return keys
    }
    /** Belirtilen map içeriğine göre şablondaki değişkenleri değiştirir */
    searchAndReplace(dict, rootElement) {
		rootElement = rootElement ?? this.getDocWithError(); rootElement = rootElement?.documentElement ?? rootElement;
        let elms = [...rootElement.querySelectorAll('*')]; for (let key in dict) {
			let regex = new RegExp(`\\[${key}\\]`, 'g');
			for (let elm of elms) { let {childNodes} = elm;
				if (childNodes.length == 1 && childNodes[0].nodeType == Node.TEXT_NODE) { elm.textContent = elm.textContent.replace(regex, dict[key]) }
				else { elm.innerHTML = elm.innerHTML.replace(regex, dict[key]) }
			}
        }
		return this
    }
    /** Detay tablosunu güncelleyerek belirtilen detayları ekler */
    updateDetayTable(tableSeq , headerRowCount, detaylar, dip) {
		tableSeq = tableSeq ?? 1; headerRowCount = headerRowCount ?? 1; if (tableSeq < 1) { return false } 
        let doc = this.getDocWithError(), tables = doc.querySelectorAll('table')[tableSeq - 1];
		if (tableSeq > tables.length) { throw new Error('Geçersiz tablo numarası') }
	    let rows = [...tables.querySelectorAll('tr')]; if (rows.length < headerRowCount + 1) throw new Error('Tabloda yeterli satır bulunmuyor');
	    let detayRowTemplate = rows[headerRowCount].outerHTML,detayHTML = detaylar.map(item => 
	        Object.keys(item).reduce((rowHTML, key) => 
	            rowHTML.replace(new RegExp(`\\[${key}\\]`, 'g'), item[key]), 
	            detayRowTemplate)
	    ).join('');
	    rows[headerRowCount].outerHTML = detayHTML;
	    if (dip && rows[headerRowCount + 1]) {
	        let dipRow = rows[headerRowCount + 1];
	        for (const key in dip) { dipRow.innerHTML = dipRow.innerHTML.replace(new RegExp(`\\[${key}\\]`, 'g'), dip[key]) }
	    }
    }
    /** Tüm işlemleri yürütüp güncellenmiş HTML çıktısını döndürür */
    process(e) {
		e = e ?? {}; let doc = this.getDocWithError();
		let data = e.data ?? e.rec ?? e;
		if (isFunction(data) || data?.run) { let keys = this.extractKeys(e); data = getFuncValue.call(this, data, { ...e, sender: this, keys }) }
		let {baslik, detaylar, dip} = data, {tableSeq, headerRowCount} = this, sender = this;
		this.searchAndReplace(baslik); this.updateDetayTable(tableSeq, headerRowCount, detaylar, dip);
        let {outerHTML: result} = doc.documentElement; return { sender, doc, data, result }
    }
	getDocWithError() { let {doc} = this; if (!doc) { throw new Error('Şablon HTML belirsizdir') } return doc }
	static test() {
		// Kullanım:
		let tableSeq = 1, sablon = e => {
			return `
<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name=Generator content="Vio">
	<title>VioWeb Konsinye Lojistik Teslimat Mail Dökümü</title>
</head>
<body>
	<h1>SAYIN <b>[MUSTUNVAN]</b>,</h1><br/>
	<h4>
		<font color="#333333">
			[SEVKADRES1]<br/>
			[SEVKADRES2]<br/>
		</font>
	</h4>
	<p/>
	<h3>
		<b>[SABLONADI]</b> için <b>[KLFIRMAADI]</b> <i>[TESLIMYERIADIPARANTEZLI]</i> firmasına [TARIH] tarihinde<br/>
		vermiş olduğunuz aşağıdaki siparişler, [TESLIMTARIHIVARTEXT]<b><i><u>[SERI] [FISNO]</u></i></b> referans numarası ile onaylanmıştır:<br/>
	</h3>

	<table width="100%" border="0" style="border: black solid thin;">
		<tr>
			<th align="center" style="background-color: azure;"><b>Ürün</b></th>
			<th align="center" style="background-color: azure;"><b>Ürün Adı</b></th>
			<th align="center" style="background-color: azure;"><b>Miktar</b></th>
			<th align="center" style="background-color: azure;"><b>Brm</b></th>
			<th align="center" style="background-color: azure;"><b>Fiyat</b></th>
			<th align="center" style="background-color: azure;"><b>Bedel</b></th>
		</tr>
		<tr>
			<td>[STOKKOD]</td>
			<td>[STOKADI]</td>
			<td align="right">[MIKTAR]</td>
			<td>[BRM]</td>
			<td align="right">[FIYAT]</td>
			<td align="right">[BEDEL]</td>
		</tr>
		<tr>
			<td><b></b></td>
			<td><b></b></td>
			<td align="right"><hr/><b>[TOPMIKTAR]</b></td>
			<td><hr/><b>[BRM]</b></td>
			<td><b></b></td>
			<td align="right"><hr/><b>[TOPBEDEL]</b></td>
		</tr>
	</table>
	
	<br/>
	
	<h3>[EKNOTLAR]</h3>
	
	<br/>
	
	Yetkili: <b>[CRO-OZTEMSILCI]</b><br/>
	İrtibat No: <b>[CRO-OZTELEFON]</b><br/>
</body>
</html>
` };
		let fisDokumu = new this({ sablon, tableSeq });
		/* **Öncelikle hangi veri sahalarının gerektiğini öğrenelim** */
		let requiredFields = fisDokumu.extractKeys();
		console.log('Gerekli Veri Alanları:', requiredFields);
		/* **Daha sonra elde edilen sahalara göre veriyi oluşturup şablonu işleyelim** */
		let data = ({ keys }) => ({
		    baslik: { SABLONADI: 'Unlu Mamüller', KLFIRMAADI: 'FALANCA A.Ş.' },
		    detaylar: [
		        { STOKKOD: 's1', STOKADI: 'Börek', MIKTAR: 1.3, BRM: 'KG' },
		        { STOKKOD: 's2', STOKADI: 'Yaş Pasta', MIKTAR: 2, BRM: 'AD' },
		        { STOKKOD: 's3', STOKADI: 'Baklava', MIKTAR: 1, BRM: 'KG' }
		    ],
		    dip: { TOPMIKTAR: '2.3\r\n2', BRM: 'KG\r\nAD' }
		});
		/* **Verileri işleyip yeni HTML çıktısını alalım** */
		return fisDokumu.process(data)
	}
}
