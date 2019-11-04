import dagreD3 from "dagre-d3";

let fakeNodesCount = 0;
const commonLegendDommain = ["Start Vertex", "Blocked Vertex", "Fake Vertex"];
const commonLegendRange = ["#b7e2b1", "#7f8c8d", "#3498db"];

function createVertexLabel(vertex, startElementsIds) {
  const nodeLabelClass = "node-label";
  const startNodeLabelClass = "node-start";
  const fakeNodeLabelClass = "node-fake";

  let label = {
    id: vertex.id,
    label: vertex.name,
    class: nodeLabelClass
  };

  if (vertex.sharedState) {
    label.sharedState = vertex.sharedState;
  }

  if (vertex.properties && vertex.properties.blocked) {
    label.class += " " + "node-blocked";
    label.blocked = true;
  }

  if (vertex.description) {
    label.description = vertex.description;
  }

  if (vertex.properties) {
    label.properties = vertex.properties;
  }

  if (startElementsIds.includes(vertex.id)) {
    label.class += " " + startNodeLabelClass;
  }

  if (vertex.name === "fake_vertex") {
    label.class += " " + fakeNodeLabelClass;
  }

  return label;
}

function createEdgeLable(edge) {
  let label = {
    id: edge.id,
    labelId: "label_" + edge.id,
    targetVertexId: edge.targetVertexId,
    label: edge.name
  };

  if (edge.sourceVertexId) {
    label.sourceVertexId = edge.sourceVertexId;
  }

  if (edge.guard) {
    label.guard = edge.guard;
  }

  if (edge.actions) {
    label.actions = edge.actions;
  }

  return label;
}

function createFakeVertex() {
  let fakeVertex = {
    id: "fake_vertex" + fakeNodesCount,
    name: "fake_vertex",
    description: "Fake vertex created for starting edge."
  };

  return fakeVertex;
}

function setStartingEdge(graph, edge, startElementsIds) {
  let fakeVertex = createFakeVertex();

  graph.setNode(fakeVertex.id, createVertexLabel(fakeVertex, startElementsIds));
  graph.setEdge(
    fakeVertex.id,
    edge.targetVertexId,
    createEdgeLable(edge),
    edge.id
  );
}

export function createGraph(models, graphOptions) {
  fakeNodesCount = 0;

  // Create a new directed graph
  var graph = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph(graphOptions || {});

  var vertices = models.reduce((acc, cur) => acc.concat(cur.vertices), []);
  var edges = models.reduce((acc, cur) => acc.concat(cur.edges), []);

  var startElementsIds = models.map(x => x.startElementId);
  var sharedStates = vertices.reduce((acc, cur) => {
    if (cur.sharedState) {
      if (acc.hasOwnProperty(cur.sharedState)) {
        acc[cur.sharedState].push(cur.id);
      } else {
        acc[cur.sharedState] = [cur.id];
      }
    }

    return acc;
  }, {});

  var sharedStatesNames = Object.keys(sharedStates);
  var colors = {}
  // Automatically label each of the nodes
  vertices.forEach(function (vertex) {
    graph.setNode(vertex.id, createVertexLabel(vertex, startElementsIds));
    if (vertex.properties && vertex.properties.color) { colors[vertex.id] = vertex.properties.color; }
  });

  edges.forEach(function (edge) {
    if (edge.sourceVertexId) {
      graph.setEdge(
        edge.sourceVertexId,
        edge.targetVertexId,
        createEdgeLable(edge),
        edge.id
      );
    } else {
      setStartingEdge(graph, edge, startElementsIds);
    }
  });

  // Set some general styles
  const color = d3
    .scaleOrdinal()
    .domain(sharedStatesNames)
    .range(
      d3.quantize(
        t => {
          return d3.interpolateSpectral(t * 0.4 + 0.3)
        },
        Math.max(sharedStatesNames.length, 2)
      )
    );
  console.log(colors)
  graph.nodes().forEach(function (v) {
    var node = graph.node(v);
    node.rx = node.ry = 5;

    sharedStatesNames.forEach(key => {
      if (sharedStates[key].includes(v)) {
        node.style = "fill: " + color(key);
      }
    });
    if (colors[v]) { node.style = "fill: " + colors[v] + "!important"; }
  });
  return {
    graph: graph,
    legendDomain: [...commonLegendDommain, ...sharedStatesNames],
    legendRange: [
      ...commonLegendRange,
      ...sharedStatesNames.map(name => color(name))
    ]
  };
}

