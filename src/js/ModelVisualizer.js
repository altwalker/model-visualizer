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
   * 
   * For configuring graphLayoutOptions checkout {@link https://github.com/dagrejs/dagre/wiki#configuring-the-layout Dagre Wiki}
   * 
   * @param {Object} options                                The visualizer options
   * @param {string | HTMLElement} options.container        The container or container id where the model will be rendered
   * @param {Object} [options.models]                       The models to be rendered
   * @param {Boolean} [options.editMode=true]               Enable or disable editMode.
   * @param {Function} [options.onModelsChange]             Called when the model changes. Called only if editMode is enabled.
   * @param {string} options.legendContainer                The container id where the legend will be rendered
   * @param {Object} options.graphLayoutOptions             dagreD3 graph layout options
   * @param {Object} options.graphLayoutOptions.rankdir     Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
   * @param {Object} options.graphLayoutOptions.align       Alignment for rank nodes. Can be UL, UR, DL, or DR, where U = up, D = down, L = left, and R = right.
   * @param {Object} options.graphLayoutOptions.nodesep     Number of pixels that separate nodes horizontally in the layout.
   * @param {Object} options.graphLayoutOptions.edgesep     Number of pixels that separate edges horizontally in the layout.
   * @param {Object} options.graphLayoutOptions.ranksep     Number of pixels between each rank in the layout.
   * @param {Object} options.graphLayoutOptions.marginx     Number of pixels to use as a margin around the left and right of the graph.
   * @param {Object} options.graphLayoutOptions.marginy     Number of pixels to use as a margin around the top and bottom of the graph.
   * @param {Object} options.graphLayoutOptions.acyclicer   If set to greedy, uses a greedy heuristic for finding a feedback arc set for a graph. A feedback arc set is a set of edges that can be removed to make a graph acyclic.
   * @param {Object} options.graphLayoutOptions.ranker      Type of algorithm to assigns a rank to each node in the input graph. Possible values: network-simplex, tight-tree or longest-path
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

    this.onModelsChange = options.onModelsChange;
    let visualizer = this;

    let data = {
      models: options.models || defaultModels,
      editMode: options.editMode,
      legendContainer: options.legendContainer,
      graphLayoutOptions: options.graphLayoutOptions
    };
    ModelVisualizer.validate(data.models);
    this.vm = new Vue({
      components: { Editor, Visualizer },
      data: data,
      template: `
  <Editor 
    ref='editor' 
    v-if="editMode" 
    v-on:change="modelsChanged" 
    :models='models' 
    :legend-container="legendContainer"
    :graph-layout-options="graphLayoutOptions" />
  <Visualizer ref='visualizer' v-else :models='models' :legend-container="legendContainer" :graph-layout-options="graphLayoutOptions"/>
        `,
      methods: {
        modelsChanged: function (models) {
          data.models = models;
          if (visualizer.onModelsChange) {
            visualizer.onModelsChange(models);
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
    this.vm.editMode
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
  getModels() {
    return JSON.parse(JSON.stringify(this.vm.models));
  }
  /**
   * Switches from editor to viewer
   * @param {Boolean} editMode
   */
  setEditMode(editMode) {
    this.vm.editMode = editMode;
  }

  /**
   * Sets the callback used when models are being updated in edit mode.
   */
  setOnModelsChange(callback) {
    this.onModelsChange = callback;
  }

  /**
   * Sets dagreD3 graph layout options.
   */
  setGraphLayoutOptions(graphLayoutOptions) {
    this.vm.graphLayoutOptions = graphLayoutOptions;
  }
}
