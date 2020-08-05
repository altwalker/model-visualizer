<template>
  <div class="mv-edit-vertex">
    <h2>Edit Vertex</h2>

    <div class="mv-vertex-id">
      <label for="mv-vertex-id-input">Id</label>

      <input
        :value="local.id"
        placeholder="Id"
        id="mv-vertex-id-input"
        type="text"
        disabled
      />
    </div>

    <div class="mv-vertex-name">
      <label for="mv-vertex-name-input">Name</label>

      <input
        v-model="local.name"
        @input="validateName($event.target.value) && update('name', $event.target.value)"
        v-bind:class="{ 'mv-input-error': nameError }"
        placeholder="Name"
        id="mv-vertex-name-input"
        ref="name"
        type="text"
      />

      <span v-if="nameError" class="mv-error">{{nameError}}</span>
    </div>

    <div class="mv-vertex-description">
      <label for="mv-vertex-description-input">Description</label>

      <textarea
        :value="local.properties && local.properties.description"
        @input="update('properties.description', $event.target.value)"
        placeholder="Description"
        id="mv-vertex-description-input"
      ></textarea>
    </div>

    <div class="mv-vertex-shared-state">
      <label for="mv-vertex-shared-state-input">Shared state</label>

      <div class="mv-help-tooltip">
        <Info />

        <span class="mv-help-tooltip-text">
          A common shared state value added to vertexes to link them together, allowing the path to jump from one to another.
        </span>
      </div>

      <input
        :value="local.sharedState"
        @input="update('sharedState', $event.target.value)"
        placeholder="Shared state"
        id="mv-vertex-shared-state-input"
        type="text"
      />
    </div>

    <div class="mv-vertex-blocked">
      <label for="mv-vertex-blocked-input">Blocked</label>

      <div class="mv-help-tooltip">
        <Info />

        <span class="mv-help-tooltip-text">
          A property which filters out the vertex from the path.
        </span>
      </div>

      <input
        :checked="local.properties && local.properties.blocked"
        @input="update('properties.blocked', $event.target.checked)"
        placeholder="Blocked"
        id="mv-vertex-blocked-input"
        type="checkbox"
      />
    </div>

    <div class="mv-vertex-color">
      <label for="mv-vertex-color-input">Color</label>

      <input
        :value="local.properties&&local.properties.color"
        @input="update('properties.color', $event.target.value)"
        id="mv-vertex-color-input"
        type="color"
      />
    </div>

    <div>
      <button class="mv-button mv-button-delete-vertex" @click="$emit('delete')">Delete Vertex</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap, set } from 'lodash'
import { isKeyword, isIdentifier } from './models'
import Info from './icons/Info.vue'

export default {
  components: { Info },

  props: {
    value: Object,
    newVertex: Boolean
  },

  data: () => ({
    nameError: ''
  }),

  mounted() {
    if (this.newVertex) {
      this.focusNameInput()
    }
  },

  computed: {
    local() {
      return cloneDeep(this.value)
    }
  },

  methods: {
    focusNameInput() {
      const inputName = this.$refs.name
      setTimeout(function() { inputName.focus() }, 20)
    },

    update(key, value) {
      this.$emit('input', tap(cloneDeep(this.local), v => set(v, key, value)))
    },

    validateName(name) {
      if (!name) {
        this.nameError = '* name is required'
        return false
      }

      if (isKeyword(name)) {
        this.nameError = '* name should not be a reserved keyword'
        return false
      }

      if (!isIdentifier(name)) {
        this.nameError = '* name should be a valid identifier'
        return false
      }

      this.nameError = ''
      return true
    }
  }
}
</script>
