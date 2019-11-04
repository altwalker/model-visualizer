<template>
  <div class="mv-editvertex">
    <h2>Vertex</h2>
    <div>
      <label for="vertexId">Id</label>
      <input
        :value="local.id"
        @input="update('id', $event.target.value)"
        placeholder="Id"
        id="vertexId"
        type="text"
        disabled
      />
    </div>
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
      <label for="sharedState">Shared state</label>
      <input
        :value="local.sharedState"
        @input="update('sharedState', $event.target.value)"
        placeholder="Shared state"
        id="sharedState"
        type="text"
      />
    </div>
    <div>
      <label for="blocked">Blocked</label>
      <input
        :checked="local.properties&&local.properties.blocked"
        @input="update('properties.blocked', $event.target.checked)"
        placeholder="Blocked"
        id="blocked"
        type="checkbox"
      />
    </div>
    <div>
      <label for="color">Color</label>
      <input
        id="color"
        type="color"
        :value="local.properties&&local.properties.color"
        @input="update('properties.color', $event.target.value)"
      />
    </div>
    <div>
      <button id="mv-btn-delete-vertex" @click="$emit('delete')">Delete</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap, set } from "lodash";
import { isNameValid } from "./models";
export default {
  props: ["value"],
  data: () => ({
    nameError: ""
  }),
  computed: {
    local() {
      return cloneDeep(this.value);
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", tap(cloneDeep(this.local), v => set(v, key, value)));
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
    }
  }
};
</script>