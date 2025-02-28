class AIPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get isWindowPart() { return true; }            // pencere olarak açılsın
    static get partName() { return 'aiQuery'; }           // pencere template id diyelim
    static get sinifAdi() { return 'AI Sorgu Ekranı'; }

	constructor(e) { super(e); this.title = e?.title ?? this.class.sinifAdi }
    run(e) {
        super.run(e); const {layout} = this, part = this;
        // RootFormBuilder ile form oluştur
        const builder = new RootFormBuilder({ layout, part }); 
		// Form alanlarını manuel ekliyoruz:
		// let form = builder.addFormWithParent(); 
		let form = builder.addFormWithParent('soruForm').altAlta().addStyle_wh(500, 'auto');
		//form.addTextInput('question', 'Sorunuz').addStyle_fullWH(null, 100);    // addStyle_fullWH { width: undefined/null == 100% , height = 100px }
		form.addTextArea('question', 'Sorunuz').setCols(50).addStyle_fullWH(null, 100);      // TextArea genişliği genellikle cols= attr göre çalışır
		form.addButton('submit', 'Gönder').onClick(e => this.onSubmit()).addStyle_wh('40%', 50);
		// bir de yanıt göstermek için:
		form.addTextArea('answer', 'Cevap').readOnly().setCols(50).addStyle_wh(null, 100);  // TextArea genişliği genellikle cols= attr göre çalışır
		builder.autoInitLayout(); // HTML yerleşimini oluştur
		builder.run()
    }

    onSubmit() {
        const question = this.layout.find('[data-builder-id = question] > textarea').val();
        // Normalde burada AI API çağrısı yapılır, sonucu alırız.
        // Biz demo için sabit bir cevap verelim:
        this.layout.find('[data-builder-id = answer] > textarea').val("Demo cevap: " + question);
    }
	// LayoutBase::getLayoutInternal(e)
	getLayoutInternal(e) { return $(`<div/>`) }
}
