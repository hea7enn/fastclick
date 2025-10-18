Component({
  properties: {
    option: {
      type: Object,
      value: {}
    },
    selected: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    showResult: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleSelect() {
      if (this.data.disabled) return
      this.triggerEvent('select', {
        option: this.data.option
      })
    }
  }
})
