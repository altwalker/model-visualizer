import { defaultModels, validateModels } from "../src/js/models"


test('defaultModels are valid', () => {
    validateModels(defaultModels)
    expect(true).toBe(true);
});

test('Empty models', () => {
    expect(() => validateModels({ name: "Invalid models" })).toThrowError(new Error("Models should not be empty."))
});



test('Each model must have a name', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
            }
        ]
    })).toThrowError(new Error("Each model must have an unique name."))
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "name1",
                generator: "random(never)",
                startElementId: "v1",
                vertices: [{ id: "v1", name: "v1" }],
                edges: [],

            },
            {
                name: "name1",
                generator: "random(never)",
                vertices: [],
                edges: []
            }
        ]
    })).toThrowError(new Error("Each model must have an unique name."))
});
test('Each model must have a generator', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
            }
        ]
    })).toThrowError(new Error("Each model must have a generator."))
});

test('Reference vertex in different model', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v1", name: "v1" }],
                edges: []
            },
            {
                name: "model2",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                edges: [{ id: "e1", "name": "e1", "sourceVertexId": "v1", targetVertexId: "v2" }]
            }
        ]
    })).toThrowError(new Error("Vertex id v1 defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model2."))
});



test('Invalid vertex reference', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                edges: [{ id: "e1", "name": "e1", "sourceVertexId": "v1", targetVertexId: "v2" }]
            }
        ]
    })).toThrowError(new Error("Vertex id v1 defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model1."))
});




test('Same vertex id multiple times', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }, { id: "v2", name: "v2" }, { id: "v2", name: "v2" }],
                startElementId: "v2",
                edges: []
            },

        ]
    })).toThrowError(new Error("Vertex id v2 appears at least 2 times all models. Vertex ids should be unique across all models."))
});


test('Same edge id multiple times', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: [
                    { id: "e1", name: "e1", sourceVertexId: "v2", targetVertexId: "v3" },
                    { id: "e1", name: "e1", sourceVertexId: "v2", targetVertexId: "v3" }
                ]
            },

        ]
    })).toThrowError(new Error("Edge id e1 appears at least 2 times. Edge ids should be unique across all models."))
});


test('Vertex and  edge same id', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v1", name: "v1" }],
                startElementId: "v1",
                edges: [
                    { id: "v1", name: "e1", sourceVertexId: "v1", targetVertexId: "v1" },
                ]
            },

        ]
    })).toThrowError(new Error("Duplicate id v1. Edge and vertex should not have the same id."))
});

test('Invalid sourceVertexId', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: [
                    { id: "e1", name: "e1", sourceVertexId: "invalid", targetVertexId: "v3" }
                ]
            },

        ]
    })).toThrowError(new Error("Vertex id invalid defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model1."))
});

test('Invalid targetVertexId', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: [
                    { id: "e1", name: "e1", sourceVertexId: "v2", targetVertexId: "invalid" }
                ]
            },

        ]
    })).toThrowError(new Error("Vertex id invalid defined as targetVertexId of edge id e1 does not exist in vertices definition of model model1."))
});


test('Each vertex must have a name', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: []
            },

        ]
    })).toThrowError(new Error("Each vertex must have a name."))
});

test('Each edge must have a name', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: [{ id: "e1", name: "", targetVertexId: "v2" }]
            },

        ]
    })).toThrowError(new Error("Each edge must have a name."))
});

test('Each edge must have a targetVertexId', () => {
    expect(() => validateModels({
        name: "TestModel", models: [
            {
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                startElementId: "v2",
                edges: [{ id: "e1", name: "e1" }]
            },

        ]
    })).toThrowError(new Error("Each edge must have a targetVertexId."))
});
