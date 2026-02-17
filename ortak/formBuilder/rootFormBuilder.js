class RootFormBuilder extends SubPartBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get isRootFormBuilder() { return true }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			superPartClass: e.superPartClass, isSubPart: e.isSubPart ?? false, isWindow: e.isWindow,
			content: e.content, title: e.title, isModal: e.isModal, canDestroy: e.canDestroy, formDeferMS: e.formDeferMS,
			wndClassNames: e.wndClassNames, noFullHeightFlag: e.noFullHeightFlag ?? e.noFullHeight,
			asyncRunFlag: e.asyncRunFlag, partArgs: e.partArgs, partInit: e.partInit ?? e.partInitBlock,
			wndArgs: e.wndArgs, wndArgsDuzenle: e.wndArgsDuzenle ?? e.wndArgsDuzenleBlock
		})
	}
	build(e) {
		e = e || {}; super.build(e); const {builders} = this; let {part} = this;
		for (const key in builders) { const builder = builders[key]; builder.rootBuilder = this }
		if (part) {
			let {partArgs} = this; const {partInit} = this;
			if (partInit) {
				partArgs = $.extend({}, partArgs || {});
				getFuncValue.call(this, partInit, { sender: this, part, partArgs, builder: this, builderArgs: e });
			}
			if (!$.isEmptyObject(partArgs)) $.extend(part, partArgs)
		}
		else {
			const superPartClass = this.superPartClass || Part;
			const partClass = class FormBuilderAutoPart extends superPartClass {
				static get isSubPart() { return this.builder.isSubPart ?? super.isSubPart }
				static get asyncRunFlag() { return this.builder.asyncRunFlag ?? super.asyncRunFlag }
				static get isWindowPart() { return this.builder.isWindow ?? super.isWindowPart }
				static get wndDefaultIsModal() { return this.builder.isModal ?? super.wndDefaultIsModal }
				static get partName() { return this.builder.id ?? super.partName }
				static get canDestroy() { return true /*this.builder.canDestroy ?? super.canDestroy*/ }
				static get isCloseable() { return true /*this.builder.canDestroy ?? super.canDestroy*/ }
				static get noFullHeightFlag() { return this.builder.noFullHeightFlag ?? super.noFullHeightFlag }
				static get wndClassNames() { return this.builder.wndClassNames ?? super.wndClassNames }
				get formDeferMS() { return this.class.builder.formDeferMS ?? super.formDeferMS }
				constructor(e) {
					e = e || {}; super(e); const {builder} = this.class;
					let {layout} = builder; if (!layout?.length) { layout = builder.parent } if (!layout?.length) { layout = $('<div/>') } 
					$.extend(this, {
						builder, parentPart: builder.parentPart, content: builder.content, layout, title: builder.title, wndArgs: builder.wndArgs,
						wndArgsDuzenleBlock: builder.wndArgsDuzenleBlock || builder.wndArgsDuzenle
					});
					let {partArgs} = builder; const {partInit} = builder;
					if (partInit) { partArgs = $.extend({}, partArgs || {}); getFuncValue.call(this, partInit, { sender: this, part: this, partArgs, builder, builderArgs: this.class.builderArgs }) }
					if (!$.isEmptyObject(partArgs)) { $.extend(this, partArgs) }
				}
				afterRun(e) {
					super.afterRun(e); const {isWindowPart} = this;
					if (isWindowPart) {
						const {builder} = this.class, {wnd, partName} = this;
						if (wnd?.length) {
							const {CSSClass_BuilderId, CSSClass_FormBuilder, CSSClass_FormBuilderElement} = FormBuilderBase;
							if (wnd.hasClass('tabbedWindow')) { wnd.children('.wnd-content').prop('id', partName) } else { wnd.prop('id', partName) }
							wnd.attr(`data-${CSSClass_BuilderId}`, builder.id); builder.getElementId(wnd);
							wnd.addClass(`part ${CSSClass_FormBuilder} ${CSSClass_FormBuilderElement}`); wnd.data('builder', builder)
						}
						$.extend(builder, { wnd }); this.show()
					}
				}
				destroyPart(e) {
					const {builder} = this.class; if (builder.destroyPart) { builder.destroyPart(e) }
					return super.destroyPart(e)
				}
				wndArgsDuzenle(e) { super.wndArgsDuzenle(e); /*const {wndArgs} = this.class.builder; if (wndArgs) $.extend(this.wndArgs, wndArgs);*/ }
			};
			$.extend(partClass, { builder: this, builderArgs: e });
			part = this.part = new partClass(e); part.run();
			this.layout = part.layout
		}
		e.rootPart = e.part = part
		let {layout} = this
		if (!layout?.length)
			layout = this.layout = part.layout
	}
	postRun(e) {
		super.postRun(e)
		$.extend(e, { builder: this, temps: e.temps || {} });
		if (!this._afterRun_calistimi) {
			let {afterRun} = this
			if (afterRun)
				getFuncValue.call(this, afterRun, e)
			this._afterRun_calistimi = true
		}
	}

	asWindow(title) { this.isWindow = true; if (title !== undefined) this.title = title; return this }
	asForm() { this.isWindow = false; return this }
	onPartInit(handler) { this.partInit = handler; return this }
	setWndArgs(args) { this.wndArgs = args; return this }
	onWndArgsDuzenle(handler) { this.wndArgsDuzenle = handler; return this }
	asyncRun() { this.asyncRunFlag = true; return this }
	syncRun() { this.asyncRunFlag = false; return this }
}



