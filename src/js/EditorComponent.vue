<template>
  <div ref="container" class="mv mv-editmode">
    <div class="mv-editor">
      <div class="mv-edit-project">
        <h2>Editor</h2>

        <label for="currentModel">Select model</label>

        <select v-if="editableModels" v-model="editableModelIndex" id="currentModel">
          <option
            v-for="(model, i) in editableModels.models"
            v-bind:key="i"
            v-bind:value="i"
          >{{model.name}}</option>
        </select>

        <button class="mv-button mv-button-new-model" @click="createModel">New model</button>
      </div>

      <ModelForm
        v-if="editModelMeta && editableModelIndex >=0"
        v-model="editableModels.models[editableModelIndex]"
        :modelNames="allModelNames"
        :vertices="vertices"
        :edges="edges"
        v-on:delete="showDeleteModelPopUp"
      />

      <EdgeForm
        v-if="editableEdgeIndex >= 0"
        v-model="edges[editableEdgeIndex]"
        :vertices="vertices"
        :newEdge="newEdge"
        v-on:delete="removeEdge(edges[editableEdgeIndex].id)"
      />

      <VertexForm
        v-if="editableVertexIndex >=0 "
        v-model="vertices[editableVertexIndex]"
        :newVertex="newVertex"
        v-on:delete="removeVertex(vertices[editableVertexIndex].id)"
      />
    </div>

    <div class="mv-overlay" v-if="displayDeleteModelPopUp">
      <div class="mv-pop-up">
        <p>Are you sure you want to delete the model?</p>

        <button class="mv-button mv-button-delete-model" @click="removeModel(editableModelIndex)">Delete Model</button>
        <button class="mv-button mv-button-cancel" @click="hideDeleteModelPopUp">Cancel</button>
      </div>
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

    <div class="mv-tooltip"></div>
  </div>
</template>

<script>
import EdgeForm from './EdgeForm.vue'
import VertexForm from './VertexForm.vue'
import ModelForm from './ModelForm.vue'
import UndoRedo from './undoredo'
import { createGraph, renderTooltips, renderLegend } from './graph'
import { setupInteraction } from './interaction'

import * as dagreD3 from 'dagre-d3-es'
import * as d3 from 'd3'

