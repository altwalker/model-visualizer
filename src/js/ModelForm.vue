<template>
  <div class="mv-edit-model">
    <h2>Edit Model</h2>

    <div class="mv-model-name">
      <label for="mv-model-name-input">Name</label>

      <input
        v-model="local.name"
        @input="validateName($event.target.value) && update('name', $event.target.value)"
        v-bind:class="{ 'mv-input-error': nameError }"
        placeholder="Name"
        id="mv-model-name-input"
        type="text"
      />

      <span v-if="nameError" class="mv-error">{{nameError}}</span>
    </div>

    <div class="mv-model-start-element">
      <label for="mv-model-start-element-input">Start element</label>

      <select
        v-model="local.startElementId"
        @input="update('startElementId', $event.target.value)"
        placeholder
        id="mv-model-start-element-input"
        type="text"
      >
        <option></option>
        <option v-for="element in elements" v-bind:key="element.id" :value="element.id">{{element.id}} - {{element.name}}</option>
      </select>
    </div>

    <div class="mv-model-generator">
      <label for="mv-model-generator-input">Generator</label>

      <div class="mv-help-tooltip">
        <InfoIcon />

        <span class="mv-help-tooltip-text">
          Decides how to walk through the graph and when to stop.
        </span>
      </div>

      <input
        v-model="local.generator"
        @input="validateGenerator($event.target.value) && update('generator', $event.target.value)"
        v-bind:class="{ 'mv-input-error': generatorError }"
        placeholder="generator(stop_condition)"
        id="mv-model-generator-input"
        type="text"
      />

      <span v-if="generatorError" class="mv-error">{{generatorError}}</span>
    </div>

    <div class="mv-model-actions">
      <ActionsForm :value="local.actions" :tooltipMessage="this.actionsTooltipMessage" @input="updateActions($event)" />
    </div>

    <div>
      <button class="mv-button mv-button-delete-model" @click="$emit('delete')">Delete Model</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap } from 'lodash'

import { isKeyword, isIdentifier } from './models'
import ActionsForm from './ActionsForm.vue'
import InfoIcon from './icons/InfoIcon.vue'

export default {
  components: { ActionsForm, InfoIcon },

  props: {
    value: Object,
    modelNames: { type: Array, required: true },
    vertices: { type: Array, required: true },
    edges: { type: Array, required: true }
  },

  data: () => ({
    nameError: '',
    generatorError: '',
    actionsTooltipMessage: 'Javascript code executed once before any edge or vertex is executed.'
  }),

  computed: {
    local() {
      return cloneDeep(this.value)
    },

    elements: function() {
      return [...this.vertices, ...this.edges]
    }
  },

  methods: {
    update(key, value) {
      this.$emit('input', { ...this.local, [key]: value })
    },

    updateActions(actions) {
      this.$emit(
        'input',
        tap(cloneDeep(this.local), v => (v.actions = actions))
      )
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

      if (this.value.name !== name && this.modelNames.includes(name)) {
        this.nameError = '* model names should be unique'
        return false
      }

      this.nameError = ''
      return true
    },

    validateGenerator(generator) {
      if (!generator) {
        this.generatorError = '* generator is required'
        return false
      }

      this.generatorError = ''
      return true
    }
  }
}
</script>
