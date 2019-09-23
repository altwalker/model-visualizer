export var defaultModels = {
  name: "Default model",
  models: [
    {
      name: "First Model",
      generator: "random(edge_coverage(100) && vertex_coverage(100))",
      startElementId: "v0",
      vertices: [
        {
          id: "v0",
          name: "vertex_zero"
        },
        {
          id: "v1",
          name: "vertex_one"
        },
        {
          id: "v2",
          name: "vertex_two"
        }
      ],
      edges: [
        {
          id: "e0",
          name: "edge_A",
          sourceVertexId: "v0",
          targetVertexId: "v1"
        }
      ]
    },
    {
      name: "Second Model",
      generator: "random(edge_coverage(100) && vertex_coverage(100))",

      vertices: [
        {
          id: "v3",
          name: "vertex_three"
        },
        {
          id: "v4",
          name: "vertex_four"
        },
        {
          id: "v5",
          name: "vertex_five"
        }
      ],
      edges: [
        {
          id: "e1",
          name: "edge_B",
          sourceVertexId: "v3",
          targetVertexId: "v4"
        },
        {
          id: "e2",
          name: "edge_C",
          sourceVertexId: "v4",
          targetVertexId: "v5"
        },
        {
          id: "e3",
          name: "edge_D",
          sourceVertexId: "v5",
          targetVertexId: "v3"
        }
      ]
    }
  ]
};

export function validateModels(json) {
  let models = json["models"];

  if (!models) {
    throw "Models should not be empty.";
  }

  var verticesIds = {};
  var edgesIds = {};

  var hasStartElement = false;

  models.forEach(model => {
    validataModel(model);
    var modelVerticesIds = {};

    model.vertices.forEach(vertex => {
      validateVertex(vertex);

      if (verticesIds[vertex.id]) {
        throw `Vertex id ${
          vertex.id
        } appears at least 2 times all models. Vertex ids should be unique across all models.`;
      }

      verticesIds[vertex.id] = true;
      modelVerticesIds[vertex.id] = true;
    });

    model.edges.forEach(edge => {
      validateEdge(edge);

      if (edgesIds[edge.id]) {
        throw `Edge id ${
          edge.id
        } appears at least 2 times. Edge ids should be unique across all models.`;
      }

      if (edge.sourceVertexId && !modelVerticesIds[edge.sourceVertexId]) {
        throw `Vertex id ${
          edge.sourceVertexId
        } defined as sourceVertexId of edge id ${
          edge.id
        } does not exist in vertices definition of model ${model.name}.`;
      }

      if (!modelVerticesIds[edge.targetVertexId]) {
        throw `Vertex id ${
          edge.targetVertexId
        } defined as targetVertexId of edge id ${
          edge.id
        } does not exist in vertices definition of model ${model.name}.`;
      }

      edgesIds[edge.id] = true;
    });

    if (
      model.startElementId &&
      !(verticesIds[model.startElementId] || edgesIds[model.startElementId])
    ) {
      throw `startElementId ${model.startElementId} is not a valid element.`;
    }

    if (model.startElementId) {
      hasStartElement = true;
    }
  });

  if (!hasStartElement) {
    throw "At least one model must have an startElementId.";
  }
}

function validataModel(model) {
  if (!model.name) {
    throw "Each model must have an unique name.";
  }

  if (!model.generator) {
    throw "Each model must a have a generator.";
  }

  if (!model.vertices) {
    throw "Each model must have a list of vertices.";
  }

  if (!model.edges) {
    throw "Each model must have a list of edges.";
  }
}

function validateVertex(vertex) {
  if (!vertex.id) {
    throw "Each vertex must have an unique id.";
  }

  if (!vertex.name) {
    throw "Each vertex must have a name.";
  }
}

function validateEdge(edge) {
  if (!edge.id) {
    throw "Each edge must have an unique id.";
  }

  if (!edge.name) {
    throw "Each edge must have a name.";
  }

  if (!edge.targetVertexId) {
    return "Each edge must have a sourceVertexId and a targetVertexId.";
  }
}
