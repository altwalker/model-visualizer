<template>
  <div ref="container" class="mv mv-editmode">
    <div class="mv-editor">
      <button id="mv-btn-new-model" @click="createModel">New model</button>
      <label for="currentModel">Select model</label>
      <select v-if="editableModels" v-model="editableModelIndex" id="currentModel">
        <option
          v-for="(model, i) in editableModels.models"
          v-bind:key="i"
          v-bind:value="i"
        >{{model.name}}</option>
      </select>

      <Model
        v-if="editableModelIndex >=0"
        v-model="editableModels.models[editableModelIndex]"
        :vertices="vertices"
        :edges="edges"
        v-on:delete="removeModel(editableModelIndex)"
      />
      <Edge
        v-if="editableEdgeIndex >= 0"
        v-model="edges[editableEdgeIndex]"
        :vertices="vertices"
        v-on:delete="removeEdge(edges[editableEdgeIndex].id)"
      />
      <Vertex
        v-if="editableVertexIndex >=0 "
        v-model="vertices[editableVertexIndex]"
        v-on:delete="removeVertex(vertices[editableVertexIndex].id)"
      />
    </div>
    <svg class="mv-visualizer">
      <g id="graph" />
      <g id="interaction">
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" style="stroke-width: 1; stroke-dasharray: 1, 0;" />
          </marker>
        </defs>
        <path
          class="path dynamicPath hidden"
          pointer-events="none"
          style="marker-end: url(&quot;#arrowhead&quot;);"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import { createGraph, renderLegend } from "./graph";
import Edge from "./Edge.vue";
import Vertex from "./Vertex.vue";
import Model from "./Model.vue";
import { setupInteraction } from "./interaction";
import undoredo from "./undoredo";

