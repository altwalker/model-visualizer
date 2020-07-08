<template>
  <div>
    <label for="mv-edge-weight-input">Weight</label>

    <input
      v-bind:value="weight"
      v-on:input="updateWeight($event.target.value)"
      v-bind:class="{ 'mv-input-error': error }"
      id="mv-edge-weight-input"
      type="text"
    />

    <span v-if="error" class="mv-error">{{error}}</span>
  </div>
</template>

<script>
import { isWeightValid } from './models'

export default {
  props: {
    value: Number
  },

  data() {
    return {
      weight: this.value || '',
      error: ''
    }
  },

  watch: {
    value: function(newValue) {
      if (newValue !== Number(this.weight)) {
        this.reset()
      }
    }
  },

  methods: {
    reset() {
      this.weight = this.value || ''
      this.error = ''
    },

    validateWeight(weight) {
      if (!weight) {
        this.error = ''
        return true
      }

      weight = Number(weight)

      if (isNaN(weight)) {
        this.error = '* weight must be a number'
        return false
      }

      if (!isWeightValid(weight)) {
        this.error = '* weight should be between 0 and 1'
        return false
      }

      this.error = ''
      return true
    },

    updateWeight(weight) {
      this.weight = weight

      if (this.validateWeight(weight)) {
        this.$emit(
          'input',
          Number(weight)
        )
      }
    }
  }
}
</script>
