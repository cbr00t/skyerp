class HTMLDokum extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
    constructor(e) {
		e = e ?? {}; super(e); if (typeof e != 'object') { e = { text: e } }
		let text = e.text ?? e.sablonText ?? e.sablon ?? e.htmlString ?? e.elm;
		if (text?.html) { text = text[0] } text = text?.outerHTML ?? text;
        let parser = this.parser = new DOMParser(); this.doc = parser.parseFromString(text, 'text/html');
    }
    /** HTML içerisinde geçen tüm köşeli parantez içindeki ifadeleri tarar. Bunları bir liste halinde döndürür */
    extractKeys() {
        let htmlText = this.doc.documentElement.outerHTML;
        let matches = [...htmlText.matchAll(/\[([A-Z0-9-_]+)\]/g)];
        let keys = [...new Set(matches.map(m => m[1]))]; // Tekrar edenleri kaldır
        return keys
    }
    /** Belirtilen map içeriğine göre şablondaki değişkenleri değiştirir */
    searchAndReplace(dict, rootElement) {
		rootElement = rootElement ?? this.doc; rootElement = rootElement?.documentElement ?? rootElement;
        for (let key in dict) {
			let elms = [...rootElement.querySelectorAll('*')].filter(elm => elm.innerHTML.includes(`[${key}]`));
			for (let elm of elms) { elm.innerHTML = elm.innerHTML.replace(new RegExp(`\\[${key}\\]`, "g"), dict[key]); }
        }
		return this
    }
    /** Detay tablosunu güncelleyerek belirtilen detayları ekler */
    updateDetayTable(tableSeq, headerRowCount, detaylar, dip) {
        let {doc} = this, tables = doc.querySelectorAll('table');
        if (tableSeq < 1 || tableSeq > tables.length) { throw new Error('Geçersiz tablo numarası') }
        let table = tables[tableSeq - 1], rows = table.querySelectorAll('tr');
        if (rows.length < headerRowCount + 1) { throw new Error('Tabloda yeterli satır bulunmuyor') }
        let {outerHTML: detayRowTemplate} = rows[headerRowCount];
        let detayHTML = detaylar.map(item => {
            let rowHTML = detayRowTemplate; for (let key in item) {
				rowHTML = rowHTML.replace(new RegExp(`\\[${key}\\]`, 'g'), item[key]) }
            return rowHTML
        }).join('');
        rows[headerRowCount].outerHTML = detayHTML;
        if (dip) {
            let dipRowIndex = headerRowCount + detaylar.length;
            if (dipRowIndex < rows.length) {
                let dipRow = rows[dipRowIndex]; for (let key in dip) {
					dipRow.innerHTML = dipRow.innerHTML.replace(new RegExp(`\\[${key}\\]`, 'g'), dip[key]) }
            }
        }
    }
    /** Tüm işlemleri yürütüp güncellenmiş HTML çıktısını döndürür */
    process(e) {
		e = e ?? {}; let data = e.data ?? e.rec ?? e, {baslik, detaylar, dip} = data, {doc} = this, sender = this;
        this.searchAndReplace(baslik); this.updateDetayTable(1, 1, detaylar, dip);
        return {outerHTML: result} = doc.documentElement; return { sender, doc, data, outerHTML }
    }
	static test() {
		// Kullanım:
		let htmlString = `<!DOCTYPE HTML> ...`; // Burada şablon HTML içeriği olacak.
		let fisDokumu = new this(htmlString);
		
		// **Öncelikle hangi veri sahalarının gerektiğini öğrenelim**
		let requiredFields = fisDokumu.extractKeys();
		console.log('Gerekli Veri Alanları:', requiredFields);
		
		// **Daha sonra elde edilen sahalara göre veriyi oluşturup şablonu işleyelim**
		let data = {
		    baslik: { SABLONADI: 'Unlu Mamüller', KLFIRMAADI: 'FALANCA A.Ş.' },
		    detaylar: [
		        { STOKKOD: 's1', STOKADI: 'Börek', MIKTAR: 1.3, BRM: 'KG' },
		        { STOKKOD: 's2', STOKADI: 'Yaş Pasta', MIKTAR: 2, BRM: 'AD' },
		        { STOKKOD: 's3', STOKADI: 'Baklava', MIKTAR: 1, BRM: 'KG' }
		    ],
		    dip: { TOPMIKTAR: '2.3\r\n2', BRM: 'KG\r\nAD' }
		};
		
		// **Verileri işleyip yeni HTML çıktısını alalım**
		let updatedHTML = fisDokumu.process(data); console.log(updatedHTML)
	}
}