export default {
  name: 'EditorComponent',
  components: { EdgeForm, VertexForm, ModelForm },
  undoredo: null,

  data: function() {
    return {
      svg: null,
      displayDeleteModelPopUp: false,
      editableModels: null,
      editableEdgeIndex: -1,
      editableVertexIndex: -1,
      editableModelIndex: -1,
      newEdge: false,
      newVertex: false,
      preventModelsChangedOnce: true
    }
  },

  props: {
    models: { type: Object, required: true },
    legendContainer: { type: String },
    graphLayoutOptions: { type: Object }
  },

  created: function() {
    window.addEventListener('keydown', this.keyPressHandler, false)
  },

  destroyed: function() {
    window.removeEventListener('keydown', this.keyPressHandler)
  },

  mounted: function() {
    this.editableModels = JSON.parse(JSON.stringify(this.models))

    this.undoredo = new UndoRedo(this.editableModels)
    if (this.editableModels.models.length > 0) {
      this.editableModelIndex = 0
    }
  },

  computed: {
    /**
     * Returns the names of all models.
     */
    allModelNames() {
      return this.editableModels.models.map((model) => model.name)
    },

    /**
     *  Returns the ids of edges from all models.
     */
    allEdgesIds() {
      return this.editableModels.models.reduce((acc, model) => {
        acc.push(...model.edges.map(v => v.id))
        return acc
      }, [])
    },

    /**
     *  Returns the ids of vertices from all models.
     */
    allVerticesIds() {
      return this.editableModels.models.reduce((acc, model) => {
        acc.push(...model.vertices.map(v => v.id))
        return acc
      }, [])
    },

    /**
     *  Returns edges of model being edited.
     */
    edges() {
      if (this.editModel) {
        return this.editModel.edges
      }
      return null
    },

    /**
     *  Returns vertices of model being edited
     */
    vertices() {
      if (this.editModel) {
        return this.editModel.vertices
      }
      return null
    },

    editModel() {
      if (this.editableModelIndex >= 0) {
        return this.editableModels.models[this.editableModelIndex]
      }
      return null
    },

    editModelMeta() {
      return this.editableVertexIndex < 0 && this.editableEdgeIndex < 0
    }
  },

  watch: {
    models: {
      handler: function() {
        // do not update editable models if its equal to models
        if (
          JSON.stringify(this.models) === JSON.stringify(this.editableModels)
        ) {
          return
        }

        this.preventModelsChangedOnce = true
        this.editableModels = JSON.parse(JSON.stringify(this.models))
        if (this.editableModelIndex > this.editableModels.models.length - 1) {
          this.editableModelIndex = 0
        }
      },
      deep: true
    },
    editableModelIndex: function() {
      this.editableVertexIndex = -1
      this.editableEdgeIndex = -1

      this.paintGraph()
      this.personalizeGraph()
    },
    graphLayoutOptions: function() {
      this.editableVertexIndex = -1
      this.editableEdgeIndex = -1
      this.paintGraph()
    },

    // called every time when data, computed or props change
    editableModels: {
      handler: function(value) {
        if (this.preventModelsChangedOnce) {
          this.preventModelsChangedOnce = false
        } else {
          this.$emit('change', JSON.parse(JSON.stringify(value)))
        }
        this.paintGraph()
        this.personalizeGraph()
        this.undoredo.push(this.editableModels)
      },
      deep: true
    },
    editableVertexIndex: function(index) {
      this.personalizeGraph()
    },
    editableEdgeIndex: function(index) {
      this.personalizeGraph()
    }
  },

  methods: {
    keyPressHandler(event) {
      const tagName = event.target.tagName.toUpperCase()

      if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
        return
      }

      const deleteKey = 46
      const backspaceKey = 8

      const zKey = 90
      const yKey = 89

      const shiftKey = event.shiftKey
      const metaKey = event.metaKey || event.ctrlKey
      const keyCode = event.keyCode || event.which

      if (keyCode === deleteKey || keyCode === backspaceKey) {
        event.preventDefault()

        if (this.editableEdgeIndex >= 0) { this.removeEdge(this.edges[this.editableEdgeIndex].id) }
        if (this.editableVertexIndex >= 0) { this.removeVertex(this.vertices[this.editableVertexIndex].id) }

        return
      }

      if (shiftKey && metaKey && keyCode === yKey) {
        event.preventDefault()
        this.undo()
      } else if (shiftKey && metaKey && keyCode === zKey) {
        event.preventDefault()
        this.redo()
      } else if (metaKey && keyCode === zKey) {
        event.preventDefault()
        this.undo()
      } else if (metaKey && keyCode === yKey) {
        event.preventDefault()
        this.redo()
      }
    },

    undo() {
      const edgesLength = this.edges.length
      const verticesLength = this.vertices.length
      this.editableModels = this.undoredo.undo().current()
      if (this.edges.length !== edgesLength) { this.editableEdgeIndex = -1 }
      if (this.vertices.length !== verticesLength) { this.editableVertexIndex = -1 }
    },

    redo() {
      const edgesLength = this.edges.length
      const verticesLength = this.vertices.length
      this.editableModels = this.undoredo.redo().current()
      if (this.edges.length !== edgesLength) { this.editableEdgeIndex = -1 }
      if (this.vertices.length !== verticesLength) { this.editableVertexIndex = -1 }
    },

    paintGraph() {
      const models = [this.editableModels.models[this.editableModelIndex]]
      const { graph, legendDomain, legendRange } = createGraph(
        models,
        this.graphLayoutOptions
      )

      this.svg = this.renderGraph(graph)
      this.renderInteraction(graph)

      if (this.legendContainer) {
        renderLegend(this.legendContainer, legendDomain, legendRange)
      }
    },

    personalizeGraph() {
      this.svg.selectAll('.node').classed('edit', false)
      // select vertex
      if (this.editableVertexIndex >= 0) {
        this.svg
          .select('#' + this.vertices[this.editableVertexIndex].id)
          .classed('edit', true)
      }

      // select edge
      this.svg.selectAll('.edgePath').classed('edit', false)
      this.svg.selectAll('.edgeLabels .label').classed('edit', false)
      if (this.editableEdgeIndex >= 0) {
        this.svg
          .select('#' + this.edges[this.editableEdgeIndex].id)
          .classed('edit', true)
        this.svg
          .select('#label_' + this.edges[this.editableEdgeIndex].id)
          .classed('edit', true)
      }
    },

    selectVertex(id) {
      const vertex = this.getVertex(id)
      this.editableVertexIndex = this.vertices.indexOf(vertex)
      this.editableEdgeIndex = -1
      this.newVertex = false
    },

    selectEdge(id) {
      const edge = this.getEdge(id)
      this.editableEdgeIndex = this.edges.indexOf(edge)
      this.editableVertexIndex = -1
      this.newEdge = false
    },

    removeVertex(vertexId) {
      this.editableVertexIndex = -1
      this.editModel.edges = this.edges.filter(
        e => e.sourceVertexId !== vertexId && e.targetVertexId !== vertexId
      )
      this.editModel.vertices = this.vertices.filter(e => e.id !== vertexId)
    },

    removeEdge(edgeId) {
      this.editableEdgeIndex = -1
      this.editModel.edges = this.edges.filter(e => e.id !== edgeId)
    },

    removeModel(modelIndex) {
      this.editableModels.models.splice(modelIndex, 1)

      if (this.editableModels.models.length === 0) this.createModel()
      else if (this.editableModelIndex === this.editableModels.models.length) { this.editableModelIndex-- }

      this.hideDeleteModelPopUp()
    },

    createModel() {
      let index = 0
      while (this.allModelNames.includes(`NewModel${index}`)) {
        index += 1
      }

      let vertexId = 0
      while (this.allVerticesIds.includes(`v${vertexId}`)) {
        vertexId += 1
      }

      this.editableModels.models.push({
        name: `NewModel${index}`,
        generator: 'random(edge_coverage(100) && vertex_coverage(100))',
        startElementId: `v${vertexId}`,
        vertices: [
          {
            id: `v${vertexId}`,
            name: `v${vertexId}`
          }
        ],
        edges: []
      })
      this.editableModelIndex = this.editableModels.models.length - 1
    },

    createVertex() {
      let id = 0
      while (this.allVerticesIds.includes(`v${id}`)) {
        id += 1
      }

      const vertex = {
        id: `v${id}`,
        name: `v${id}`
      }
      this.vertices.push(vertex)
      this.selectVertex(vertex.id)
      this.newVertex = true
    },

    createEdge(sourceVertexId, targetVertexId) {
      let id = 0
      while (this.allEdgesIds.includes(`e${id}`)) {
        id += 1
      }

      const edge = {
        id: `e${id}`,
        name: `e${id}`,
        sourceVertexId,
        targetVertexId
      }
      this.edges.push(edge)
      this.selectEdge(edge.id)
      this.newEdge = true
    },

    getEdge(edgeId) {
      return this.edges.find(edge => edge.id === edgeId)
    },

    getVertex(vertexId) {
      return this.vertices.find(vertex => vertex.id === vertexId)
    },

    renderInteraction(graph) {
      const self = this

      const interaction = setupInteraction(this.svg, graph)

      interaction.onUpdateEdge = (edgeId, sourceVertexId, targetVertexId) => {
        const edge = self.getEdge(edgeId)
        edge.sourceVertexId = sourceVertexId
        edge.targetVertexId = targetVertexId
        self.selectEdge(edgeId)
      }
      interaction.onCreateEdge = (sourceVertexId, targetVertexId) => {
        self.createEdge(sourceVertexId, targetVertexId)
      }
      interaction.onSelectEdge = edgeId => {
        self.selectEdge(edgeId)
      }
      interaction.onSelectNode = vertexId => {
        self.selectVertex(vertexId)
      }
      interaction.onCreateNode = () => {
        self.createVertex()
      }
      interaction.onSelectModel = () => {
        this.editableVertexIndex = -1
        this.editableEdgeIndex = -1
      }
    },

    renderGraph(graph) {
      const container = this.$refs.container
      const tooltip = d3.select(container).select('div.mv-tooltip')
      const editor = d3.select(container).select('div.mv-editor')
      const svg = d3.select(container).select('svg.mv-visualizer')

      // set width and height of svg relative to container and editor
      const width = container.offsetWidth - editor.node().offsetWidth - 1
      const height = container.offsetHeight
      svg.attr('width', width).attr('height', height)

      // set transition duration for visibility in the graph
      graph.graph().transition = function(selection) {
        return selection.transition().duration(200)
      }

      // Create the renderer
      const render = new dagreD3.render() // eslint-disable-line new-cap
      const inner = svg.select('g#graph')

      // Run the renderer. This is what draws the final graph.
      render(inner, graph)
      // setupZoom(svg, graph)

      renderTooltips(svg, graph, tooltip)

      return svg
    },

    showDeleteModelPopUp() {
      this.displayDeleteModelPopUp = true
    },

    hideDeleteModelPopUp() {
      this.displayDeleteModelPopUp = false
    }
  }
}
</script>
