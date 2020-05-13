import { isString } from 'lodash'

import { ValidationError, PlottingError } from './exceptions'

export var defaultModels = {
  name: 'Default Models',
  models: [
    {
      name: 'FirstModel',
      generator: 'random(edge_coverage(100) && vertex_coverage(100))',
      startElementId: 'v0',
      vertices: [
        {
          id: 'v0',
          name: 'vertex_zero'
        },
        {
          id: 'v1',
          name: 'vertex_one'
        },
        {
          id: 'v2',
          name: 'vertex_two',
          sharedState: 'link'
        }
      ],
      edges: [
        {
          id: 'e0',
          name: 'edge_A',
          sourceVertexId: 'v0',
          targetVertexId: 'v1'
        }
      ]
    },
    {
      name: 'SecondModel',
      generator: 'random(edge_coverage(100) && vertex_coverage(100))',
      vertices: [
        {
          id: 'v3',
          name: 'vertex_three',
          sharedState: 'link'
        },
        {
          id: 'v4',
          name: 'vertex_four'
        },
        {
          id: 'v5',
          name: 'vertex_five'
        }
      ],
      edges: [
        {
          id: 'e1',
          name: 'edge_B',
          sourceVertexId: 'v3',
          targetVertexId: 'v4'
        },
        {
          id: 'e2',
          name: 'edge_C',
          sourceVertexId: 'v4',
          targetVertexId: 'v5'
        },
        {
          id: 'e3',
          name: 'edge_D',
          sourceVertexId: 'v5',
          targetVertexId: 'v3'
        }
      ]
    }
  ]
}

const RESERVED_WORDS = [
  'as', 'for', 'and', 'yield', 'global', 'break', 'return', 'else', 'class', 'except', 'from', 'while', 'none',
  'not', 'await', 'true', 'elif', 'pass', 'or', 'def', 'del', 'import', 'false', 'continue', 'assert', 'is',
  'lambda', 'nonlocal', 'async', 'finally', 'if', 'in', 'try', 'with', 'raise', 'abstract', 'add', 'alias', 'as',
  'ascending', 'async', 'await', 'base', 'bool', 'break', 'by', 'byte', 'case', 'catch', 'char', 'checked', 'class',
  'const', 'continue', 'decimal', 'default', 'delegate', 'descending', 'do', 'double', 'dynamic', 'else', 'enum',
  'equals', 'event', 'explicit', 'extrem', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'from', 'get',
  'global', 'goto', 'group', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'into', 'is', 'join', 'let',
  'lock', 'long', 'nameof', 'namespace', 'new', 'null', 'object', 'on', 'operator', 'orderby', 'out', 'override',
  'params', 'partial', 'private', 'protected', 'public', 'readonly', 'ref', 'remove', 'return', 'sbyte', 'sealed',
  'select', 'set', 'short', 'static', 'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong',
  'unchecked', 'value', 'var', 'virtual', 'void', 'volatile', 'when', 'where', 'while', 'yield'
]

export function isKeyword(name) {
  if (RESERVED_WORDS.includes(name.toLowerCase())) {
    return true
  }

  return false
}

export function isIdentifier(name) {
  const identifierRegex = /^[_a-zA-Z]\w*$/

  if (!identifierRegex.test(name)) {
    return false
  }

  return true
}

export function isSharedStateValid(sharedState) {
  return isString(sharedState)
}

export function isWeightValid(weight) {
  if (weight === 0) {
    return true
  }

  if (!weight || weight < 0 || weight > 1) {
    return false
  }

  return true
}

export function isDependencyValid(dependency) {
  if (dependency === 0) {
    return true
  }

  if (!dependency || dependency < 0) {
    return false
  }

  return true
}

export function validateName(name, elementType) {
  elementType = elementType || 'Element'

  if (!isIdentifier(name)) {
    throw new ValidationError(`${elementType} name '${name}' is not a valid identifier. Name should start with a letter and characters '%$#!' are not allowed.`)
  }

  if (isKeyword(name)) {
    throw new ValidationError(`${elementType} name '${name}' is a reserved keyword.`)
  }

  return true
}

