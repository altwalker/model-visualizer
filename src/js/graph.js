import * as dagreD3 from 'dagre-d3-es'
import * as d3 from 'd3'
import { legendColor } from 'd3-svg-legend'
import { isEmpty, omit } from 'lodash'

let fakeNodesCount = 0

const commonLegendDommain = ['Start Vertex', 'Blocked Vertex', 'Fake Vertex']
const commonLegendRange = ['var(--start-vertex-color)', 'var(--blocked-vertex-color)', 'var(--fake-vertex-color)']

function createVertexLabel(vertex, startElementsIds) {
  const nodeLabelClass = 'node-label'
  const startNodeLabelClass = 'node-start'
  const fakeNodeLabelClass = 'node-fake'

  const label = {
    id: vertex.id,
    label: vertex.name,
    class: nodeLabelClass
  }

  if (vertex.sharedState) {
    label.sharedState = vertex.sharedState
  }

  if (vertex.properties && vertex.properties.blocked) {
    label.class += ' ' + 'node-blocked'
    label.blocked = true
  }

  if (vertex.properties && vertex.properties.description) {
    label.description = vertex.properties.description
  }

  if (vertex.properties) {
    label.properties = omit(vertex.properties, ['blocked', 'description'])
  }

  if (startElementsIds.includes(vertex.id)) {
    label.class += ' ' + startNodeLabelClass
  }

  if (vertex.name === 'fake_vertex') {
    label.class += ' ' + fakeNodeLabelClass
  }

  return label
}

function createEdgeLable(edge) {
  const label = {
    id: edge.id,
    labelId: 'label_' + edge.id,
    targetVertexId: edge.targetVertexId,
    label: edge.name
  }

  if (edge.properties && edge.properties.description) {
    label.description = edge.properties.description
  }

  if (edge.sourceVertexId) {
    label.sourceVertexId = edge.sourceVertexId
  }

  if (edge.guard) {
    label.guard = edge.guard
  }

  if (edge.actions) {
    label.actions = edge.actions
  }

  if (edge.properties) {
    label.properties = omit(edge.properties, ['description'])
  }

  return label
}

function createFakeVertex() {
  const fakeVertex = {
    id: 'fake_vertex' + fakeNodesCount,
    name: 'fake_vertex',
    description: 'Fake vertex created for starting edge.'
  }

  return fakeVertex
}

function setStartingEdge(graph, edge, startElementsIds) {
  const fakeVertex = createFakeVertex()

  graph.setNode(fakeVertex.id, createVertexLabel(fakeVertex, startElementsIds))
  graph.setEdge(
    fakeVertex.id,
    edge.targetVertexId,
    createEdgeLable(edge),
    edge.id
  )
}

export function createGraph(models, graphOptions) {
  fakeNodesCount = 0

  // Create a new directed graph
  var graph = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph(graphOptions || {})

  var vertices = models.reduce((acc, cur) => acc.concat(cur.vertices), [])
  var edges = models.reduce((acc, cur) => acc.concat(cur.edges), [])

  var startElementsIds = models.map(x => x.startElementId)
  var sharedStates = vertices.reduce((acc, cur) => {
    if (cur.sharedState) {
      if (acc[cur.sharedState]) {
        acc[cur.sharedState].push(cur.id)
      } else {
        acc[cur.sharedState] = [cur.id]
      }
    }

    return acc
  }, {})

  var sharedStatesNames = Object.keys(sharedStates)
  var colors = {}

  // Automatically label each of the nodes
  vertices.forEach(function (vertex) {
    graph.setNode(vertex.id, createVertexLabel(vertex, startElementsIds))
    if (vertex.properties && vertex.properties.color) { colors[vertex.id] = vertex.properties.color }
  })

  edges.forEach(function (edge) {
    if (edge.sourceVertexId) {
      graph.setEdge(
        edge.sourceVertexId,
        edge.targetVertexId,
        createEdgeLable(edge),
        edge.id
      )
    } else {
      setStartingEdge(graph, edge, startElementsIds)
    }
  })

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
    )
  graph.nodes().forEach(function (v) {
    const node = graph.node(v)
    node.rx = node.ry = 1

    sharedStatesNames.forEach(key => {
      if (sharedStates[key].includes(v)) {
        node.style = 'fill: ' + color(key)
      }
    })
    if (colors[v]) { node.style = 'fill: ' + colors[v] + '!important' }
  })

  return {
    graph: graph,
    legendDomain: [...commonLegendDommain, ...sharedStatesNames.map(name => `Shared State: ${name}`)],
    legendRange: [
      ...commonLegendRange,
      ...sharedStatesNames.map(name => color(name))
    ]
  }
}

