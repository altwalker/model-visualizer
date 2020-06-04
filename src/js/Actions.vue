<template>
  <div class="mv-edit-action">
    <label for="mv-actions">Actions</label>

    <textarea
      v-bind:value="actions"
      v-bind:rows="Math.max(3, numberOfActions)"
      v-on:input="updateActions($event.target.value)"
      name="mv-actions"
      id="mv-actions"
      spellcheck="false"
    >
    </textarea>

    <span v-if="error" class="error">{{error}}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: Array
  },
  data() {
    return {
      actions: this.value ? this.value.reduce((acc, cur, index) => acc + cur + '\n', '') : '',
      numberOfActions: this.value ? this.value.length : 0,
      error: ''
    }
  },
  computed: {
  },
  methods: {
    updateActions(actions) {
      this.actions = actions
      const actionsList = actions.split('\n')

      if (this.validateActions(actionsList)) {
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
          this.error = '* action should not be empty.'
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
