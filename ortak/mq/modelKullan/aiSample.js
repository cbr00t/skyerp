class ComboBoxPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }

    constructor(e = {}) {
        super(e);
        this.initCoreProperties(e);
        this.initConfigurations(e);
        this.initDataAdapter(e);
        this.initEvents();
    }

    /* Temel Özellikler */
    initCoreProperties(e) {
        // Property'lerin tip güvenliği için Object.assign yerine tek tek atama
        this.mfSinif = e.mfSinif;
        this.kodSaha = e.kodSaha || (this.mfSinif?.kodSaha || 'kod');
        this.adiSaha = e.adiSaha || (this.mfSinif?.adiSaha || 'adi');
        this.coklu = asBool(e.coklu);
        this.autoBind = e.autoBind ?? true;
        this.widgetType = e.isDropDown ? 'jqxDropDownList' : 'jqxComboBox';
        this.includeEmpty = e.includeEmpty ?? false;
        this._value = e.value;
    }

    /* DataAdapter Yapılandırması */
    initDataAdapter() {
        this.dataAdapter = new $.jqx.dataAdapter({
            url: 'empty.json', // Fake endpoint
            datatype: 'json',
            loadServerData: async (data, status, xhr) => {
                const [total, records] = await this.loadServerData({
                    search: this.widget.searchString,
                    pageIndex: data.pagenum,
                    pageSize: data.pagesize
                });
                
                return {
                    totalrecords: total,
                    records: this.processRecords(records)
                };
            }
        });
    }

    /* Veri Yükleme ve İşleme */
    async loadServerData(params) {
        let data = [];
        let total = 0;
        
        try {
            if(this.mfSinif) {
                const response = await this.mfSinif.loadServerData({
                    search: params.search,
                    page: params.pageIndex,
                    pageSize: params.pageSize
                });
                data = response.records;
                total = response.total;
            }
        } catch(e) {
            console.error('Veri yükleme hatası:', e);
            data = [];
            total = 0;
        }

        return [total, data];
    }

    processRecords(records) {
        if(this.includeEmpty) {
            return [{ [this.kodSaha]: '', [this.adiSaha]: '- Seçiniz -' }, ...records];
        }
        return records;
    }

    /* Value Yönetimi */
    val(value) {
        if(value === undefined) {
            return this.widget.val();
        }
        
        this._value = value;
        this.widget.val(value);
        return this;
    }

    /* Widget Özel Render İşlemleri */
    getSelectionRenderer() {
        return (html, index, label, value) => {
            if(this.coklu) {
                const items = this.widget.getCheckedItems();
                return items.map(i => i.label).join(', ');
            }
            return label;
        };
    }

    /* Event Handler'lar */
    initEvents() {
        this.widget.on('change', (e) => {
            this._value = this.widget.val();
            this.trigger('change', this._value);
        });
    }

    /* Fluent API Geliştirmeleri */
    withMF(mfSinif) {
        this.mfSinif = mfSinif;
        return this.dataBind();
    }

    withEmptyItem(text = '- Seçiniz -') {
        this.includeEmpty = true;
        return this;
    }

    /* Yeniden Bind İşlemi */
    dataBind() {
        this.widget.source = this.dataAdapter;
        if(this.autoBind) {
            this.widget.dataBind();
        }
        return this;
    }

    /* Destructor */
    destroy() {
        this.widget.off('change');
        super.destroy();
    }
}
