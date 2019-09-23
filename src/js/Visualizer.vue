<template>
  <div ref="container" class="mv mv-viewmode">
    <svg class="mv-visualizer">
      <g id="graph" />
    </svg>
    <div class="mv-tooltip"></div>
  </div>
</template>

<script>
import { createGraph, renderTooltips } from "./graph";

export default {
  name: "Visualizer",
  data: function() {
    return {
      svg: null
    };
  },
  props: {
    models: { type: Object, required: true }
  },
  mounted: function() {
    this.paintGraph();
  },
  watch: {
    models: function() {
      this.paintGraph();
    }
  },
  methods: {
    paintGraph() {
      var { graph } = createGraph(this.models.models);
      this.svg = this.renderGraph(this.$refs.container, graph);
    },

    renderGraph(container, graph) {
      let svg = d3.select(container).select("svg");
      let tooltip = d3.select(container).select("div.mv-tooltip");

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      svg.attr("width", width).attr("height", height);

      var inner = svg.select("g#graph");

      var zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
      });

      svg.call(zoom);

      // Create the renderer
      var render = new dagreD3.render();

      // Run the renderer. This is what draws the final graph.
      render(inner, graph);

      // Center the graph
      var initialScale = 1;
      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate(
            (svg.attr("width") - graph.graph().width * initialScale) / 2,
            20
          )
          .scale(initialScale)
      );

      renderTooltips(svg, graph, tooltip);
      // renderLegend();

      return svg;
    }
  }
};
</script>