<template>
  <div class="mv-editmodel">
    <div>
      <label for="name">Name</label>
      <input
        :value="local.name"
        @input="update('name', $event.target.value)"
        placeholder="name"
        id="name"
        type="text"
      />
    </div>
    <div>
      <label for="generator">Generator</label>
      <input
        :value="local.generator"
        @input="update('generator', $event.target.value)"
        placeholder="generator(stop_condition)"
        id="generator"
        type="text"
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
    <div>
      <button id="mv-btn-delete-model" @click="$emit('delete')">Delete model</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
    vertices: { type: Array, required: true },
    edges: { type: Array, required: true }
  },
  computed: {
    local() {
      return this.value;
    },
    elementsIds: function() {
      return [...this.vertices.map(v => v.id), ...this.edges.map(e => e.id)];
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", { ...this.local, [key]: value });
    }
  }
};
</script>
