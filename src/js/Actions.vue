<template>
  <div>
    <label>Actions</label>
    <div v-for="(action,i) in local" v-bind:key="i">
      <a class="button mv-remove-action" @click="removeAction(i)">-</a>
      <span v-if="action.error" class="error">{{action.error}}</span>

      <input
        v-model="action.value"
        @input="validateAction(i,$event.target.value ) && editAction(i,$event.target.value)"
        placeholder="Action"
        class="mv-edit-action"
        type="text"
        :class="action.error&&'error'"
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
  data: () => ({
    local: []
  }),
  mounted() {
    let values = cloneDeep(this.value) || [];
    for (let val of values) {
      this.local.push({ value: val, error: "" });
    }
  },
  methods: {
    validateAction(index, value) {
      if (!value) {
        this.local[index].error = "* action should not be empty";
        return false;
      }
      this.local[index].error = "";
      return true;
    },
    editAction(i, value) {
      this.$emit(
        "input",
        tap(cloneDeep(this.local).map(v => v.value), v => (v[i] = value))
      );
    },
    addAction() {
      this.local.push({ value: "", error: "" });
    },
    removeAction(index) {
      this.$emit("input", tap(cloneDeep(this.local), v => v.splice(index, 1)));
    }
  }
};
</script>