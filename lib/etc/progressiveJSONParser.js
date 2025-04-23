class ProgressiveJSONParser extends CObject {
  static { window[this.name] = this; this._key2Class[this.name] = this }
  get data() { return this._dataPromise }
  constructor(e) {
    super(e)
    this._buffer = ''
    this._done = false
    this._queue = []
    this._pendingResolvers = []
    this._dataPromise = new Promise(res => this._resolveData = res)
    this._allParsedData = []
    this._mode = null // 'array' or 'object'
  }

  feed(chunk) {
    this._buffer += chunk
    this._parseAvailable()
    return this
  }

  close() {
      this._done = true
      this._parseAvailable()

      // 🔧 Son kalan veri varsa ve 'object' modundaysa, tüm buffer'ı parse et
      if (this._mode === 'object' && this._buffer.trim()) {
        try {
          const finalObj = JSON.parse(this._buffer)
          this._allParsedData.push(finalObj)
        } catch (e) {
          console.error('Final parse error:', e)
        }
      }

      this._resolveData(
        this._mode === 'array'
          ? this._allParsedData
          : this._allParsedData[0]
      )

      return this
    }

  _parseAvailable() {
    try {
      while (true) {
        const item = this._tryExtractNext()
        if (item === null) break
        this._allParsedData.push(item)
        if (this._pendingResolvers.length) {
          const resolve = this._pendingResolvers.shift()
          resolve({ value: item, done: false })
        } else {
          this._queue.push(item)
        }
      }

      if (this._done && this._pendingResolvers.length) {
        this._pendingResolvers.forEach(res => res({ done: true }))
        this._pendingResolvers = []
      }
    } catch (e) {
      console.error('JSON parse error:', e)
    }
  }

  _tryExtractNext() {
    const trimmed = this._buffer.trimStart()
    if (!this._mode) {
      if (trimmed.startsWith('[')) {
        this._mode = 'array'
        this._buffer = trimmed.slice(1)
      } else if (trimmed.startsWith('{')) {
        this._mode = 'object'
        const end = this._findMatchingBrace(trimmed)
        if (end < 0) return null
        const objStr = trimmed.slice(0, end + 1)
        this._buffer = trimmed.slice(end + 1)
        return JSON.parse(objStr)
      } else {
        throw new Error('Unsupported JSON root type')
      }
    }

    if (this._mode === 'array') {
      // Kapatıcı parantez ilk sıradaysa: []
      if (this._buffer.trimStart().startsWith(']')) {
        this._buffer = this._buffer.slice(this._buffer.indexOf(']') + 1)
        this._done = true
        return null
      }

      // JSON öğesi obje mi? {...}
      const trimmed = this._buffer.trimStart()
      if (trimmed.startsWith('{')) {
        const end = this._findMatchingBrace(trimmed)
        if (end < 0) return null
        const objStr = trimmed.slice(0, end + 1)
        this._buffer = trimmed.slice(end + 1).replace(/^,/, '') // sonraki virgül varsa atla
        return JSON.parse(objStr)
      }

      // JSON öğesi primitive mi? örn: "abc", 123, true
      const commaIdx = this._buffer.indexOf(',')
      const closingIdx = this._buffer.indexOf(']')
      const limitIdx = (commaIdx >= 0 && commaIdx < closingIdx) ? commaIdx : closingIdx

      if (limitIdx < 0) return null

      const segment = this._buffer.slice(0, limitIdx)
      try {
        const parsed = JSON.parse(segment)
        this._buffer = this._buffer.slice(limitIdx + 1)
        return parsed
      } catch {
        return null
      }
    }

    return null
  }

  _findMatchingBrace(str) {
    let level = 0
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') level++
      else if (str[i] === '}') {
        level--
        if (level === 0) return i
      }
    }
    return -1
  }

  [Symbol.asyncIterator]() {
    return {
      next: () => {
        if (this._queue.length) {
          return Promise.resolve({ value: this._queue.shift(), done: false })
        }

        if (this._done) return Promise.resolve({ done: true })

        return new Promise(resolve => this._pendingResolvers.push(resolve))
      }
    }
  }
}
