import * as d3 from 'd3'

function createDynamicPath(gInteraction, graph, svg) {
  const dPath = {
    path: gInteraction.select('path.dynamicPath'),

    stx: 0,
    sty: 0,
    endx: 0,
    endy: 0,
    active: false,
    painted: false,
    startNodeId: null,
    endNodeId: null,
    edgeId: null,

    getSvgLocation(x, y) {
      const pt = svg.node().createSVGPoint()

      pt.x = x
      pt.y = y

      return pt.matrixTransform(svg.node().getScreenCTM().inverse())
    },

    activate: function (nodeId, edgeId) {
      this.edgeId = edgeId
      const node = d3.select(graph.node(nodeId).elem).node()
      const coords = node.getBoundingClientRect()
      const location = this.getSvgLocation(coords.x + coords.width / 2, coords.y + coords.height / 2)

      this.endx = this.stx = location.x
      this.endy = this.sty = location.y
      this.startNodeId = nodeId
      this.active = true
    },
    paint: function (coords) {
      if (!this.active) return
      if (!this.painted && !this.edgeId) {
        // support for drawing edge back to the same node
        this.endNodeId = this.startNodeId
      }
      this.endx = coords[0]
      this.endy = coords[1]
      this.path
        .attr('class', 'path dynamicPath')
        .attr('d', `M${this.stx},${this.sty}L${this.endx},${this.endy}`)
      this.painted = true
    },
    hide: function () {
      this.path.attr('class', 'path dynamicPath hidden')
      this.active = false
      this.painted = false
      this.startNodeId = null
      this.endNodeId = null
      this.edgeId = null
    }
  }
  return dPath
}

class Interaction {
  constructor() {
    this.onSelectNode = undefined
    this.onCreateNode = undefined
    this.onUpdateEdge = undefined
    this.onCreateEdge = undefined
    this.onSelectEdge = undefined
    this.onSelectModel = undefined
  }

  updateEdge(edgeId, startNodeId, endNodeId) {
    if (this.onUpdateEdge) this.onUpdateEdge(edgeId, startNodeId, endNodeId)
  }

  createEdge(sourceVertexId, targetVertexId) {
    if (this.onCreateEdge) this.onCreateEdge(sourceVertexId, targetVertexId)
  }

  selectEdge(edgeId) {
    if (this.onSelectEdge) this.onSelectEdge(edgeId)
  }

  selectNode(nodeId) {
    if (this.onSelectNode) this.onSelectNode(nodeId)
  }

  createNode() {
    if (this.onCreateNode) this.onCreateNode()
  }

  selectModel() {
    if (this.onSelectModel) this.onSelectModel()
  }
}

export function setupInteraction(svg, graph) {
  const interaction = new Interaction()

  const dLine = createDynamicPath(svg.select('g#interaction'), graph, svg)

  function mousemove(event) {
    const coords = d3.pointer(event)
    dLine.paint(coords)
  }

  function mouseup() {
    if (dLine.active) {
      if (dLine.startNodeId && dLine.endNodeId) {
        if (dLine.edgeId) {
          interaction.updateEdge(
            dLine.edgeId,
            dLine.startNodeId,
            dLine.endNodeId
          )
        } else {
          interaction.createEdge(dLine.startNodeId, dLine.endNodeId)
        }
      }

      if (!dLine.painted) {
        if (dLine.edgeId) {
          interaction.selectEdge(dLine.edgeId)
        } else {
          interaction.selectNode(dLine.startNodeId)
        }
      }

      dLine.hide()
    }
  }

  function mouseout() {
    if (dLine.active) {
      dLine.endNodeId = null
    }
  }

  function mouseover(event, d) {
    if (dLine.active) {
      dLine.endNodeId = d
    }
  }

  svg.on('mousemove.interaction', mousemove)
    .on('mouseup.interaction', mouseup)
    .on('mousedown.interaction', () => { interaction.selectModel() })

  svg.selectAll('g.node .label').attr('pointer-events', 'none')
  svg.selectAll('g.node')
    .on('mousedown.interaction', (event, nodeId) => {
      event.stopPropagation()
      dLine.activate(nodeId)
    })
    .on('mouseout.interaction', mouseout)
    .on('mouseover.interaction', mouseover)

  svg.selectAll('.edgePath, .edgeLabel')
    .on('mousedown.interaction', (event, edge) => {
      event.stopPropagation()
      dLine.activate(edge.v, edge.name)
    })

  setupZoom(svg, graph)
  svg.on('dblclick.zoom',
    () => {
      interaction.createNode()
    })

  return interaction
}

export function setupZoom(svg, graph) {
  const inner = svg.select('g#graph')
  const zoom = d3.zoom()
    .scaleExtent([0.1, 7])
    .on('zoom', function (event) {
      inner.attr('transform', event.transform)
    })
  svg.call(zoom)
  if (!inner.attr('transform')) {
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(
        (svg.attr('width') - graph.graph().width) / 2,
        20
      )
    )
  }
}