function generateNodeTooltipHTML(graph, d) {
  let node = graph.node(d);
  let html = "";

  if (node.blocked) {
    html += "<span class='font-weight-bolder'>BLOCKED</span>" + "<br/>";
  }

  html +=
    "Id: " +
    "<span class='font-weight-bolder'>" +
    node.id +
    "</span>" +
    "<br/>";

  if (node.description) {
    html +=
      "Description: " +
      "<span class='font-weight-bolder'>" +
      node.description +
      "</span>" +
      "<br/>";
  }

  if (node.sharedState) {
    html +=
      "Shared State: " +
      "<span class='font-weight-bolder'>" +
      node.sharedState +
      "</span>" +
      "<br/>";
  }

  if (node.properties) {
    html += "<br/>Properties: <br/>";
    Object.keys(node.properties).forEach(key => {
      html +=
        key +
        ": <span class='font-weight-bolder'>" +
        node.properties[key] +
        "</span>" +
        "<br/>";
    });
  }

  return html;
}

function generateEdgeTootipHtml(graph, d) {
  let edge = graph.edge(d.v, d.w, d.name);
  let html = "";

  html += "Id: <span class='font-weight-bolder'>" + edge.id + "</span><br/>";

  if (edge.sourceVertexId) {
    html +=
      "Source Vertex Id: <span class='font-weight-bolder'>" +
      edge.sourceVertexId +
      "</span><br/>";
  }

  html +=
    "Target Vertex Id: <span class='font-weight-bolder'>" +
    edge.targetVertexId +
    "</span><br/>";

  if (edge.guard) {
    html += "<br/>Guard: <span class='code'>" + edge.guard + "</span><br/>";
  }

  if (edge.actions) {
    html += "<br/>Actions: <br/>";
    edge.actions.forEach(action => {
      html += "<span class='code'>" + action + "</span><br/>";
    });
  }

  return html;
}

function addTootips(svg, tooltip, cssSelector, htlmFunction, graph) {
  const tooltipOffset = {
    x: 12,
    y: 12
  };

  svg
    .selectAll(cssSelector)
    .on("mouseover", d => {
      tooltip
        .transition()
        .style("display", "block")
        .style("opacity", 1);

      tooltip
        .html(htlmFunction(graph, d))
        .style("left", d3.event.pageX + tooltipOffset.x + "px")
        .style("top", d3.event.pageY + tooltipOffset.y + "px")
        .style("cursor", "pointer");
    })
    .on("mouseout", d => {
      tooltip
        .transition()
        .style("display", "none")
        .style("opacity", 0)
        .style("cursor", "auto");
    });
}

export function renderTooltips(svg, graph, tooltip) {
  tooltip.style("display", "none").style("opacity", 0);

  addTootips(svg, tooltip, ".node", generateNodeTooltipHTML, graph);
  addTootips(
    svg,
    tooltip,
    ".edgePath, .edgeLabel",
    generateEdgeTootipHtml,
    graph
  );
}

export function renderLegend(legendContainer, legendDomain, legendRange) {
  let container = d3.select("#" + legendContainer);
  container.selectAll("svg").remove()
  let svg = container.append("svg")

  svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(20,20)");

  var ordinal = d3.scaleOrdinal()
    .domain(legendDomain)
    .range(legendRange);

  var legend = d3.legendColor()
    .title("Graph Legend")
    .scale(ordinal);

  svg.select(".legendQuant")
    .call(legend);
}
