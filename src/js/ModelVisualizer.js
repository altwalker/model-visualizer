import Vue from "vue";
import { defaultModels, validateModels } from "./models";
import Editor from "./Editor.vue";
import Visualizer from "./Visualizer.vue";
import "../css/style.css";

/**
 * Visualizer and Visual Editor for AltWalker and GraphWalker models
 */
export default class ModelVisualizer {
  /**
   * Creates new instance of ModelVisualizer
   * @param {Object} options - The visualizer options
   * @param {string | HTMLElement} options.container - The container or container id where the model will be rendered
   * @param {Object} [options.models] - The models to be rendered
   * @param {Boolean} [options.editmode=true] - Enable or disable editmode.
   * @param {Function} [options.onmodelschange] - Called when the model changes. Called only if editmode is enabled.
   */
  constructor(options) {
    if (!options) {
      throw Error("options paramter is required");
    }
    let container = options.container;

    if (!container)
      throw Error(
        "options.container is not set. The container for rendering the model is required"
      );

    if (typeof container === "string" || container instanceof string) {
      container = document.getElementById(container);
    }

    this.onmodelschange = options.onmodelschange;
    let visualizer = this;

    let data = {
      models: options.models || defaultModels,
      editmode: options.editmode
    };
    ModelVisualizer.validate(data.models);
    this.vm = new Vue({
      components: { Editor, Visualizer },
      data: data,
      template: `
        <Editor ref='editor' v-if="editmode" :models='models' v-on:change="modelsChanged" />
        <Visualizer ref='visualizer' v-else :models='models'/>
        `,
      methods: {
        modelsChanged: function (models) {
          if (visualizer.onmodelschange) {
            visualizer.onmodelschange(models);
          }
        }
      }
    });
    this.vm.$mount(container);
  }

  /**
   * Validate the models.
   * @param {Object} models - The models to be validated
   * @throws - Will throw an error if models are invalid
   */
  static validate(models) {
    validateModels(models);
  }

  /**
   * Repaints the model. Call this method in case if container resize
   */
  repaint() {
    this.vm.editmode
      ? this.vm.$refs.editor.paintGraph()
      : this.vm.$refs.visualizer.paintGraph();
  }

  /**
   * Rerenders the graph with the new models.
   * @param {Object} models - The models
   * @throws - Will throw an error if models are invalid
   */
  setModels(models) {
    ModelVisualizer.validate(models);
    this.vm.models = models;
  }
  /**
   * Switches from editor to viewer
   * @param {Boolean} editmode
   */
  setEditMode(editmode) {
    this.vm.editmode = editmode;
  }

  /**
   * Sets the callback used when models are being updated in edit mode.
   */
  setOnModelsChange(callback) {
    this.onmodelschange = callback;
  }
}