/*

layout = app.layout.find('.container');
if (!layout.length)
	layout = $(`<div class="container" style="position: absolute; top: 100px; left: 300px; background-color: aqua; width: 400px; height: 200px;">abc</div>`);
layout.appendTo(app.layout);
rfb = new RootFormBuilder({
	parentPart: app,
	isSubPart: true,
	id: 'root-form',
	parent: layout,
	afterRun: e => {
		// debugger
	},
	builders: [
		new FormBuilder({
			id: 'subform-1',
			builders: [
				new (class extends SubPartBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
					buildDevam(e) {
						const {parent} = this;
						const layout = this.layout = $(`<div class="altForm-1"><button id="test1">TEST 1</button><button id="test2">TEST 2</button></div>`);
						const buttons = layout.find('button');
						buttons.jqxButton({ theme: theme, width: 200, height: 50 });
						buttons.on('click', evt =>
							displayMessage(evt.currentTarget.id, 'buton tıklandı'));
						layout.appendTo(parent);
					}
				})({ id: 'subpart-1', args: 'abc' })
			]
		})
	]
});
rfb.run();
rfb;


layout = app.layout.find('.container');
if (!layout.length)
	layout = $(`<div class="container" style="position: absolute; top: 100px; left: 300px; background-color: aqua; width: 400px; height: 200px;">abc</div>`);
layout.appendTo(app.layout);
rfb = new RootFormBuilder({
	parentPart: app,
	isSubPart: true,
	id: 'root-form',
	parent: layout,
	afterRun: e => {
		// debugger
	},
	builders: [
		new FormBuilder({
			id: 'subform-1',
			builders: [
				new TestButtonFormBuilder({ id: 'test-buttons-form-1', args: 'subpart 1' }),
				new TestButtonFormBuilder({ id: 'test-buttons-form-2', args: 'subpart 2' })
			]
		})
	]
});
rfb.run();
rfb;


layout = app.layout.find('.container');
if (!layout.length)
	layout = $(`<div class="container" style="background-color: aqua; width: 500px; height: 500px;">abc</div>`);
// layout.appendTo(app.layout);
new FormBuilder({
	parentPart: app,
	isSubPart: false,
	isModal: true,
	id: 'abc',
	parent: layout,
	afterRun: e => {
		// debugger
	},
	builders: [
		new FormBuilder({
			id: 'subform-1',
			builders: [
				new (class extends SubPartBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
					buildDevam(e) {
						const {parent} = this;
						const layout = this.layout = $(`<div class="altForm-1"><button id="test1">TEST 1</button><button id="test2">TEST 2</button></div>`);
						const buttons = layout.find('button');
						buttons.jqxButton({ theme: theme, width: 200, height: 50 });
						buttons.on('click', evt =>
							displayMessage(evt.currentTarget.id, 'buton tıklandı'));
						layout.appendTo(parent);
					}
				})({ id: 'subpart-1', args: 'abc' })
			]
		})
	]
}).asWindow('test');
rfb.run();
rfb;

*/
