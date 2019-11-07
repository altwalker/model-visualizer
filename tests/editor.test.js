async function vueNextTick() {
    await page.evaluate(async () => {
        await visualizer.vm.$nextTick()
    })
}
describe('visualizer in editmode', () => {
    let svgSelector = ".mv-editmode svg.mv-visualizer"
    let editorSelector = ".mv-editmode .mv-editor"
    beforeEach(async () => {
        jest.setTimeout(30000)
        await page.goto(PATH, { waitUntil: 'load' })
        await page.waitForFunction(() => visualizer !== null)
        await page.waitForSelector(svgSelector, { visible: true })
    })
    test('visualizer rendered', async () => {
        const visualizerSvg = await page.$(svgSelector);
        // await page.screenshot({ path: 'screenshots/visualizer-rendered.png' });
        expect(visualizerSvg).toBeTruthy()
    })
    test('nodes rendererd', async () => {
        const visualizerSvg = await page.$(svgSelector);
        let nodes = await visualizerSvg.$$("#graph .nodes .node")
        expect(nodes).toBeTruthy()

        nodes = await visualizerSvg.$$eval("#graph .nodes .node", nodes => nodes.map(n => n.textContent))
        expect(nodes).toEqual(['vertex_zero', 'vertex_one', 'vertex_two'])
    })
    test('editor rendered', async () => {
        const editor = await page.$(editorSelector);
        expect(editor).toBeTruthy()
    })

    test('set graphLayoutOptions', async () => {
        const visualizerSvg = await page.$(svgSelector);
        let tBefore = await visualizerSvg.$eval("#v0", n => n.getAttribute("transform"))
        await page.evaluate(() => visualizer.setGraphLayoutOptions({ marginx: 100 }))
        await vueNextTick()
        let tAfter = await visualizerSvg.$eval("#v0", n => n.getAttribute("transform"))
        expect(tBefore).not.toEqual(tAfter)
    })

    describe("model editor", () => {
        test("select model", async () => {
            const visualizerSvg = await page.$(svgSelector);
            await page.select("select#currentModel", "1")
            const nodes = await visualizerSvg.$$eval("#graph .nodes .node", nodes => nodes.map(n => n.textContent))
            expect(nodes).toEqual(['vertex_three', 'vertex_four', 'vertex_five'])
        })

        test("new model", async () => {
            const editor = await page.$(editorSelector);
            const newModel = await editor.$("button#mv-btn-new-model")
            await newModel.click()
            const modelSelect = await editor.$("#currentModel")
            const options = await modelSelect.$$eval("option", options => options.map(option => option.textContent))
            expect(options).toEqual(['FirstModel', 'SecondModel', 'NewModel0'])
        })
        test("delete model", async () => {
            const editor = await page.$(editorSelector);
            const deleteModel = await editor.$("button#mv-btn-delete-model")
            await deleteModel.click()
            const modelSelect = await editor.$("#currentModel")
            const options = await modelSelect.$$eval("option", options => options.map(option => option.textContent))
            expect(options).toEqual(['SecondModel'])
        })

        test("rename model", async () => {
            const editor = await page.$(editorSelector);
            const modelnameInput = await editor.$("input#name")
            await modelnameInput.type("Modified")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models).toBeTruthy()
            expect(models["name"]).toBe("Default model")
            expect(models["models"].map(m => m.name)).toContain("FirstModelModified")
        })

        test("add model action", async () => {
            const editor = await page.$(editorSelector);
            const addAction = await editor.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            // adding an action should not append an empty action to the model
            expect(models.models[0].actions).toBeFalsy()

        })
        test("edit model action", async () => {
            const editor = await page.$(editorSelector);

            const actionInput = await editor.$(".mv-new-action input")
            await actionInput.type("a=b")

            const addAction = await editor.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].actions).toBeTruthy()
            expect(models.models[0].actions[0]).toBe("a=b")
        })
        test("name validator", async () => {
            const editor = await page.$(editorSelector);

            const modelnameInput = await editor.$("input#name")
            await modelnameInput.click({ clickCount: 3 })
            await page.keyboard.press('Backspace');

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name is required")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), modelnameInput)
            expect(hasErrorClass).toBeTruthy()
        })
        test("name validator invalid name", async () => {
            const editor = await page.$(editorSelector);
            const modelnameInput = await editor.$("input#name")
            await modelnameInput.type("#")

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name should be a valid identifier")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), modelnameInput)
            expect(hasErrorClass).toBeTruthy()
        })
        test("generator validator", async () => {
            const editor = await page.$(editorSelector);

            const generatorInput = await editor.$("input#generator")
            await generatorInput.click({ clickCount: 3 })
            await page.keyboard.press('Backspace');

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* generator is required")

            let hasErrorClass = await page.evaluate(generator => generator.classList.contains("error"), generatorInput)
            expect(hasErrorClass).toBeTruthy()
        })
    })

    describe("vertex editor", () => {
        test("select node", async () => {
            const visualizerSvg = await page.$(svgSelector);
            let v0 = await visualizerSvg.$("#v0")

            let hasEditClass = await page.evaluate(node => node.classList.contains("edit"), v0)
            expect(hasEditClass).toBe(false)

            await v0.click()
            hasEditClass = await page.evaluate(node => node.classList.contains("edit"), v0)
            expect(hasEditClass).toBe(true)

            // editor is displayed
            const editor = await page.$(editorSelector);
            expect(await editor.$(".mv-edit-vertex")).toBeTruthy()
        })

        test("vertex name", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-edit-vertex");
            const nameInput = await vertexEdit.$("#name")

            await nameInput.type("_name_changed")
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].vertices[0].name).toBe("vertex_zero_name_changed")

        })
        test("vertex sharedState", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-edit-vertex");
            const sharedStateInput = await vertexEdit.$("#sharedState")

            await sharedStateInput.type("mysharedstate")
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].vertices[0].sharedState).toBe("mysharedstate")
        })
        test("vertex blocked", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-edit-vertex");
            const blockedCheckbox = await vertexEdit.$("#blocked")

            await blockedCheckbox.click()
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].vertices[0].properties.blocked).toBe(true)
        })


        test("name validator", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-edit-vertex");
            const nameInput = await vertexEdit.$("#name")
            await nameInput.click({ clickCount: 3 })
            await page.keyboard.press('Backspace');

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name is required")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), nameInput)
            expect(hasErrorClass).toBeTruthy()
        })
        test("name validator invalid name", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-edit-vertex");
            const nameInput = await vertexEdit.$("#name")
            await nameInput.type("#")

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name should be a valid identifier")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), nameInput)
            expect(hasErrorClass).toBeTruthy()
        })

        test("create vertex", async () => {
            await page.mouse.move(100, 100);
            const graph = await page.$('.mv-visualizer g#graph');
            await graph.click({ clickCount: 2 });

            const editor = await page.$(editorSelector);
            expect(await editor.$(".mv-edit-vertex")).toBeTruthy()
        })
    })
    describe("edge editor", () => {
        let selectEdge = async function () {
            const visualizerSvg = await page.$(svgSelector);
            let e0Label = await visualizerSvg.$("#label_e0")
            await e0Label.click()

            // editor is displayed
            const editor = await page.$(editorSelector);
            const edgeEditor = await editor.$(".mv-edit-edge")
            expect(edgeEditor).toBeTruthy()
            return edgeEditor;
        }

        test("select edge", async () => {
            const visualizerSvg = await page.$(svgSelector);
            let e0Label = await visualizerSvg.$("#label_e0")

            let hasEditClass = await page.evaluate(el => el.classList.contains("edit"), e0Label)
            expect(hasEditClass).toBe(false)

            await e0Label.click()
            hasEditClass = await page.evaluate(el => el.classList.contains("edit"), e0Label)
            expect(hasEditClass).toBe(true)

            // editor is displayed
            const editor = await page.$(editorSelector);
            expect(await editor.$(".mv-edit-edge")).toBeTruthy()
        })
        test("add edge empty action", async () => {
            const edgeEditor = await selectEdge()

            const addAction = await edgeEditor.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            // adding an action should not append an empty action to the edge
            expect(models.models[0].edges[0].actions).toBeFalsy()
        })

        test("edit edge action", async () => {
            const edgeEditor = await selectEdge()

            const actionInput = await edgeEditor.$(".mv-new-action input")
            await actionInput.type("a=b")

            const addAction = await edgeEditor.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].actions).toBeTruthy()
            expect(models.models[0].edges[0].actions[0]).toBe("a=b")
        })

        test("edge guard", async () => {
            const edgeEditor = await selectEdge()

            const guardInput = await edgeEditor.$("#guard")
            await guardInput.type("e==0;")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].guard).toBe("e==0;")
        })

        test("name validator", async () => {
            const edgeEditor = await selectEdge()
            const nameInput = await edgeEditor.$("#name")
            await nameInput.click({ clickCount: 3 })
            await page.keyboard.press('Backspace');

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name is required")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), nameInput)
            expect(hasErrorClass).toBeTruthy()
        })
        test("name validator invalid name", async () => {
            const edgeEditor = await selectEdge()

            const nameInput = await edgeEditor.$("#name")
            await nameInput.type("#")

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* name should be a valid identifier")

            let hasErrorClass = await page.evaluate(modelName => modelName.classList.contains("error"), nameInput)
            expect(hasErrorClass).toBeTruthy()
        })

        test("valid weight", async () => {
            const edgeEditor = await selectEdge()
            const weightInput = await edgeEditor.$("#weight")
            await weightInput.type("0.5")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].weight).toBe(0.5)
        })
        test("invalid weight", async () => {
            const edgeEditor = await selectEdge()
            const weightInput = await edgeEditor.$("#weight")
            await weightInput.type("-1")


            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* weight should be between 0 and 1")
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].weight).toBe(undefined)

        })
        test("valid dependency", async () => {
            const edgeEditor = await selectEdge()
            const weightInput = await edgeEditor.$("#dependency")
            await weightInput.type("75")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].dependency).toBe(75)

        })

        test("invalid dependency", async () => {
            const edgeEditor = await selectEdge()
            const weightInput = await edgeEditor.$("#dependency")
            await weightInput.type("-1")

            const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent);
            expect(errorValue).toBe("* dependency cannot be negative")
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].dependency).toBe(undefined)
        })
    })
})
