<template>
  <div class="mv-edit-edge">
    <h2>Edit Edge</h2>

    <div class="mv-edge-id">
      <label for="mv-edge-id-input">Id</label>

      <input
        v-bind:value="local.id"
        placeholder="Edge id"
        id="mv-edge-id-input"
        type="text"
        disabled
      />
    </div>

    <div class="mv-edge-name">
      <label for="mv-edge-name-input">Name</label>

      <input
        v-model="local.name"
        @input="validateName($event.target.value) && update('name', $event.target.value)"
        v-bind:class="{ 'mv-input-error': nameError }"
        placeholder="Name"
        id="mv-edge-name-input"
        ref="name"
        type="text"
      />

      <span v-if="nameError" class="mv-error">{{nameError}}</span>
    </div>

    <div class="mv-edge-source-vertex">
      <label for="mv-edge-source-vertex-input">Source vertex</label>

      <select
        :value="local.sourceVertexId"
        @input="update('sourceVertexId', $event.target.value)"
        placeholder="Source vertex id"
        id="mv-edge-source-vertex-input"
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
      <label for="mv-edge-target-vertex-input">Target vertex</label>

      <select
        :value="local.targetVertexId"
        @input="update('targetVertexId', $event.target.value)"
        placeholder="Target vertex id"
        id="mv-edge-target-vertex-input"
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
      <label for="mv-edge-guard-input">Guard</label>

      <input
        :value="local.guard"
        @input="update('guard', $event.target.value)"
        id="mv-edge-guard-input"
        type="text"
      />
    </div>

    <div class="mv-edge-weight">
      <label for="mv-edge-weight-input">Weight</label>

      <input
        v-bind:value="weight"
        v-on:input="updateWeight($event.target.value)"
        v-bind:class="{ 'mv-input-error': weightError }"
        id="mv-edge-weight-input"
        type="text"
      />

      <span v-if="weightError" class="mv-error">{{weightError}}</span>
    </div>

    <div class="mv-edge-dependency">
      <label for="mv-edge-dependency-input">Dependency</label>

      <input
        v-bind:value="dependency"
        v-on:input="updateDependency($event.target.value)"
        v-bind:class="{ 'mv-input-error': dependencyError }"
        id="mv-edge-dependency-input"
        type="text"
      />

      <span v-if="dependencyError" class="mv-error">{{dependencyError}}</span>
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

  data() {
    return {
      nameError: '',
      weight: this.value.weight || '',
      weightError: '',
      dependency: this.value.dependency || '',
      dependencyError: ''
    }
  },

  computed: {
    local() {
      return cloneDeep(this.value)
    }
  },

  mounted() {
    if (this.newEdge) {
      this.focusNameInput()
    }
  },

  updated() {
    if (this.newEdge) {
      this.focusNameInput()
    }
  },

  methods: {
    focusNameInput() {
      const inputName = this.$refs.name
      setTimeout(function() { inputName.focus() }, 20)
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
      if (!weight) {
        this.weightError = ''
        return true
      }

      weight = Number(weight)

      if (isNaN(weight)) {
        this.weightError = '* weight must be a number'
        return false
      }

      if (!isWeightValid(weight)) {
        this.weightError = '* weight should be between 0 and 1'
        return false
      }

      this.weightError = ''
      return true
    },

    validateDependency(dependency) {
      if (!dependency) {
        this.dependencyError = ''
        return true
      }

      dependency = Number(dependency)

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

    updateWeight(weight) {
      this.weight = weight

      if (this.validateWeight(weight)) {
        this.update('weight', Number(weight))
      }
    },

    updateDependency(dependency) {
      this.dependency = dependency

      if (this.validateDependency(dependency)) {
        this.update('dependency', Number(dependency))
      }
    }
  }
}
</script>