export default {
  name: "Editor",
  components: { Edge, Vertex, Model },
  undoredo: null,
  data: function() {
    return {
      svg: null,
      editableModels: null,
      editableEdgeIndex: -1,
      editableVertexIndex: -1,
      editableModelIndex: -1,
      preventModelsChangedOnce: true
    };
  },
  props: {
    models: { type: Object, required: true },
    legendContainer: { type: String }
  },
  created: function() {
    window.addEventListener("keyup", this.onkeyup);
  },
  destroyed: function() {
    window.removeEventListener("keyup", this.onkeyup);
  },
  mounted: function() {
    this.editableModels = JSON.parse(JSON.stringify(this.models));

    this.undoredo = new undoredo(this.editableModels);
    if (this.editableModels.models.length > 0) {
      this.editableModelIndex = 0;
    }
  },

  computed: {
    editModel() {
      if (this.editableModelIndex >= 0)
        return this.editableModels.models[this.editableModelIndex];
    },
    /**
     *  Returns edges of model being edited
     */
    edges() {
      if (this.editModel) return this.editModel.edges;
    },
    /**
     *  Returns vertices of model being edited
     */
    vertices() {
      if (this.editModel) return this.editModel.vertices;
    },
    /**
     *  Returns ids of edges from all models
     */
    allEdgesIds() {
      return this.editableModels.models.reduce((acc, model) => {
        acc.push(...model.edges.map(v => v.id));
        return acc;
      }, []);
    },
    /**
     *  Returns ids of vertices from all models
     */
    allVerticesIds() {
      return this.editableModels.models.reduce((acc, model) => {
        acc.push(...model.vertices.map(v => v.id));
        return acc;
      }, []);
    }
  },
  watch: {
    models: {
      handler: function() {
        // do not update editable models if its equal to models
        if (
          JSON.stringify(this.models) === JSON.stringify(this.editableModels)
        ) {
          return;
        }

        this.preventModelsChangedOnce = true;
        this.editableModels = JSON.parse(JSON.stringify(this.models));
        if (this.editableModelIndex > this.editableModels.models.length - 1) {
          this.editableModelIndex = 0;
        }
      },
      deep: true
    },
    editableModelIndex: function() {
      this.editableVertexIndex = -1;
      this.editableEdgeIndex = -1;

      this.paintGraph();
    },
    //called every time when data, computed or props change
    editableModels: {
      handler: function(value) {
        if (this.preventModelsChangedOnce) {
          this.preventModelsChangedOnce = false;
        } else {
          this.$emit("change", JSON.parse(JSON.stringify(value)));
        }
        this.paintGraph();
        this.undoredo.push(this.editableModels);
      },
      deep: true
    },
    editableVertexIndex: function(index) {
      this.svg.selectAll(".node").classed("edit", false);

      if (index >= 0) {
        this.svg.select("#" + this.vertices[index].id).classed("edit", true);
      }
    },
    editableEdgeIndex: function(index) {
      this.svg.selectAll(".edgePath").classed("edit", false);
      this.svg.selectAll(".edgeLabels .label").classed("edit", false);
      if (index >= 0) {
        this.svg.select("#" + this.edges[index].id).classed("edit", true);
        this.svg.select("#label_" + this.edges[index].id).classed("edit", true);
      }
    }
  },
  methods: {
    onkeyup(e) {
      if (e.target.tagName.toUpperCase() === "INPUT") return;

      if (e.keyCode === 46 || e.keyCode === 8) {
        if (this.editableEdgeIndex >= 0)
          this.removeEdge(this.edges[this.editableEdgeIndex].id);
        if (this.editableVertexIndex >= 0)
          this.removeVertex(this.vertices[this.editableVertexIndex].id);
      }

      if ((e.ctrlKey || e.metaKey) && (e.keyCode == 90 || e.which == 90)) {
        this.editableEdgeIndex = -1;
        this.editableVertexIndex = -1;
        this.editableModels = this.undoredo.undo().current();
      }
      if ((e.ctrlKey || e.metaKey) && (e.keyCode == 89 || e.which == 89)) {
        this.editableEdgeIndex = -1;
        this.editableVertexIndex = -1;
        this.editableModels = this.undoredo.redo().current();
      }
    },
    paintGraph() {
      let models = [this.editableModels.models[this.editableModelIndex]];
      var { graph, legendDomain, legendRange } = createGraph(models);
      this.svg = this.renderGraph(this.$refs.container, graph);
      this.renderInteraction(this.svg, graph);
      if (this.legendContainer) {
        renderLegend(this.legendContainer, legendDomain, legendRange);
      }
    },
    selectVertex(id) {
      const vertex = this.getVertex(id);
      this.editableVertexIndex = this.vertices.indexOf(vertex);
      this.editableEdgeIndex = -1;
    },
    selectEdge(id) {
      const edge = this.getEdge(id);
      this.editableEdgeIndex = this.edges.indexOf(edge);
      this.editableVertexIndex = -1;
    },
    removeVertex(vertexId) {
      this.editableVertexIndex = -1;
      this.editModel.edges = this.edges.filter(
        e => e.sourceVertexId != vertexId && e.targetVertexId != vertexId
      );
      this.editModel.vertices = this.vertices.filter(e => e.id != vertexId);
    },
    removeEdge(edgeId) {
      this.editableEdgeIndex = -1;
      this.editModel.edges = this.edges.filter(e => e.id != edgeId);
    },
    removeModel(modelIndex) {
      this.editableModels.models.splice(modelIndex, 1);

      if (this.editableModels.models.length == 0) this.createModel();
      else if (this.editableModelIndex == this.editableModels.models.length)
        this.editableModelIndex--;
    },
    createModel() {
      this.editableModels.models.push({
        edges: [],
        vertices: [],
        name: "NewModel",
        generator: "random(edge_coverage(100) && vertex_coverage(100))"
      });
      this.editableModelIndex = this.editableModels.models.length - 1;
    },
    createVertex() {
      let id = 0;
      while (this.allVerticesIds.includes("v" + id)) id++;
      var vertex = {
        id: "v" + id,
        name: "v" + id
      };
      this.vertices.push(vertex);
      this.selectVertex(vertex.id);
    },

    createEdge(sourceVertexId, targetVertexId) {
      let id = 0;
      while (this.allEdgesIds.includes("e" + id)) id++;

      var edge = {
        id: "e" + id,
        name: "e" + id,
        sourceVertexId: sourceVertexId,
        targetVertexId: targetVertexId
      };
      this.edges.push(edge);
      this.selectEdge(edge.id);
    },
    getEdge(edgeId) {
      return this.edges.find(e => e.id == edgeId);
    },
    getVertex(vertexId) {
      return this.vertices.find(e => e.id == vertexId);
    },

    renderInteraction(svg, graph) {
      let self = this;

      let interaction = setupInteraction(svg, graph);

      interaction.onUpdateEdge = (edgeid, sourceVertexId, targetVertexId) => {
        let edge = self.getEdge(edgeid);
        edge.sourceVertexId = sourceVertexId;
        edge.targetVertexId = targetVertexId;
        self.selectEdge(edgeid);
      };
      interaction.onCreateEdge = (sourceVertexId, targetVertexId) => {
        self.createEdge(sourceVertexId, targetVertexId);
      };
      interaction.onSelectEdge = edgeId => {
        self.selectEdge(edgeId);
      };
      interaction.onSelectNode = vertexId => {
        self.selectVertex(vertexId);
      };
      interaction.onCreateNode = () => {
        self.createVertex();
      };
    },

    renderGraph(container, graph) {
      let editor = d3.select(container).select("div.mv-editor");
      let svg = d3.select(container).select("svg");

      const width = container.offsetWidth - editor.node().offsetWidth - 1;
      const height = container.offsetHeight;

      svg.attr("width", width).attr("height", height);

      var inner = svg.select("g#graph");
      if (inner.empty()) inner = svg.append("g").attr("id", "graph");

      // Create the renderer
      var render = new dagreD3.render();

      // set transition duration for visibility in the graph
      graph.graph().transition = function(selection) {
        return selection.transition().duration(200);
      };
      // Run the renderer. This is what draws the final graph.
      render(inner, graph);

      var initialScale = 1;
      if (isFinite(graph.graph().width)) {
        inner.attr(
          "transform",
          `translate(
          ${(svg.attr("width") - graph.graph().width * initialScale) / 2},
          20
        )`
        );
      }

      return svg;
    }
  }
};
</script>