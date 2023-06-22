<template>
  <div>
    <label for="mv-edge-dependency-input">Dependency</label>

    <div class="mv-help-tooltip">
      <Info />

      <span class="mv-help-tooltip-text">
        An integer used by the dependency_edge_coverage stop condition to finish the path when all the edges with dependency higher or equal to the threshold are reached.
      </span>
    </div>

    <input
      v-bind:value="dependency"
      v-on:input="updateDependency($event.target.value)"
      v-bind:class="{ 'mv-input-error': error }"
      id="mv-edge-dependency-input"
      type="text"
      placeholder="Dependency (optional)"
    />

    <span v-if="error" class="mv-error">{{error}}</span>
  </div>
</template>
<script>
import { isDependencyValid } from './models'
import Info from './icons/Info.vue'

export default {
  components: { Info },

  props: {
    value: Number
  },

  data() {
    return {
      dependency: this.value || '',
      error: ''
    }
  },

  watch: {
    value: function(newValue) {
      if (newValue !== Number(this.dependency)) {
        this.reset()
      }
    }
  },

  methods: {
    reset() {
      this.dependency = this.value || ''
      this.error = ''
    },

    validateDependency(dependency) {
      if (!dependency) {
        this.error = ''
        return true
      }

      dependency = Number(dependency)

      if (isNaN(dependency)) {
        this.error = '* dependency must be a number'
        return false
      }

      if (!isDependencyValid(dependency)) {
        this.error = '* dependency cannot be negative'
        return false
      }

      this.error = ''
      return true
    },

    updateDependency(dependency) {
      this.dependency = dependency

      if (this.validateDependency(dependency)) {
        this.$emit(
          'input',
          Number(dependency)
        )
      }
    }
  }
}
</script>
