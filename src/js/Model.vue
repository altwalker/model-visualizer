<template>
  <div class="mv-editmodel">
    <h2>Model</h2>
    <div>
      <label for="name">Name</label>
      <span v-if="nameError" class="error">{{nameError}}</span>
      <input
        v-model="local.name"
        @input="validateName($event.target.value) && update('name', $event.target.value)"
        placeholder="Name"
        id="name"
        type="text"
        :class="nameError&&'error'"
      />
    </div>
    <div>
      <label for="generator">Generator</label>
      <span v-if="generatorError" class="error">{{generatorError}}</span>
      <input
        v-model="local.generator"
        @input="validateGenerator($event.target.value) && update('generator', $event.target.value)"
        placeholder="generator(stop_condition)"
        id="generator"
        type="text"
        :class="generatorError&&'error'"
      />
    </div>
    <div>
      <label for="startElementId">Start element id</label>
      <select
        :value="local.startElementId"
        @input="update('startElementId', $event.target.value)"
        placeholder
        id="startElementId"
        type="text"
      >
        <option></option>
        <option v-for="id in elementsIds" v-bind:key="id" :value="id">{{id}}</option>
      </select>
    </div>
    <Actions :value="local.actions" @input="updateActions($event)" />
    <div>
      <button id="mv-btn-delete-model" @click="$emit('delete')">Delete model</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap } from "lodash";
import Actions from "./Actions.vue";
import { isNameValid } from "./models";
export default {
  components: { Actions },
  props: {
    value: Object,
    vertices: { type: Array, required: true },
    edges: { type: Array, required: true }
  },
  data: () => ({
    nameError: "",
    generatorError: ""
  }),
  computed: {
    local() {
      return cloneDeep(this.value);
    },
    elementsIds: function() {
      return [...this.vertices.map(v => v.id), ...this.edges.map(e => e.id)];
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", { ...this.local, [key]: value });
    },
    updateActions(actions) {
      this.$emit(
        "input",
        tap(cloneDeep(this.local), v => (v.actions = actions))
      );
    },
    validateName(name) {
      if (!name) {
        this.nameError = "* name is required";
        return false;
      }
      if (!isNameValid(name)) {
        this.nameError = "* name should be a valid identifier";
        return false;
      }

      this.nameError = "";
      return true;
    },
    validateGenerator(generator) {
      if (!generator) {
        this.generatorError = "* generator is required";
        return false;
      }

      this.generatorError = "";
      return true;
    }
  }
};
</script>
