(function() {
	function ieKontrol() {
		if (!isIE())
			return true
		location.replace('ie.html');
		return false
	}
	function isIE() { return !window.Request }
	ieKontrol()
})()
