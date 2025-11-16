class Boot {
	static { window[this.name] = this } static get layoutName() { return 'boot-layout'}
	get class() { return this.constructor || this.__proto__.constructor }
	get max() { return this.progress.max } set max(value) { this.progress.max = value }
	run() {
		let {layoutName} = this.class, template = document.querySelector(`template#${layoutName}`)
		let layout = this.layout = template?.content?.querySelector('div')
		this.progress = layout?.querySelector('progress')
		layout?.classList.add(layoutName, 'part')
		if (layout)
			document.body.appendChild(layout)
	}
	reset() { const {progress} = this; if (progress) { progress.value = null; progress.hidden = true } return this }
	step() { const {progress} = this; if (progress) { progress.hidden = false; progress.value = (progress.value || 0) + 1 } return this }
	end() { const {progress, layout} = this; if (progress && layout) { setTimeout(() => progress.value = progress.max, 100); setTimeout(() => layout.hidden = true, 300) } return this }
}
var boot;
(function() { boot = new Boot(); boot.run() })()
