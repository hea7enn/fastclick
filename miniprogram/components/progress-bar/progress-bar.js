Component({
  properties: {
    label: {
      type: String,
      value: '进度'
    },
    total: {
      type: Number,
      value: 0
    },
    current: {
      type: Number,
      value: 0
    }
  },
  data: {
    percent: 0
  },
  observers: {
    'current, total'(current, total) {
      this.updatePercent(current, total)
    }
  },
  attached() {
    this.updatePercent(this.data.current, this.data.total)
  },
  methods: {
    updatePercent(current, total) {
      const safeTotal = Number(total) || 0
      const safeCurrent = Number(current) || 0
      const percent = safeTotal > 0 ? Math.min(100, Math.max(0, Math.round((safeCurrent / safeTotal) * 100))) : 0
      this.setData({ percent })
    }
  }
})
