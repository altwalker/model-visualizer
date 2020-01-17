export var defaultModels = { name: "Default model", models: [{ name: "FirstModel", generator: "random(edge_coverage(100) && vertex_coverage(100))", startElementId: "v0", vertices: [{ id: "v0", name: "vertex_zero" }, { id: "v1", name: "vertex_one" }, { id: "v2", name: "vertex_two" }], edges: [{ id: "e0", name: "edge_A", sourceVertexId: "v0", targetVertexId: "v1" }] }, { name: "SecondModel", generator: "random(edge_coverage(100) && vertex_coverage(100))", vertices: [{ id: "v3", name: "vertex_three" }, { id: "v4", name: "vertex_four" }, { id: "v5", name: "vertex_five" }], edges: [{ id: "e1", name: "edge_B", sourceVertexId: "v3", targetVertexId: "v4" }, { id: "e2", name: "edge_C", sourceVertexId: "v4", targetVertexId: "v5" }, { id: "e3", name: "edge_D", sourceVertexId: "v5", targetVertexId: "v3" }] }] };

const RESERVED_WORDS = ['as', 'for', 'and', 'yield', 'global', 'break', 'return', 'else', 'class', 'except', 'from', 'while', 'none',
    'not', 'await', 'true', 'elif', 'pass', 'or', 'def', 'del', 'import', 'false', 'continue', 'assert', 'is',
    'lambda', 'nonlocal', 'async', 'finally', 'if', 'in', 'try', 'with', 'raise', "abstract", "add", "alias", "as",
    "ascending", "async", "await", "base", "bool", "break", "by", "byte", "case", "catch", "char", "checked", "class",
    "const", "continue", "decimal", "default", "delegate", "descending", "do", "double", "dynamic", "else", "enum",
    "equals", "event", "explicit", "extrem", "false", "finally", "fixed", "float", "for", "foreach", "from", "get",
    "global", "goto", "group", "if", "implicit", "in", "int", "interface", "internal", "into", "is", "join", "let",
    "lock", "long", "nameof", "namespace", "new", "null", "object", "on", "operator", "orderby", "out", "override",
    "params", "partial", "private", "protected", "public", "readonly", "ref", "remove", "return", "sbyte", "sealed",
    "select", "set", "short", "static", "struct", "switch", "this", "throw", "true", "try", "typeof", "uint", "ulong",
    "unchecked", "value", "var", "virtual", "void", "volatile", "when", "where", "while", "yield"
]

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export class PlottingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PlottingError';
    }
}



export function validateModels(json) {
    let models = json["models"];

    if (!models) {
        throw new ValidationError("Models should not be empty.");
    }

    var verticesIds = {};
    var edgesIds = {};

    var hasStartElement = false;
    var modelNames = []

    models.forEach(model => {
        validataModel(model);
        modelNames.push(model.name)
        var modelVerticesIds = {};

        model.vertices.forEach(vertex => {
            validateVertex(vertex);

            if (verticesIds[vertex.id]) {
                throw new PlottingError(`Vertex id ${
          vertex.id
          } appears at least 2 times in all models. Vertex id should be unique across all models.`);
            }

            if (edgesIds[vertex.id]) {
                throw new PlottingError(`Duplicate id ${vertex.id}. Edges and vertices should have unique ids.`)
            }

            verticesIds[vertex.id] = true;
            modelVerticesIds[vertex.id] = true;
        });

        model.edges.forEach(edge => {
            validateEdge(edge);

            if (edgesIds[edge.id]) {
                throw new PlottingError(`Edge id ${
          edge.id
          } appears at least 2 times. Edge ids should be unique across all models.`);
            }

            if (verticesIds[edge.id]) {
                throw new PlottingError(`Duplicate id ${edge.id}. Edges and vertices should have unique ids.`);
            }

            if (edge.sourceVertexId && !modelVerticesIds[edge.sourceVertexId]) {
                throw new ValidationError(`Vertex id ${
          edge.sourceVertexId
          } defined as sourceVertexId of edge id ${
          edge.id
          } does not exist in vertices definition of model ${model.name}.`);
            }

            if (!modelVerticesIds[edge.targetVertexId]) {
                throw new ValidationError(`Vertex id ${
          edge.targetVertexId
          } defined as targetVertexId of edge id ${
          edge.id
          } does not exist in vertices definition of model ${model.name}.`);
            }

            edgesIds[edge.id] = true;
        });

        if (
            model.startElementId &&
            !(verticesIds[model.startElementId] || edgesIds[model.startElementId])
        ) {
            throw new ValidationError(`startElementId ${model.startElementId} is not a valid element.`);
        }

        if (model.startElementId) {
            hasStartElement = true;
        }
    });

    validateModelNames(modelNames);

    if (!hasStartElement) {
        throw new ValidationError("At least one model must have an startElementId.");
    }
}

function validataModel(model) {
    if (!model.name) {
        throw new ValidationError("Each model must have a unique name.");
    }
    if (!isNameValid(model.name))
        throw new ValidationError(`Invalid model name: ${model.name}.`);

    if (!model.generator) {
        throw new ValidationError("Each model must have a generator.");
    }

    if (!model.vertices) {
        throw new ValidationError("Each model must have a list of vertices.");
    }

    if (!model.edges) {
        throw new ValidationError("Each model must have a list of edges.");
    }
}

function validateVertex(vertex) {


    if (!vertex.id) {
        throw new PlottingError("Each vertex must have a unique id.");
    }

    if (!vertex.name) {
        throw new ValidationError("Each vertex must have a name.");
    }

    if (!isNameValid(vertex.name))
        throw new ValidationError(`Invalid vertex name: ${vertex.name}.`);
}

function validateEdge(edge) {
    if (!edge.id) {
        throw new PlottingError("Each edge must have a unique id.");
    }

    if (!edge.name) {
        throw new ValidationError("Each edge must have a name.");
    }

    if (!isNameValid(edge.name))
        throw new ValidationError(`Invalid edge name: ${edge.name}.`);

    if (!edge.targetVertexId) {
        throw new ValidationError("Each edge must have a targetVertexId.");
    }
    if (edge.weight && !isWeightValid(edge.weight)) {
        throw new ValidationError("Weight should be between 0 and 1.")
    }
}

function validateModelNames(modelNames) {
    if ((new Set(modelNames)).size !== modelNames.length) { throw new ValidationError("Each model must have a unique name."); }
}

export function isNameValid(name) {
    const isIdentifier = /^[_a-zA-Z]\w*$/
    if (!isIdentifier.test(name))
        return false;

    if (RESERVED_WORDS.includes(name))
        return false;

    return true;
}
export function isWeightValid(weight) {
    if (weight === 0)
        return true;
    if (!weight || weight < 0 || weight > 1)
        return false;
    return true;
}