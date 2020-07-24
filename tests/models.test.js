/* global expect, describe, test */

import { ModelVisualizerError, ValidationError, PlottingError } from '../src/js/exceptions'
import { defaultModels, isKeyword, isIdentifier, isSharedStateValid, isWeightValid, isDependencyValid, validateName, validateModel, validateVertex, validateEdge, validateModelNames, validateModels } from '../src/js/models'

describe('isKeyword', () => {
  test('should return true for keywords', () => {
    expect(isKeyword('new')).toBe(true)
    expect(isKeyword('struct')).toBe(true)
    expect(isKeyword('lambda')).toBe(true)
  })

  test('should return false for non-keywords', () => {
    expect(isKeyword('non-keyword')).toBe(false)
    expect(isKeyword('nonKeyword')).toBe(false)
  })
})

describe('isIdentifier', () => {
  test('should return true for valid identifier', () => {
    expect(isIdentifier('valididentifier')).toBe(true)
    expect(isIdentifier('validIdentifier')).toBe(true)
    expect(isIdentifier('validIdentifier123')).toBe(true)
    expect(isIdentifier('validIdentifier123___')).toBe(true)
    expect(isIdentifier('_validIdentifier123_')).toBe(true)

    expect(isIdentifier('ᾩ')).toBe(true)
    expect(isIdentifier('ĦĔĽĻŎ')).toBe(true)
    expect(isIdentifier('〱〱〱〱')).toBe(true)
    expect(isIdentifier('जावास्क्रिप्ट')).toBe(true)
    expect(isIdentifier('KingGeorgeⅦ')).toBe(true)
  })

  test('should return false for invalid identifier', () => {
    expect(isIdentifier('1invalidIdentifier')).toBe(false)
    expect(isIdentifier('invalid identifier')).toBe(false)
    expect(isIdentifier('#invalididentifier')).toBe(false)
    expect(isIdentifier('invalididentifier#')).toBe(false)
  })
})

describe('isSharedStateValid', () => {
  test('should return true for valid shared states', () => {
    expect(isSharedStateValid('')).toBe(true)
    expect(isSharedStateValid('statedState')).toBe(true)
    expect(isSharedStateValid('shared_state')).toBe(true)
    expect(isSharedStateValid('statedState123')).toBe(true)
  })

  test('should return false for invalid shared states', () => {
    expect(isSharedStateValid(1.1)).toBe(false)
    expect(isSharedStateValid(NaN)).toBe(false)
    expect(isSharedStateValid(undefined)).toBe(false)
    expect(isSharedStateValid(null)).toBe(false)
  })
})

describe('isWeightValid', () => {
  test('should return true for valid weight', () => {
    expect(isWeightValid(0)).toBe(true)
    expect(isWeightValid(1)).toBe(true)
    expect(isWeightValid(0.33)).toBe(true)
  })

  test('should return false for invalid weight', () => {
    expect(isWeightValid('')).toBe(false)
    expect(isWeightValid(1.1)).toBe(false)
    expect(isWeightValid(NaN)).toBe(false)
    expect(isWeightValid(undefined)).toBe(false)
    expect(isWeightValid(null)).toBe(false)
  })
})

describe('isDependencyValid', () => {
  test('should return true for valid dependencies', () => {
    expect(isDependencyValid(0)).toBe(true)
    expect(isDependencyValid(1)).toBe(true)
    expect(isDependencyValid(0.333)).toBe(true)
    expect(isDependencyValid(100)).toBe(true)
    expect(isDependencyValid(100.333)).toBe(true)
    expect(isDependencyValid(1000)).toBe(true)
    expect(isDependencyValid(1000.333)).toBe(true)
  })

  test('should return false for invalid dependencies', () => {
    expect(isWeightValid('')).toBe(false)
    expect(isWeightValid(-1)).toBe(false)
    expect(isWeightValid(NaN)).toBe(false)
    expect(isWeightValid(undefined)).toBe(false)
    expect(isWeightValid(null)).toBe(false)
  })
})

