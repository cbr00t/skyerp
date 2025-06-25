class VergiVeyaTCKimlik extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get perakendeVKN() { return '1'.repeat(this.haneSayisi) }
	static get yurtDisiVKN() { return '2'.repeat(this.haneSayisi) }
	static uygunmu(value) {
		var len = value?.length;
		for (let cls of this.subClasses) {
			let {haneSayisi} = cls;
			if (haneSayisi && len == haneSayisi) { return cls.uygunmu(value) }
		}
		return false
	}
}
class VergiNo extends VergiVeyaTCKimlik {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get haneSayisi() { return 10 }
	static uygunmu(value) {
		if (!/^\d{10}$/.test(value)) { return false }
		let digits = value.split('').map(Number);
		let sum = 0; for (let i = 0; i < 9; i++) {
			let tmp = (digits[i] + 9 - i) % 10;
			let pow = tmp * Math.pow(2, 9 - i);
			sum += (pow % 9 == 0) ? 9 : (pow % 9)
		}
		let checkDigit = (10 - (sum % 10)) % 10;
		return digits[9] == checkDigit
	}
}
class TCKimlik extends VergiVeyaTCKimlik {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get haneSayisi() { return 11 }
	static uygunmu(value) {
		if (!/^\d{11}$/.test(value)) { return false }
		let digits = value.split('').map(Number);
		if (digits[0] == 0) { return false }    /* İlk hane 0 olamaz */
		let t10 = (
			7 * (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) -
			(digits[1] + digits[3] + digits[5] + digits[7])
		) % 10;
		let t11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
		return digits[9] == t10 && digits[10] == t11
	}
}
