<template>
  <div class="mv-editedge">
    <div>
      <label for="edgeId">Edge id</label>
      <input
        :value="local.id"
        @input="update('id', $event.target.value)"
        placeholder="Edge id"
        id="edgeId"
        type="text"
        disabled
      />
    </div>
    <div>
      <label for="source">Source vertex id</label>
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
    <div>
      <label for="target">Target vertex id</label>
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
    <div>
      <label for="name">Edge name</label>
      <input
        :value="local.name"
        @input="update('name', $event.target.value)"
        placeholder="Edge name"
        id="name"
        type="text"
      />
    </div>
    <div>
      <label for="guard">Guard</label>
      <input
        :value="local.guard"
        @input="update('guard', $event.target.value)"
        placeholder="Guard"
        id="guard"
        type="text"
      />
    </div>
    <Actions :value="local.actions" @input="updateActions($event)" />
    <div>
      <button id="mv-btn-delete-edge" @click="$emit('delete')">Delete edge</button>
    </div>
  </div>
</template>

<script>
import Actions from "./Actions.vue";
import { cloneDeep, tap, set } from "lodash";
export default {
  components: { Actions },
  props: {
    value: Object,
    vertices: {
      type: Array,
      required: true
    }
  },
  computed: {
    local() {
      return this.value;
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", tap(cloneDeep(this.local), v => set(v, key, value)));
    },
    updateActions(actions) {
      this.$emit(
        "input",
        tap(cloneDeep(this.local), v => (v.actions = actions))
      );
    }
  }
};
</script>