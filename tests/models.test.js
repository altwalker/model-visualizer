import { defaultModels, validateModels, isNameValid, ValidationError, isWeightValid, PlottingError } from "../src/js/models"

describe("validateModels", () => {
    test('defaultModels are valid', () => {
        validateModels(defaultModels)
        expect(true).toBe(true);
    });

    test('Empty models', () => {
        expect(() => validateModels({ name: "Invalid models" })).toThrowError(new Error("Models should not be empty."))
    });

    test('Each model must have a name', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{}]
        })
        expect(f).toThrowError(new Error("Each model must have a unique name."))
        expect(f).toThrowError(ValidationError)
        f = () => validateModels({
            name: "TestModel",
            models: [{
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
        })
        expect(f).toThrowError(new Error("Each model must have a unique name."))
        expect(f).toThrowError(ValidationError)
    });
    test('Each model must have a generator', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                name: "model1",
            }]
        })
        expect(f).toThrowError(new Error("Each model must have a generator."))
        expect(f).toThrowError(ValidationError)
    });

    test('Reference vertex in different model', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
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
        })
        expect(f).toThrowError(new Error("Vertex id v1 defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model2."))
        expect(f).toThrowError(ValidationError)
    });


    test('Invalid vertex reference', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                name: "model1",
                generator: "random(never)",
                vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                edges: [{ id: "e1", "name": "e1", "sourceVertexId": "v1", targetVertexId: "v2" }]
            }]
        })
        expect(f).toThrowError(new Error("Vertex id v1 defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model1."))
        expect(f).toThrowError(ValidationError)
    });




    test('Same vertex id multiple times', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }, { id: "v2", name: "v2" }, { id: "v2", name: "v2" }],
                    startElementId: "v2",
                    edges: []
                },

            ]
        })
        expect(f).toThrowError(new Error("Vertex id v2 appears at least 2 times in all models. Vertex id should be unique across all models."))
        expect(f).toThrowError(PlottingError)
    });


    test('Same edge id multiple times', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
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
        })
        expect(f).toThrowError(new Error("Edge id e1 appears at least 2 times. Edge ids should be unique across all models."))
        expect(f).toThrowError(PlottingError)
    });


    test('Vertex and edge same id', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v1", name: "v1" }],
                    startElementId: "v1",
                    edges: [
                        { id: "v1", name: "e1", sourceVertexId: "v1", targetVertexId: "v1" },
                    ]
                },

            ]
        })
        expect(f).toThrowError(new Error("Duplicate id v1. Edges and vertices should have unique ids."))
        expect(f).toThrowError(PlottingError)
    });

    test('Invalid sourceVertexId', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: [
                        { id: "e1", name: "e1", sourceVertexId: "invalid", targetVertexId: "v3" }
                    ]
                },

            ]
        })
        expect(f).toThrowError(new Error("Vertex id invalid defined as sourceVertexId of edge id e1 does not exist in vertices definition of model model1."))
        expect(f).toThrowError(ValidationError)
    });

    test('Invalid targetVertexId', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: [
                        { id: "e1", name: "e1", sourceVertexId: "v2", targetVertexId: "invalid" }
                    ]
                },

            ]
        })
        expect(f).toThrowError(new Error("Vertex id invalid defined as targetVertexId of edge id e1 does not exist in vertices definition of model model1."))
        expect(f).toThrowError(ValidationError)
    });
    test('Each edge and vertex must have a unique id', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "", name: "v3" }],
                    startElementId: "v2",
                    edges: []
                },

            ]
        })
        expect(f).toThrowError(new Error("Each vertex must have a unique id."))
        expect(f).toThrowError(PlottingError)
        f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: [{ id: "", sourceVertexId: "v2", targetVertexId: "v3" }]
                },

            ]
        })
        expect(f).toThrowError(new ValidationError("Each edge must have a unique id."))
        expect(f).toThrowError(PlottingError)
    });

    test('Each vertex must have a valid name', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: []
                },

            ]
        })
        expect(f).toThrowError(new Error("Each vertex must have a name."))
        expect(f).toThrowError(ValidationError)
        f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "#invalid" }],
                    startElementId: "v2",
                    edges: []
                },

            ]
        })
        expect(f).toThrowError(new ValidationError("Invalid vertex name: #invalid."))
        expect(f).toThrowError(ValidationError)
    });

    test('Each edge must have a name', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: [{ id: "e1", name: "", targetVertexId: "v2" }]
                },

            ]
        })
        expect(f).toThrowError(new Error("Each edge must have a name."))
        expect(f).toThrowError(ValidationError)
    });

    test('Each edge must have a targetVertexId', () => {
        let f = () => validateModels({
            name: "TestModel",
            models: [{
                    name: "model1",
                    generator: "random(never)",
                    vertices: [{ id: "v2", name: "v2" }, { id: "v3", name: "v3" }],
                    startElementId: "v2",
                    edges: [{ id: "e1", name: "e1" }]
                },

            ]
        })
        expect(f).toThrowError(new Error("Each edge must have a targetVertexId."))
        expect(f).toThrowError(ValidationError)
    });
});

describe("isNamevalid", () => {
    test('valid identifier', () => {
        expect(isNameValid("valididentifier")).toBe(true)
        expect(isNameValid("validIdentifier")).toBe(true)
        expect(isNameValid("validIdentifier123")).toBe(true)
        expect(isNameValid("validIdentifier123___")).toBe(true)
        expect(isNameValid("_validIdentifier123_")).toBe(true)
    })
    test('invalid identifier', () => {
        expect(isNameValid("1invalidIdentifier")).toBe(false)
        expect(isNameValid("invalid identifier")).toBe(false)
        expect(isNameValid("#invalididentifier")).toBe(false)
        expect(isNameValid("invalididentifier#")).toBe(false)
    })
    test('keyword identifier', () => {
        expect(isNameValid("new")).toBe(false)
        expect(isNameValid("struct")).toBe(false)
        expect(isNameValid("lambda")).toBe(false)
    })
})


describe("isWeightValid", () => {
    test('valid weight', () => {
        expect(isWeightValid(0)).toBe(true)
        expect(isWeightValid(1)).toBe(true)
        expect(isWeightValid(0.33)).toBe(true)
    })
    test('invalid weight', () => {
        expect(isWeightValid("")).toBe(false)
        expect(isWeightValid(1.1)).toBe(false)
        expect(isWeightValid(NaN)).toBe(false)
        expect(isWeightValid(undefined)).toBe(false)
    })
})