<template>
  <div class="mv-edit-edge">
    <h2>Edit Edge</h2>

    <div class="mv-edge-id">
      <label for="edgeId">Id</label>
      <input
        :value="local.id"
        @input="update('id', $event.target.value)"
        placeholder="Edge id"
        id="edgeId"
        type="text"
        disabled
      />
    </div>

    <div class="mv-edge-name">
      <label for="name">Name</label>
      <input
        v-model="local.name"
        @input="validateName($event.target.value) && update('name', $event.target.value)"
        placeholder="Name"
        id="name"
        ref="name"
        type="text"
        :class="nameError&&'error'"
      />
      <span v-if="nameError" class="error">{{nameError}}</span>
    </div>

    <div class="mv-edge-source-vertex">
      <label for="source">Source vertex</label>
      <select
        :value="local.sourceVertexId"
        @input="update('sourceVertexId', $event.target.value)"
        placeholder="Source vertex id"
        id="source"
        type="text"
      >
        <option></option>
        <option
          v-for="vertex in vertices"
          v-bind:key="vertex.id"
          :value="vertex.id"
        >{{vertex.id}} - {{vertex.name}}</option>
      </select>
    </div>

    <div class="mv-edge-target-vertex">
      <label for="target">Target vertex</label>

      <select
        :value="local.targetVertexId"
        @input="update('targetVertexId', $event.target.value)"
        placeholder="Target vertex id"
        id="target"
        type="text"
      >
        <option
          v-for="vertex in vertices"
          v-bind:key="vertex.id"
          :value="vertex.id"
        >{{vertex.id}} - {{vertex.name}}</option>
      </select>
    </div>

    <div class="mv-edge-guard">
      <label for="guard">Guard</label>

      <input
        :value="local.guard"
        @input="update('guard', $event.target.value)"
        id="guard"
        type="text"
      />
    </div>

    <div class="mv-edge-weight">
      <label for="weight">Weight</label>
      <input
        v-model="local.weight"
        @input="validateWeight(parseFloat($event.target.value)) && update('weight', parseFloat($event.target.value))"
        id="weight"
        type="number"
        min="0"
        max="1"
        step="0.1"
      />

      <span v-if="weightError" class="error">{{weightError}}</span>
    </div>

    <div class="mv-edge-dependency">
      <label for="dependency">Dependency</label>
      <input
        v-model="local.dependency"
        @input="validateDependency(parseInt($event.target.value)) && update('dependency', parseInt($event.target.value))"
        id="dependency"
        type="number"
        min="0"
      />
      <span v-if="dependencyError" class="error">{{dependencyError}}</span>
    </div>

    <div class="mv-edge-actions">
      <Actions :value="local.actions" @input="updateActions($event)" />
    </div>

    <div>
      <button class="mv-button mv-button-delete-edge" @click="$emit('delete')">Delete Edge</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap, set, unset } from 'lodash'

import { isKeyword, isIdentifier, isWeightValid, isDependencyValid } from './models'
import Actions from './Actions.vue'

export default {
  components: { Actions },
  props: {
    value: Object,
    vertices: {
      type: Array,
      required: true
    },
    newEdge: Boolean
  },
  data: () => ({
    nameError: '',
    dependencyError: '',
    weightError: ''
  }),
  computed: {
    local() {
      return cloneDeep(this.value)
    }
  },
  mounted() {
    if (this.newEdge) this.focusNameInput()
  },
  updated() {
    if (this.newEdge) this.focusNameInput()
  },
  methods: {
    focusNameInput() {
      const inputName = this.$refs.name
      setTimeout(function() { inputName.focus() }, 20)
    },
    update(key, value) {
      if (!value && value !== 0) {
        this.$emit(
          'input',
          tap(cloneDeep(this.local), v => unset(v, key, value))
        )
      } else {
        this.$emit(
          'input',
          tap(cloneDeep(this.local), v => set(v, key, value))
        )
      }
    },
    updateActions(actions) {
      this.$emit(
        'input',
        tap(cloneDeep(this.local), v => (v.actions = actions))
      )
    },
    validateName(name) {
      if (!name) {
        this.nameError = ''
        return true
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
    },
    validateWeight(weight) {
      if (!isWeightValid(weight)) {
        this.weightError = '* weight should be between 0 and 1'
        return false
      }

      this.weightError = ''
      return true
    },
    validateDependency(dependency) {
      if (isNaN(dependency)) {
        this.dependencyError = '* dependency must be a number'
        return false
      }

      if (!isDependencyValid(dependency)) {
        this.dependencyError = '* dependency cannot be negative'
        return false
      }

      this.dependencyError = ''
      return true
    }
  }
}
</script>
