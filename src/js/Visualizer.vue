<template>
  <div ref="container" class="mv mv-viewmode">
    <svg class="mv-visualizer">
      <g id="graph" />
    </svg>

    <div class="mv-tooltip"></div>
  </div>
</template>

<script>
import { createGraph, renderTooltips, renderLegend } from './graph'
import { setupZoom } from './interaction'

export default {
  name: 'Visualizer',
  data: function() {
    return {
      svg: null
    }
  },
  props: {
    models: { type: Object, required: true },
    legendContainer: { type: String },
    graphLayoutOptions: { type: Object }
  },
  mounted: function() {
    this.paintGraph()
  },
  watch: {
    models: function() {
      this.paintGraph()
    },
    graphLayoutOptions: function() {
      this.paintGraph()
    }
  },
  methods: {
    paintGraph() {
      var { graph, legendDomain, legendRange } = createGraph(
        this.models.models,
        this.graphLayoutOptions
      )
      this.svg = this.renderGraph(this.$refs.container, graph)
      if (this.legendContainer) {
        renderLegend(this.legendContainer, legendDomain, legendRange)
      }
    },

    renderGraph(container, graph) {
      const svg = d3.select(container).select('svg')
      const tooltip = d3.select(container).select('div.mv-tooltip')
      var inner = svg.select('g#graph')

      const width = container.offsetWidth
      const height = container.offsetHeight

      svg.attr('width', width).attr('height', height)

      // Create the renderer
      var render = new dagreD3.render() // eslint-disable-line new-cap

      // Run the renderer. This is what draws the final graph.
      render(inner, graph)

      setupZoom(svg, graph)

      renderTooltips(svg, graph, tooltip)

      return svg
    }
  }
}
</script>
