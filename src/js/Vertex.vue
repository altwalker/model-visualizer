<template>
  <div class="mv-editvertex">
    <div>
      <label for="vertexId">Vertex id</label>
      <input
        :value="local.id"
        @input="update('id', $event.target.value)"
        placeholder="Vertex id"
        id="vertexId"
        type="text"
        disabled
      />
    </div>
    <div>
      <label for="name">Vertex name</label>
      <input
        :value="local.name"
        @input="update('name', $event.target.value)"
        placeholder="Vertex name"
        id="name"
        type="text"
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
      <button id="mv-btn-delete-edge" @click="$emit('delete')">Delete vertex</button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, tap, set } from "lodash";
export default {
  props: ["value"],
  computed: {
    local() {
      return this.value;
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", tap(cloneDeep(this.local), v => set(v, key, value)));
    }
  }
};
</script>