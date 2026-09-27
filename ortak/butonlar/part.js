class ButonlarPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'butonlar' } static get isSubPart() { return true }
	static get templates() { let result = this._templates; if (!result) { result = this._templates = {}; this.templatesOlustur({ result }) } return result }

	constructor(e = {}) {
		super(e)
		let { sender = this.parentPart, sagButonIdSet, ekSagButonIdSet, prepend } = e
		prepend = asBool(prepend)
		sagButonIdSet ??= asSet(['tamam', 'kaydet', 'tazele', 'sec', 'vazgec', 'temizle', 'sil'])
		ekSagButonIdSet = asSet(ekSagButonIdSet) ?? {}

		extend(this, { sender, prepend, sagButonIdSet, ekSagButonIdSet })
		;['ekButonlarIlk', 'ekButonlarSon'].forEach(k =>
			this[k] = e[k] ?? [])
		mergeInto(e, this, 'builder', 'tip', 'id2Handler', 'butonlarDuzenleyici', 'userData')
	}
	runDevam(e = {}) {
		super.runDevam(e)
		
		this.butonlariOlustur(e)
		
		// let { layout } = this
		// layout.addClass('flex-row')
		delay(10).then(() =>
		requestAnimationFrame(() =>
			this.initResponsiveButtons(e)))
		
		//makeScrollable(layout)
	}
	destroyPart(e) {
		super.destroyPart(e)
		let { layout } = this
		if (layout?.length) {
			let btns = layout.find('button')
			if (btns?.length)
				btns.jqxButton('destroy')
			layout.empty()
		}
		this.layout = null
	}
	butonlariOlustur(e) {
		let { tip, class: { templates } } = this
		let builder = templates[tip]
		let liste = ( builder ? getFuncValue.call(this, builder, e) : null ) ?? []
		if (!isObject(liste))
			return false
		
		this.butonlariEkle({ ...e, liste })
		return true
	}
	butonlariEkle(e = {}) {
		let { parentPart, builder, userData, ekButonlarIlk, ekButonlarSon } = this
		let { sagButonIdSet = {}, ekSagButonIdSet } = this
		let { butonlarDuzenleyici, layout, prepend, id2Handler = {} } = this
		let { sender = this, liste: _liste = e.liste } = e
		
		let liste = []
		if (!empty(ekButonlarIlk))
			liste.push(...ekButonlarIlk)
		if (!empty(_liste))
			liste.push(..._liste)
		if (!empty(ekButonlarSon))
			liste.push(...ekButonlarSon)

		for (let k in liste) {
			let r = liste[k]
			if (!isObject(r))
				r = { id: r, text: '' }
			liste[k] = r
		}
		
		if (butonlarDuzenleyici) {
			let _e = { ...e, sender, parentPart, builder, part: this, userData, liste }
			let res = butonlarDuzenleyici?.call(this, _e)
			if (isObject(res))
				res = result.res ?? res
			liste = res ?? _e.liste
		}

		layout.empty()
		let parents = {
			sol: ( this.sol = $(`<div class="sol"/>`) ),
			sag: ( this.sag = $(`<div class="sag"/>`) ),
		}
		for (let r of liste) {
			let { id, toolTip, text, args, handler } = r
			let { priority, sabit, overflowText } = r
			toolTip ||= text || id
			priority ||= 50
			let btn = $(
				`<button id="${id}"
					title="${toolTip || ''}"
					data-priority="${priority}"
					data-sabit="${asBool(sabit)}"
				>` +
					(text || '') +
				`</button>`
			)
			let sagmi = (
				(sagButonIdSet && sagButonIdSet[id]) ||
				(ekSagButonIdSet && ekSagButonIdSet[id])
			)
			let container = parents[sagmi ? 'sag' : 'sol']
			btn[prepend ? 'prependTo' : 'appendTo'](container)
			btn.jqxButton({ theme, ...args})

			btn.data('item', r)
			if (handler)
				btn.data('handler', handler)
			
			let eventHandler = async (event, handler) => {
				let { currentTarget: target } = event
				let { id } = target
				let button = $(target)
				handler = button.data('handler') ?? id2Handler[id]
				
				let _e = { parentPart, sender, builder, userData, event, id, button }
				setButonEnabled(button, false)
				
				try {
					await handler?.call?.(this, _e)
				}
				catch (ex) {
					let msg = getErrorText(ex)
					cerr(ex)
					if (msg)
						deferExec('errorHandler', () => hConfirm(msg), 10)
				}
				finally { setTimeout(() => setButonEnabled(button, true), 800) }
			}
			
			if (handler || id2Handler[id]) {
				btn.on('click', async evt => {
					try {
						await eventHandler(evt)
					}
					catch (ex) {
						if (ex?.code == ex?.ABORT_ERR)
							return
						let errText = getErrorText(ex)
						if (errText) {
							cerr(ex)
							hConfirm(errText)
						}
						// throw ex
					}
				})
			}
		}
		
		;values(parents).forEach(elm =>
			elm.appendTo(layout))
		
		;{
			let btns = parents.sag.children('button')
			layout.css('--width-sag', `calc((var(--button-right) * ${btns.length}) + var(--width-sag-ek))`)
		}
	}
	initResponsiveButtons(e = {}) {
	    let { layout, sag, partName } = this
	    let btnOvr = this.overflowButton = $(`
	        <button
	            type="button"
	            class="overflow-button"
	            title="Diğer işlemler"
	            aria-label="Diğer işlemler"
			>
	            ⋯
	        </button>
	    `)
		btnOvr.jqxButton({ theme })
	
		let menuOvr = this.overflowMenu =
			$(`<div class="butonlar-overflow-menu"></div>`)
	    btnOvr
	        .hide()
	        .insertBefore(sag)
	        .on('click', evt => {
				let { overflowMenu: menuOvr } = this
	            evt.stopPropagation()
	            menuOvr.toggleClass('open')
	        })
		
	    menuOvr.appendTo(layout)

		let updateProc = () => {
			if (this._responsiveRAF)
				return
			this._responsiveRAF = requestAnimationFrame(() => {
				this._responsiveRAF = null
				this.updateResponsiveButtons()
			})
		}
		
		let obsrv = this._resizeObserver =
			new ResizeObserver(updateProc)
		
		obsrv.observe(layout[0])
		obsrv.observe(this.sol[0])
		obsrv.observe(this.sag[0])
		
		$(window).on(`resize.${partName}`, updateProc)
		if (window.visualViewport)
			$(window.visualViewport).on(`resize.${partName}`, updateProc)
		
		updateProc()
	
	    /*let obsrv = this._resizeObserver = new ResizeObserver(() => {
			deferExec('butonlarPart-onResize', () =>
				requestAnimationFrame(() =>
				this.updateResponsiveButtons(), 10))
		})*/
	
	    $(document).on(`click.${partName}`, () => 
	        this.overflowMenu.removeClass('open'))
	
	    this.updateResponsiveButtons()
	}
	updateResponsiveButtons() {
		let {
			layout, sol,
			overflowButton: btnOvr,
			overflowMenu: menuOvr
		} = this
		if (!(layout?.length && sol?.length && btnOvr?.length))
			return
	
		let btns = sol.children('button')
		
		// Her ölçümde canonical duruma dön
		btns.removeClass('overflow-hidden')
		btnOvr.hide()
	
		let solEl = sol[0]
		// Buradaki hesabı browser yapsın.
		// gap, zoom, DPR, devtools mobile vs. otomatik dahil.
		let sigiyormu = () =>
			solEl.scrollWidth <= solEl.clientWidth
	
		// Overflow butonu olmadan bütün butonlar sığıyorsa hiçbir şey yapma.
		if (sigiyormu()) {
			menuOvr.removeClass('open').empty()
			return
		}
	
		// Artık gerçekten overflow var.
		//    Butonu gösterdiğimiz anda flex layout yeniden hesaplanır
		//    ve .sol biraz daha daralır
		btnOvr.show()

		// sabit olmayanlardan, priority yükseklar öncelikli (ters sıra)
		let candidates = btns
			.filter((_, el) =>
				!asBool($(el).attr('data-sabit')))
			.toArray()
			.sort((a, b) =>
				Number($(b).attr('data-priority')) -
				Number($(a).attr('data-priority'))
			)
	
		// Hesabı elle yapmak yerine her buton gizlendikten sonra
		//     gerçek layout'a tekrar soruyoruz
		for (let elm of candidates) {
			if (sigiyormu())
				break
			$(elm).addClass('overflow-hidden')
		}
	
		// Eğer sabit butonlar yüzünden halen sığmıyorsa burada hiçbir şey yapmıyoruz.
		//     CSS overflow clipping geri kalanını yiyecek
		menuOvr.empty()
		btns
			.filter('.overflow-hidden')
			.toArray()
			.sort((a, b) =>
				Number($(a).attr('data-priority')) -
				Number($(b).attr('data-priority'))
			)
			.forEach(elm => {
				let btn = $(elm)
				let item = btn.data('item') || {}
				let text =
					item.overflowText ||
					item.toolTip ||
					item.text ||
					item.id
				
				let ovrItem = $('<button type="button" class="overflow-item"/>')
					.html(text)
					.appendTo(menuOvr)
					.on('click', evt => {
						evt.stopPropagation()
						menuOvr.removeClass('open')
						btn.trigger('click')
					})
				ovrItem.jqxButton({ theme })
			})
	}
	
	static templatesOlustur({ result: res }) {
		extend(res, {
			tazeleVazgecSec(e) { return ['tazele', { id: 'sec', toolTip: 'Seç', priority: 8, args: { template: 'success' } }, 'vazgec'] },
			tazeleVazgec(e) { return ['tazele', 'vazgec'] },
			tamamVazgec(e) { return [{ id: 'tamam', toolTip: 'Tamam', priority: 13, args: { template: 'success' } }, 'vazgec'] },
			tamam(e) { return [{ id: 'tamam', toolTip: 'Tamam', priority: 13, args: { template: 'success' } }] },
			vazgec(e) { return ['vazgec'] },
			yazdirVazgec(e) { return [{ id: 'yazdir', toolTip: 'Yazdır', priority: 35, args: { template: 'success' } }, 'vazgec'] }
		})
	}
}
