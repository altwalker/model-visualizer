<template>
  <div class="editvertex">
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
      <button id="mv-btn-delete-edge" @click="$emit('delete')">Delete vertex</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["value"],
  computed: {
    local() {
      return this.value;
    }
  },
  methods: {
    update(key, value) {
      this.$emit("input", { ...this.local, [key]: value });
    }
  }
};
</script>