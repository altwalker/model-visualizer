<template>
  <div>
    <label>Actions</label>
    <div v-for="(action,i) in local" v-bind:key="i">
      <a class="button mv-remove-action" @click="removeAction(i)">-</a>
      <input
        :value="action"
        @input="editAction(i,$event.target.value)"
        placeholder="Action"
        class="mv-edit-action"
        type="text"
      />
    </div>
    <a class="button mv-add-action" @click="addAction">+</a>
  </div>
</template>
<script>
import { cloneDeep, tap, set } from "lodash";
export default {
  props: {
    value: Array
  },
  computed: {
    local() {
      return this.value || [];
    }
  },
  methods: {
    editAction(i, value) {
      this.$emit("input", tap(cloneDeep(this.local), v => (v[i] = value)));
    },
    addAction() {
      this.$emit("input", tap(cloneDeep(this.local), v => v.push("")));
    },
    removeAction(index) {
      this.$emit("input", tap(cloneDeep(this.local), v => v.splice(index, 1)));
    }
  }
};
</script>