function generateDescriptionHtml(description) {
  let html = ''

  if (description) {
    html += `<div>Description: <span>${description}</span></div>`
  }

  return html
}

function generateActionsHtml(actions) {
  let html = ''

  if (actions && !isEmpty(actions)) {
    html += '<div>Actions:'

    actions.forEach(action => {
      html += `<div><span class='mv-tooltip-code'>${action}</span></div>`
    })

    html += '</div>'
  }

  return html
}

function generatePropertiesHtml(properties) {
  let html = ''

  if (properties && !isEmpty(properties)) {
    html += '<div>Properties:'

    Object.keys(properties).forEach(key => {
      html += `<div>${key}: <span>${properties[key]}</span></div>`
    })

    html += '</div>'
  }

  return html
}

function generateNodeTooltipHtml(graph, d) {
  const node = graph.node(d)
  let html = `<div>Id: <span>${node.id}</span> ${node.blocked ? '<span>[BLOCKED]</span>' : ''}</div>`

  html += generateDescriptionHtml(node.description)

  if (node.sharedState) {
    html += `<div> Shared State: <span>${node.sharedState}</span></div>`
  }

  html += generatePropertiesHtml(node.properties)

  return html
}

function generateEdgeTootipHtml(graph, d) {
  const edge = graph.edge(d.v, d.w, d.name)
  let html = `<div>Id: <span>${edge.id}</span></div>`

  html += generateDescriptionHtml(edge.description)

  if (edge.sourceVertexId) {
    html += `<div>Source Vertex Id: <span>${edge.sourceVertexId}</span></div>`
  }

  html += `<div>Target Vertex Id: <span>${edge.targetVertexId}</span></div>`

  if (edge.guard) {
    html += `<div>Guard: <span class='mv-tooltip-code'>${edge.guard}</span></div>`
  }

  html += generateActionsHtml(edge.actions)
  html += generatePropertiesHtml(edge.properties)

  return html
}

function addTootips(svg, tooltip, cssSelector, htlmFunction, graph) {
  const tooltipOffset = {
    x: 12,
    y: 12
  }

  svg
    .selectAll(cssSelector)
    .on('mouseover.tooltip', (event, d) => {
      tooltip
        .transition()
        .style('display', 'block')
        .style('opacity', 1)

      tooltip
        .html(htlmFunction(graph, d))
        .style('left', event.pageX + tooltipOffset.x + 'px')
        .style('top', event.pageY + tooltipOffset.y + 'px')
        .style('cursor', 'pointer')
    })
    .on('mouseout.tooltip', d => {
      tooltip
        .transition()
        .style('display', 'none')
        .style('opacity', 0)
        .style('cursor', 'auto')
    })
}

export function renderTooltips(svg, graph, tooltip) {
  tooltip.style('display', 'none').style('opacity', 0)

  addTootips(svg, tooltip, '.node', generateNodeTooltipHtml, graph)
  addTootips(
    svg,
    tooltip,
    '.edgePath, .edgeLabel',
    generateEdgeTootipHtml,
    graph
  )
}

export function renderLegend(legendContainer, legendDomain, legendRange) {
  const container = d3.select('#' + legendContainer)
  container.selectAll('svg').remove()

  // set the height of the svg to 25px for each line + the title
  const svg = container.append('svg')
    .style('height', `${25 * (legendDomain.length + 1)}px`)
    .style('width', '100%')

  svg.append('g')
    .attr('class', 'legendQuant')
    .attr('transform', 'translate(20,20)')

  var ordinal = d3.scaleOrdinal()
    .domain(legendDomain)
    .range(legendRange)

  var legend = legendColor()
    .title('Graph Legend')
    .scale(ordinal)

  svg.select('.legendQuant')
    .call(legend)
}
