<template>
  <div class="mv-actions">
    <label for="mv-actions-input">Actions</label>

    <div class="mv-help-tooltip">
      <Info />

      <span class="mv-help-tooltip-text">{{tooltipMessage}}</span>
    </div>

    <textarea
      v-bind:value="actions"
      v-bind:rows="Math.max(3, numberOfActions)"
      v-on:input="updateActions($event.target.value)"
      v-bind:class="{ 'mv-input-error': error }"
      id="mv-actions-input"
      spellcheck="false"
      placeholder="Actions"
    >
    </textarea>

    <span v-if="error" class="mv-error">{{error}}</span>
  </div>
</template>

<script>
import Info from './icons/Info.vue'

export default {
  components: { Info },

  props: {
    value: Array,
    tooltipMessage: String
  },

  data() {
    return {
      actions: this.stringifyActions(this.value),
      numberOfActions: this.value ? this.value.length : 0,
      error: ''
    }
  },

  watch: {
    value: function(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.reset()
      }
    }
  },

  methods: {
    reset() {
      this.actions = this.stringifyActions(this.value)
      this.error = ''
    },

    parseActions(actions) {
      return actions ? actions.split('\n') : []
    },

    stringifyActions(actions) {
      return actions ? actions.reduce((acc, cur, index) => acc + cur + (index < actions.length - 1 ? '\n' : ''), '') : ''
    },

    updateActions(actions) {
      this.actions = actions
      const actionsList = this.parseActions(actions)

      if (this.validateActions(actionsList) && actionsList !== this.value) {
        this.$emit(
          'input',
          actionsList
        )
      }
    },

    validateActions(actions) {
      if (!actions || actions === []) {
        this.error = ''
        return true
      }

      for (let index = 0; index < actions.length; index++) {
        const action = actions[index]

        if (!action) {
          this.error = '* action should not be empty'
          return false
        }

        if (!action.trim().endsWith(';')) {
          this.error = '* each actions should end with \';\''
          return false
        }
      }

      this.error = ''
      return true
    }
  }
}
</script>
