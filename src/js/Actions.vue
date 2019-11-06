<template>
  <div class="mv-edit-action">
    <label>Actions</label>
    <div v-for="(action,i) in local" v-bind:key="i" class="mv-edit-action">
      <a href="#" class="button mv-remove-action" @click="removeAction(i)">x</a>
      <span class="mv-action">{{action}}</span>
    </div>
    <div class="mv-new-action">
      <input v-model="newAction" placeholder="Action" type="text" />
      <a href="#" class="button mv-add-action" @click="addAction">+</a>
      <span v-if="error" class="error">{{error}}</span>
    </div>
  </div>
</template>
<script>
import { cloneDeep, tap, set } from "lodash";
export default {
  props: {
    value: Array
  },
  data: () => ({
    newAction: "",
    error: ""
  }),
  computed: {
    local() {
      return this.value || [];
    }
  },
  methods: {
    addAction() {
      if (this.validateAction(this.newAction)) {
        this.$emit(
          "input",
          tap(cloneDeep(this.local), v => v.push(this.newAction))
        );
        this.newAction = "";
      }
    },
    removeAction(index) {
      this.$emit("input", tap(cloneDeep(this.local), v => v.splice(index, 1)));
    },
    validateAction(action) {
      if (!action) {
        this.error = "Action should not be empty.";
        return false;
      }
      this.error = "";
      return true;
    }
  }
};
</script>