export function validateVertex(vertex) {
  if (!vertex.id) {
    throw new PlottingError('Each vertex must have a unique id.')
  }

  if (!vertex.name) {
    throw new ValidationError(`Vertex '${vertex.id}' does't have a name. Each vertex must have a name.`)
  }

  validateName(vertex.name, 'Vertex')

  if (vertex.sharedState && !isSharedStateValid(vertex.sharedState)) {
    throw new ValidationError(`Vertex '${vertex.id}' does't have a valid sharedState. Shared states must be strings.`)
  }
}

export function validateEdge(edge) {
  if (!edge.id) {
    throw new PlottingError('Each edge must have a unique id.')
  }

  if (edge.name) {
    validateName(edge.name, 'Edge')
  }

  if (!edge.targetVertexId) {
    throw new ValidationError(`Edge '${edge.id}' does't have a targetVertexId. Edge must have a targetVertexId.`)
  }

  if (edge.weight && !isWeightValid(edge.weight)) {
    throw new ValidationError(`Edge '${edge.id}' has an invalid weight of: ${edge.weight}. The weight must be a value between 0 and 1.`)
  }

  if (edge.dependency && !isDependencyValid(edge.dependency)) {
    throw new ValidationError(`Edge '${edge.id}' has an invalid dependency of: ${edge.dependency}. The dependency must be a positive number.`)
  }
}

export function validateModel(model) {
  if (!model.name) {
    throw new ValidationError('Each model must have a unique name.')
  }

  validateName(model.name, 'Model')

  if (!model.generator) {
    throw new ValidationError(`Model '${model.name}' doesn't have a generator. Each model must have a generator.`)
  }

  if (!model.vertices) {
    throw new ValidationError(`Model '${model.name}' doesn't have a list of vertices. Each model must have a list of vertices.`)
  }

  if (!model.edges) {
    throw new ValidationError(`Model '${model.name}' doesn't have a list of edges. Each model must have a list of edges.`)
  }
}

export function validateModelNames(modelNames) {
  modelNames.forEach((modelName, index) => {
    if (modelNames.indexOf(modelName) === index && modelNames.lastIndexOf(modelName) !== index) {
      throw new ValidationError(`Model name '${modelName}' appears at least two time. Model names should be unique.`)
    }
  })
}

export function validateModels(json) {
  const models = json.models

  if (!models) {
    throw new ValidationError('Models should not be empty.')
  }

  var verticesIds = {}
  var edgesIds = {}

  var hasStartElement = false
  var modelNames = []

  models.forEach(model => {
    validateModel(model)
    modelNames.push(model.name)

    var modelVerticesIds = {}
    var modelHasStartElement = false
    var modelHasSharedState = false

    model.vertices.forEach(vertex => {
      validateVertex(vertex)

      if (verticesIds[vertex.id] || edgesIds[vertex.id]) {
        throw new PlottingError(`Duplicate id '${vertex.id}'. Edges and vertices should have unique ids.`)
      }

      if (vertex.sharedState) {
        modelHasSharedState = true
      }

      verticesIds[vertex.id] = true
      modelVerticesIds[vertex.id] = true
    })

    model.edges.forEach(edge => {
      validateEdge(edge)

      if (edgesIds[edge.id] || verticesIds[edge.id]) {
        throw new PlottingError(`Duplicate id '${edge.id}'. Edges and vertices should have unique ids.`)
      }

      if (edge.sourceVertexId && !modelVerticesIds[edge.sourceVertexId]) {
        throw new ValidationError(`Edge '${edge.id}' has as sourceVertexId '${edge.sourceVertexId}' which does not exist in model '${model.name}'.`)
      }

      if (!modelVerticesIds[edge.targetVertexId]) {
        throw new ValidationError(`Edge '${edge.id}' has as targetVertexId '${edge.targetVertexId}' which does not exist in model '${model.name}'.`)
      }

      edgesIds[edge.id] = true
    })

    if (model.startElementId && !(verticesIds[model.startElementId] || edgesIds[model.startElementId])) {
      throw new ValidationError(`Starting element '${model.startElementId}' was not found.`)
    }

    if (model.startElementId) {
      modelHasStartElement = true
      hasStartElement = true
    }

    if (!modelHasStartElement && !modelHasSharedState) {
      throw new ValidationError(`Model '${model.name}' has neither a starting element nor a shared state.`)
    }
  })

  validateModelNames(modelNames)

  if (!hasStartElement) {
    throw new ValidationError('At least one model must have an startElementId.')
  }
}
