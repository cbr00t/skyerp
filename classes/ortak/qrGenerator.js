class QRGenerator extends CObject {
    static get defaultFormat() { return 'bmp' } static get defaultWaitMS() { return 1000 }
	makeQR(data) {
		data = data ?? ''; if (typeof data == 'object') { data = toJSONStr(data) }
		let qr = new QRCode($('<div/>')[0], { width: 256, height: 256, correctLevel: QRCode.CorrectLevel.H });
		qr.makeCode(data); let {_elCanvas: canvas, _oContext: ctx} = qr._oDrawing;
		return ctx.getImageData(0, 0, canvas.width, canvas.height)
	}
	createBMP(img) {
		let {width: w, height: h, data: px} = img, rs = Math.ceil(w / 8), pad = (rs + 3) & ~3, dataSize = pad * h;
		let buf = new ArrayBuffer(14 + 40 + 8 + dataSize), v = new DataView(buf), o = 0;
			/* Bitmap file header */
		v.setUint16(o, 0x4D42, true); o += 2;
		v.setUint32(o, buf.byteLength, true); o += 4;
		v.setUint32(o, 0, true); o += 4;
		v.setUint32(o, 62, true); o += 4;							/* dataOffset = 14 + 40 + 8 */
			/* DIB header */
		v.setUint32(o, 40, true); o += 4;
		v.setInt32(o, w, true); o += 4;
		v.setInt32(o, h, true); o += 4;
		v.setUint16(o, 1, true); o += 2;
		v.setUint16(o, 1, true); o += 2;							/* 1-bit */
		v.setUint32(o, 0, true); o += 4;
		v.setUint32(o, dataSize, true); o += 4;
		v.setInt32(o, 2835, true); o += 4;
		v.setInt32(o, 2835, true); o += 4;
		v.setUint32(o, 2, true); o += 4;
		v.setUint32(o, 0, true); o += 4;
			/* color palette: black, white */
		v.setUint32(o, 0x00000000, true); o += 4;
		v.setUint32(o, 0x00FFFFFF, true); o += 4;
		for (let y = 0; y < h; y++) {
			let byte = 0, bit = 0, rowStart = o;
			for (let x = 0; x < w; x++) {
			  let i = ((h - 1 - y) * w + x) * 4, avg = (px[i] + px[i+1] + px[i+2]) / 3;
			  byte = (byte << 1) | (avg < 128 ? 0 : 1); bit++;
			  if (bit == 8) { v.setUint8(o++, byte); byte = 0; bit = 0 }
			}
			if (bit > 0) { v.setUint8(o++, byte << (8 - bit)) }
			while ((o - rowStart) % 4 != 0) { v.setUint8(o++, 0) }
		}
		return new Blob([buf], { type: 'image/bmp' })
	}
	createPNG(img) {
		let canvas = document.createElement('canvas'), {width, height} = img; Object.assign(canvas, { width, height });
		let ctx = canvas.getContext('2d'); ctx.putImageData(img, 0, 0);
		let dataUrl = canvas.toDataURL('image/png'), arr = Base64.toUint8Array(dataUrl.split(',')[1]);
		return new Blob([arr], { type: 'image/png' })
	}
	getFileName(ext, prefix) {
		let now = new Date(), ts = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
		return `${prefix ?? 'qr'}-${ts}.${ext}`
	}
    qrDraw(data, format, prefix) {
		format = format || this.class.defaultFormat; let img = this.makeQR(data); if (!img) { return null }
        let selector = format == 'png' ? 'createPNG' : 'createBMP', blob = this[selector](img);
		let base64URL = URL.createObjectURL(blob); return { data, img, base64URL, blob }
    }
	qrSave(blob, format, prefix) {
        format = format || this.class.defaultFormat; let fileName = this.getFileName(format, prefix);
        let a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName; a.click();
		let url = `file:///storage/emulated/0/Download/${fileName}`, prnCmd = `<IMAGE>${url}<BR>`;
		return { blob, prefix, fileName, url, prnCmd }
	}
    qrDrawAndSave(data, format, prefix) {
		let result_draw = this.qrDraw(data, format, prefix); if (!result_draw?.blob) { return null }
        let {blob} = result_draw, result_save = this.qrSave(blob, format, prefix); if (!result_save) { return null }
		return { ...result_draw, ...result_save }
	}
	async qrDrawAndSaveAsync(data, format, prefix) {
		let result = this.qrDrawAndSave(data, format, prefix); if (result) {
			let {defaultWaitMS} = this.class;
			if (defaultWaitMS > 0) { await delay(defaultWaitMS) }
		}
		return result
	}
	debug(text) {
		let {prnCmd} = this.qrDrawAndSave(text, 'bmp');
		document.getElementById('printcmd').innerText = prnCmd
	}
}
