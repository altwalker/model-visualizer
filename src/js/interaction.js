function createDynamicPath(gInteraction, graph) {
  const dPath = {
    path: gInteraction.select("path.dynamicPath"),

    stx: 0,
    sty: 0,
    endx: 0,
    endy: 0,
    active: false,
    painted: false,
    startNodeId: null,
    endNodeId: null,
    edgeId: null,
    activate: function (nodeId, edgeId) {
      this.edgeId = edgeId;
      const node = graph.node(nodeId);
      const coords = d3
        .select(node.elem)
        .node()
        .getBoundingClientRect();

      this.endx = this.stx = coords.x + coords.width / 2;
      this.endy = this.sty = coords.y + coords.height / 2;
      this.startNodeId = nodeId;
      this.active = true;
    },
    paint: function (coords) {
      if (!this.active) return;
      if (!this.painted && !this.edgeId) {
        // support for drawing edge back to the same node
        this.endNodeId = this.startNodeId;
      }
      this.endx = coords[0];
      this.endy = coords[1];
      this.path
        .attr("class", "path dynamicPath")
        .attr("d", `M${this.stx},${this.sty}L${this.endx},${this.endy}`);
      this.painted = true;
    },
    hide: function () {
      this.path.attr("class", "path dynamicPath hidden");
      this.active = false;
      this.painted = false;
      this.startNodeId = null;
      this.endNodeId = null;
      this.edgeId = null;
    }
  };
  return dPath;
}

class Interaction {
  constructor() {
    this.onSelectNode = undefined;
    this.onCreateNode = undefined;
    this.onUpdateEdge = undefined;
    this.onCreateEdge = undefined;
    this.onSelectEdge = undefined;
  }

  updateEdge(edgeId, startNodeId, endNodeId) {
    if (this.onUpdateEdge) this.onUpdateEdge(edgeId, startNodeId, endNodeId);
  }
  createEdge(sourceVertexId, targetVertexId) {
    if (this.onCreateEdge) this.onCreateEdge(sourceVertexId, targetVertexId);
  }
  selectEdge(edgeId) {
    if (this.onSelectEdge) this.onSelectEdge(edgeId);
  }
  selectNode(nodeId) {
    if (this.onSelectNode) this.onSelectNode(nodeId);
  }
  createNode() {
    if (this.onCreateNode) this.onCreateNode();
  }
}

export function setupInteraction(svg, graph) {
  const interaction = new Interaction();

  var dLine = createDynamicPath(svg.select("g#interaction"), graph);
  var createNode = false;

  function mousemove() {
    var coords = d3.mouse(this);
    dLine.paint(coords);
    if (createNode) createNode = false;
  }
  function mouseup() {
    if (dLine.active) {
      if (dLine.startNodeId && dLine.endNodeId) {
        if (dLine.edgeId) {
          interaction.updateEdge(
            dLine.edgeId,
            dLine.startNodeId,
            dLine.endNodeId
          );
        } else {
          interaction.createEdge(dLine.startNodeId, dLine.endNodeId);
        }
      }
      if (!dLine.painted) {
        if (dLine.edgeId) {
          interaction.selectEdge(dLine.edgeId);
        } else {
          interaction.selectNode(dLine.startNodeId);
        }
      }
      dLine.hide();
    } else {
      if (createNode) interaction.createNode();
    }
  }
  function mouseout() {
    if (dLine.active) {
      dLine.endNodeId = null;
    }
  }
  function mouseover(d) {
    if (dLine.active) {
      dLine.endNodeId = d;
    }
  }

  svg.selectAll("g.node .label").attr("pointer-events", "none");
  svg
    .selectAll("g.node")
    .on("mousedown", nodeId => dLine.activate(nodeId))
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

  svg
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("mousedown", () => {
      createNode = true;
    });
  svg.selectAll(".edgePath, .edgeLabel").on("mousedown", edge => {
    dLine.activate(edge.v, edge.name);
  });
  return interaction;
}
