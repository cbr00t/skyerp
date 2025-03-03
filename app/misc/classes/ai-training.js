class AITraining01Part extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } 
    static get isWindowPart() { return true }
    static get partName() { return 'aiTraining01' }
    static get sinifAdi() { return 'AI Training 01 - Window' }

    constructor(e) {
	    e = e || {}; 
	    super(e);
	    $.extend(this, { 
	        myContext: e.context ?? {}, 
	        targetPersonName: qs.isim ?? qs.targetPersonName, 
	        title: e.title ?? this.class.sinifAdi 
	    });
	
	    this.soruCevapListesi = [
	        { soru: ["naber", "nasılsın", "nasılsın?", "nasıl gidiyor"], cevap: "İyiyim, teşekkür ederim!" },
	        { soru: ["merhaba", "selam", "hey"], cevap: "Merhaba! Sana nasıl yardımcı olabilirim?" },
	        { soru: ["hava nasıl", "bugün hava nasıl", "hava durumu"], cevap: "Hava durumu hakkında bilgim yok, ama umarım güzel bir gün geçiriyorsundur!" },
	        { soru: ["napıyorsun", "ne yapıyorsun", "ne yapmaktasın", "neler yapıyorsun"], cevap: "Ben senin sorularını cevaplıyorum! 😊" },
	        { soru: ["teşekkür ederim", "sağ ol"], cevap: "Rica ederim, her zaman buradayım!" },
	        
	        // 🔥 YENİ EKLENEN CEVAP:
	        { soru: ["yapay zeka", "ai", "yapay zeka hakkında ne düşünüyorsun"], cevap: "Yapay zeka hayatımızı kolaylaştıran ve hızla gelişen bir teknoloji!" }
	    ];
	}

    run(e) {
        e = e || {}; 
        super.run(e); 
        const { layout } = this, sender = this;
        const header = this.header = layout.children('.header'), 
              islemTuslari = this.islemTuslari = header.children('.islemTuslari');
        const subContent = this.subContent = layout.children('.content');

        // 🔹 İşlem Butonları Ekleniyor
        this.islemTuslariPart = new ButonlarPart({
            layout: islemTuslari,
            ekButonlarIlk: [
                { id: 'xtemizle', text: 'Temizle', handler: e => this.temizle(e) },
                { id: 'vazgec', handler: e => this.close(e) }
            ]
        });
        this.islemTuslariPart.run();

        // 🔹 Formun UI İçine Yüklenmesi
        let builder = this.getRootFormBuilder(e);
        if (builder) {
            const part = this, { myContext: inst } = this;
            $.extend(builder, { inst, part, layout: subContent });
            builder.autoInitLayout().run(e);
        }
    }

    getRootFormBuilder(e) {
        const { targetPersonName } = this;
        const rfb = new RootFormBuilder();
        
        rfb.addBaslik().setEtiket(`Merhaba ${targetPersonName || ''}, Nasıl yardımcı olabilirim?`);

        let form = rfb.addFormWithParent('soruCevapForm').altAlta();
        
        let altForm = form.addFormWithParent().yanYana();
            altForm.addTextInput('soru', 'Soru')
                .onBuildEk(({ builder: fbd }) => {
                    fbd.input.on('keyup', ({ key }) => {
                        key = key.toLowerCase();
                        if (key == 'enter' || key == 'linefeed') { this.cevapla(e) }
                    });
                })
                .onAfterRun(({ builder: fbd }) => this.fbd_soru = fbd);
            
            altForm.addButton('submit', 'Gönder').onClick(e => this.cevapla(e));

        form.addTextInput('cevap', 'Cevap').onAfterRun(({ builder: fbd }) => this.fbd_cevap = fbd);

        return rfb;
    }

    getLayoutInternal(e) {
        return $(`
            <div class="full-wh">
                <div class="header full-width">
                    <div class="islemTuslari"></div>
                </div>
                <div class="content full-width dock-bottom"></div>
            </div>`
        );
    }

    getCSSInternal(e) {
        return `.aiTraining01.part .butonlar.part { --button-width: 100px !important }
                .aiTraining01.part .header { height: 50px !important }`;
    }

    cevapla({ builder: fbd }) {
        let { myContext: inst } = this;
        let soru = inst.soru?.trim().toLowerCase();
        let cevap = "Üzgünüm, sorunu anlayamadım.";

        if (soru) {
            let eslesme = this.soruCevapListesi.find(item =>
                item.soru.some(pattern => this.kelimeBenzerMi(soru, pattern))
            );
            if (eslesme) cevap = eslesme.cevap;
        }

        // 🔹 UI Güncellenmesi ve Fokus Ayarı
        inst.cevap = this.fbd_cevap.value = cevap;
        this.fbd_soru.input.focus();
    }

    temizle(e) {
        this.fbd_soru.value = "";
        this.fbd_cevap.value = "";
        this.fbd_soru.input.focus();
    }

    kelimeBenzerMi(input, pattern) {
        return input === pattern || input.includes(pattern);
    }
}
