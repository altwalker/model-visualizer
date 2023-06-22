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

    <div class="mv-edge-description">
      <label for="mv-edge-description-input">Description</label>

      <textarea
        :value="local.properties && local.properties.description"
        @input="update('properties.description', $event.target.value)"
        id="mv-edge-description-input"
        placeholder="Description (optional)"
      ></textarea>
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

      <div class="mv-help-tooltip">
        <Info />

        <span class="mv-help-tooltip-text">
          A JavaScript conditional expression that blocks the edge until the condition is met.
        </span>
      </div>

      <input
        :value="local.guard"
        @input="update('guard', $event.target.value)"
        id="mv-edge-guard-input"
        type="text"
        placeholder="Guard (optional)"
      />
    </div>

    <div class="mv-edge-weight">
      <Weight :value="local.weight" @input="update('weight', $event)" />
    </div>

    <div class="mv-edge-dependency">
      <Dependency :value="local.dependency" @input="update('dependency', $event)" />
    </div>

    <div class="mv-edge-actions">
      <Actions :value="local.actions" :tooltipMessage="this.actionsTooltipMessage" @input="updateActions($event)" />
    </div>

    <div>
      <button class="mv-button mv-button-delete-edge" @click="$emit('delete')">Delete Edge</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap, set, unset } from 'lodash'

import { isKeyword, isIdentifier } from './models'
import Actions from './Actions.vue'
import Weight from './Weight.vue'
import Dependency from './Dependency.vue'
import Info from './icons/Info.vue'

export default {
  components: { Actions, Weight, Dependency, Info },

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
      dependencyError: '',
      actionsTooltipMessage: 'JavaScript code that is executed every time an edge is reached.'
    }
  },

  mounted() {
    if (this.newEdge) {
      this.focusNameInput()
    }
  },

  computed: {
    local() {
      return cloneDeep(this.value)
    }
  },

  watch: {
    newEdge: function(newEdge) {
      if (newEdge) {
        this.focusNameInput()
      }
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

    update(key, value) {
      if (value || value === 0) {
        this.$emit(
          'input',
          tap(cloneDeep(this.local), v => set(v, key, value))
        )
      } else {
        this.$emit(
          'input',
          tap(cloneDeep(this.local), v => unset(v, key, value))
        )
      }
    },

    updateActions(actions) {
      this.$emit(
        'input',
        tap(cloneDeep(this.local), v => (v.actions = actions))
      )
    }
  }
}
</script>