describe('validateName', () => {
  test('should not throw error for valid names', () => {
    const f = () => validateName('validName', 'Model')

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('should throw error for keyword', () => {
    const f = () => validateName('return', 'Model')

    expect(f).toThrowError(new Error('Model name \'return\' is a reserved keyword.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should throw error for invalid identifier', () => {
    const f = () => validateName('1invalididentifier', 'Model')

    expect(f).toThrowError(new Error('Model name \'1invalididentifier\' is not a valid identifier. Valid characters for identifiers are uppercase/lowercase letters, underscore _, and digits except for the first charater.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should return the error messge with the default element type', () => {
    const f = () => validateName('return')

    expect(f).toThrowError(new Error('Element name \'return\' is a reserved keyword.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should return the error messge with the given element type', () => {
    const f = () => validateName('return', 'Vertex')

    expect(f).toThrowError(new Error('Vertex name \'return\' is a reserved keyword.'))
    expect(f).toThrowError(ValidationError)
  })
})

describe('validateVertex', () => {
  test('should trow an error if the vertex has no name', () => {
    const vertex = {
      id: 'v1'
    }
    const f = () => validateVertex(vertex)

    expect(f).toThrowError(new Error('Vertex \'v1\' does\'t have a name. Each vertex must have a name.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if the vertex name is a keyword', () => {
    const vertex = {
      name: 'return',
      id: 'v1'
    }
    const f = () => validateVertex(vertex)

    expect(f).toThrowError(new Error('Vertex name \'return\' is a reserved keyword.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if the vertex name is not a valid identifier', () => {
    const vertex = {
      name: '1invalididentifier',
      id: 'v1'
    }
    const f = () => validateVertex(vertex)

    expect(f).toThrowError(new Error('Vertex name \'1invalididentifier\' is not a valid identifier. Valid characters for identifiers are uppercase/lowercase letters, underscore _, and digits except for the first charater.'))
    expect(f).toThrowError(ValidationError)
  })
})

describe('validateEdge', () => {
  test('should not trow an error for a valid edge', () => {
    const edge = {
      id: 'e1',
      name: 'edgeName',
      sourceVertexId: 'v0',
      targetVertexId: 'v1',
      weight: 0.333,
      dependency: 100
    }
    const f = () => validateEdge(edge)

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('should not throw an error if the edge has no name', () => {
    const edge = {
      id: 'e1',
      sourceVertexId: 'v0',
      targetVertexId: 'v1'
    }
    const f = () => validateEdge(edge)

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('should not throw an error if the edge has no sourceVertexId', () => {
    const edge = {
      id: 'e1',
      name: 'edgeName',
      targetVertexId: 'v1'
    }
    const f = () => validateEdge(edge)

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('should throw an error if the edge has an invalid weight', () => {
    const edge = {
      id: 'e1',
      name: 'edgeName',
      targetVertexId: 'v1',
      weight: 1.333
    }
    const f = () => validateEdge(edge)

    expect(f).toThrowError(new Error('Edge \'e1\' has an invalid weight of: 1.333. The weight must be a value between 0 and 1.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should throw an error if the edge has an invalid dependency', () => {
    const edge = {
      id: 'e1',
      name: 'edgeName',
      targetVertexId: 'v1',
      dependency: -100
    }
    const f = () => validateEdge(edge)

    expect(f).toThrowError(new Error('Edge \'e1\' has an invalid dependency of: -100. The dependency must be a positive number.'))
    expect(f).toThrowError(ValidationError)
  })
})

describe('validateModel', () => {
  test('should trow an error if the model has no name', () => {
    const model = {
      generator: 'random(never)',
      vertices: [],
      edges: []
    }
    const f = () => validateModel(model)

    expect(f).toThrowError(new Error('Each model must have a unique name.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if model has no generators', () => {
    const model = {
      name: 'ModelName',
      vertices: [],
      edges: []
    }
    const f = () => validateModel(model)

    expect(f).toThrowError(new Error('Model \'ModelName\' doesn\'t have a generator. Each model must have a generator.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error the model has no verices list', () => {
    const models = {
      name: 'ModelName',
      generator: 'random(never)',
      edges: []
    }
    const f = () => validateModel(models)

    expect(f).toThrowError(new Error('Model \'ModelName\' doesn\'t have a list of vertices. Each model must have a list of vertices.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if one of the models has no edges list', () => {
    const model = {
      name: 'ModelName',
      generator: 'random(never)',
      vertices: []
    }
    const f = () => validateModel(model)

    expect(f).toThrowError(new Error('Model \'ModelName\' doesn\'t have a list of edges. Each model must have a list of edges.'))
    expect(f).toThrowError(ValidationError)
  })
})

describe('validateModelNames', () => {
  test('is should not trow error if there are no duplicate names', () => {
    const f = () => validateModelNames(['ModelA', 'ModelB'])

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('is should trow error if there are duplicate names', () => {
    const f = () => validateModelNames(['ModelA', 'ModelA'])

    expect(f).toThrowError(new Error('Model name \'ModelA\' appears at least two time. Model names should be unique.'))
    expect(f).toThrowError(ValidationError)
  })
})

describe('validateModels', () => {
  test('defaultModels should be valid', () => {
    const f = () => validateModels(defaultModels)

    expect(f).not.toThrowError(ModelVisualizerError)
  })

  test('should trow an error for empty models', () => {
    const emptyModels = {
      name: 'Emply Models'
    }
    const f = () => validateModels(emptyModels)

    expect(f).toThrowError(new Error('Models should not be empty.'))
    expect(f).toThrowError(ModelVisualizerError)
  })

  test('should trow an error if one of the models has no name', () => {
    const models = {
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          generator: 'random(never)',
          vertices: [],
          edges: []
        }
      ]
    }
    const f = () => validateModels(models)

    expect(f).toThrowError(new Error('Each model must have a unique name.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if one of the models has no generators', () => {
    const models = {
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          name: 'ModelB',
          vertices: [],
          edges: []
        }
      ]
    }
    const f = () => validateModels(models)

    expect(f).toThrowError(new Error('Model \'ModelB\' doesn\'t have a generator. Each model must have a generator.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if one of the models has no verices list', () => {
    const models = {
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          name: 'ModelB',
          generator: 'random(never)',
          edges: []
        }
      ]
    }
    const f = () => validateModels(models)

    expect(f).toThrowError(new Error('Model \'ModelB\' doesn\'t have a list of vertices. Each model must have a list of vertices.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if one of the models has no edges list', () => {
    const models = {
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          name: 'ModelB',
          generator: 'random(never)',
          vertices: []
        }
      ]
    }
    const f = () => validateModels(models)

    expect(f).toThrowError(new Error('Model \'ModelB\' doesn\'t have a list of edges. Each model must have a list of edges.'))
    expect(f).toThrowError(ValidationError)
  })

  test('should trow an error if a vertex from another model is referenced as sourceVertexId', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          name: 'ModelB',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v2',
              name: 'vertexB'
            },
            {
              id: 'v3',
              name: 'vertexC'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'e1',
              sourceVertexId: 'v1',
              targetVertexId: 'v2'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Edge \'e1\' has as sourceVertexId \'v1\' which does not exist in model \'ModelB\'.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error if a vertex from another model is referenced as targetVertexId', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          startElementId: 'v1',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: []
        },
        {
          name: 'ModelB',
          generator: 'random(never)',
          vertices: [
            {
              id: 'v2',
              name: 'vertexB'
            },
            {
              id: 'v3',
              name: 'vertexC'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'e1',
              sourceVertexId: 'v2',
              targetVertexId: 'v1'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Edge \'e1\' has as targetVertexId \'v1\' which does not exist in model \'ModelB\'.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error if the sourceVertexId is not valid', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v2',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: 'v3',
              name: 'vertexB'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'e1',
              sourceVertexId: 'v2',
              targetVertexId: 'v1'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Edge \'e1\' has as sourceVertexId \'v2\' which does not exist in model \'ModelA\'.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error if the targetVertexId is not valid', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v2',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: 'v3',
              name: 'vertexB'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'e1',
              sourceVertexId: 'v1',
              targetVertexId: 'v2'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Edge \'e1\' has as targetVertexId \'v2\' which does not exist in model \'ModelA\'.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error if a vertex has no id', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              name: 'vertexB'
            },
            {
              id: 'v2',
              name: 'vertexC'
            }
          ],
          edges: []
        }
      ]
    })

    expect(f).toThrowError(new Error('Each vertex must have a unique id.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error for duplicate vertex ids', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v2',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: 'v2',
              name: 'vertexB'
            },
            {
              id: 'v1',
              name: 'vertexC'
            }
          ],
          edges: []
        }
      ]
    })

    expect(f).toThrowError(new Error('Duplicate id \'v1\'. Edges and vertices should have unique ids.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error if a edge has no id', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: 'v2',
              name: 'vertexB'
            },
            {
              id: 'v3',
              name: 'vertexC'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'edgeA',
              sourceVertexId: 'v1',
              targetVertexId: 'v2'
            },
            {
              name: 'edgeB',
              sourceVertexId: 'v2',
              targetVertexId: 'v3'
            },
            {
              id: 'e2',
              name: 'edgeB',
              sourceVertexId: 'v3',
              targetVertexId: 'v2'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Each edge must have a unique id.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error for duplicate edge ids', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: 'v2',
              name: 'vertexB'
            }
          ],
          edges: [
            {
              id: 'e1',
              name: 'edgeA',
              sourceVertexId: 'v1',
              targetVertexId: 'v2'
            },
            {
              id: 'e1',
              name: 'edgeA',
              sourceVertexId: 'v2',
              targetVertexId: 'v1'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Duplicate id \'e1\'. Edges and vertices should have unique ids.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should trow an error for duplicate id', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: [
            {
              id: 'v1',
              name: 'edgeA',
              sourceVertexId: 'v1',
              targetVertexId: 'v1'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Duplicate id \'v1\'. Edges and vertices should have unique ids.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should throw an error if a vertex has no name', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            },
            {
              id: '',
              name: 'vertexB'
            }
          ],
          edges: []
        }
      ]
    })

    expect(f).toThrowError(new Error('Each vertex must have a unique id.'))
    expect(f).toThrowError(PlottingError)
  })

  test('should throw an error if a vertex has no name', () => {
    const f = () => validateModels({
      name: 'Test Models',
      models: [
        {
          name: 'ModelA',
          generator: 'random(never)',
          startElementId: 'v1',
          vertices: [
            {
              id: 'v1',
              name: 'vertexA'
            }
          ],
          edges: [
            {
              id: '',
              name: 'edgeA',
              sourceVertexId: 'v1',
              targetVertexId: 'v1'
            }
          ]
        }
      ]
    })

    expect(f).toThrowError(new Error('Each edge must have a unique id.'))
    expect(f).toThrowError(PlottingError)
  })
})
