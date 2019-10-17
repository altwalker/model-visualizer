<template>
  <div class="mv-editedge">
    <h2>Edge</h2>
    <div>
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
    <div>
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
    <div>
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
import { isNameValid } from "./models";
export default {
  components: { Actions },
  props: {
    value: Object,
    vertices: {
      type: Array,
      required: true
    }
  },
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
    }
  }
};
</script>