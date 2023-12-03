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

import * as dagreD3 from 'dagre-d3-es'
import * as d3 from 'd3'

export default {
  name: 'VisualizerComponent',
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
      const { graph, legendDomain, legendRange } = createGraph(
        this.models.models,
        this.graphLayoutOptions
      )
      this.svg = this.renderGraph(this.$refs.container, graph)
      if (this.legendContainer) {
        renderLegend(this.legendContainer, legendDomain, legendRange)
      }
    },

    renderGraph(container, graph) {
      const svg = d3.select(container).select('svg.mv-visualizer')
      const tooltip = d3.select(container).select('div.mv-tooltip')
      const inner = svg.select('g#graph')

      const width = container.offsetWidth
      const height = container.offsetHeight

      svg.attr('width', width).attr('height', height)

      // Create the renderer
      const render = new dagreD3.render() // eslint-disable-line new-cap

      // Run the renderer. This is what draws the final graph.
      render(inner, graph)

      setupZoom(svg, graph)

      renderTooltips(svg, graph, tooltip)

      return svg
    }
  }
}
</script>
