describe('visualizer in editmode', () => {
    let svgSelector = ".mv-editmode svg.mv-visualizer"
    let editorSelector = ".mv-editmode .mv-editor"
    beforeEach(async () => {
        await page.goto(PATH, { waitUntil: 'load' })
        await page.waitForFunction(() => visualizer !== null)
        await page.waitForSelector(svgSelector, { visible: true })
    })
    test('visualizer rendered', async () => {
        const visualizerSvg = await page.$(svgSelector);
        await page.screenshot({ path: 'screenshots/visualizer-rendered.png' });
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

    describe("model editor", () => {
        test("select model", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
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
            expect(options).toEqual(['First Model', 'Second Model', 'NewModel'])
        })
        test("delete model", async () => {
            const editor = await page.$(editorSelector);
            const deleteModel = await editor.$("button#mv-btn-delete-model")
            await deleteModel.click()
            const modelSelect = await editor.$("#currentModel")
            const options = await modelSelect.$$eval("option", options => options.map(option => option.textContent))
            expect(options).toEqual(['Second Model'])
        })

        test("rename model", async () => {
            const editor = await page.$(editorSelector);
            const modelnameInput = await editor.$("input#name")
            await modelnameInput.type(" Modified")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models).toBeTruthy()
            expect(models["name"]).toBe("Default model")
            expect(models["models"].map(m => m.name)).toContain("First Model Modified")
        })

        test("add model action", async () => {
            const editor = await page.$(editorSelector);
            const addAction = await editor.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].actions).toBeTruthy()
            expect(models.models[0].actions.length).toBe(1)
        })
        test("edit model action", async () => {
            const editor = await page.$(editorSelector);
            const addAction = await editor.$(".mv-add-action")
            await addAction.click()
            const actionInput = await editor.$(".mv-edit-action")
            await actionInput.type("a=b")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].actions).toBeTruthy()
            expect(models.models[0].actions[0]).toBe("a=b")
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
            expect(await editor.$(".mv-editvertex")).toBeTruthy()
        })

        test("vertex name", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let v0 = await visualizerSvg.$("#v0")
            await v0.click()
            const vertexEdit = await editor.$(".mv-editvertex");
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
            const vertexEdit = await editor.$(".mv-editvertex");
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
            const vertexEdit = await editor.$(".mv-editvertex");
            const blockedCheckbox = await vertexEdit.$("#blocked")

            await blockedCheckbox.click()
            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].vertices[0].properties.blocked).toBe(true)
        })
    })
    describe("edge editor", () => {
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
            expect(await editor.$(".mv-editedge")).toBeTruthy()
        })
        test("add edge action", async () => {
            const visualizerSvg = await page.$(svgSelector);
            let e0Label = await visualizerSvg.$("#label_e0")

            await e0Label.click()
            // editor is displayed
            const editor = await page.$(editorSelector);
            const edgeEdit = await editor.$(".mv-editedge");

            const addAction = await edgeEdit.$(".mv-add-action")
            await addAction.click()

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].actions).toBeTruthy()
            expect(models.models[0].edges[0].actions.length).toBe(1)

        })

        test("edit action", async () => {

            const visualizerSvg = await page.$(svgSelector);
            let e0Label = await visualizerSvg.$("#label_e0")

            await e0Label.click()
            // editor is displayed
            const editor = await page.$(editorSelector);
            const edgeEdit = await editor.$(".mv-editedge");

            const addAction = await edgeEdit.$(".mv-add-action")
            await addAction.click()
            const actionInput = await edgeEdit.$(".mv-edit-action")
            await actionInput.type("a=b")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].actions).toBeTruthy()
            expect(models.models[0].edges[0].actions[0]).toBe("a=b")
        })

        test("edge guard", async () => {
            const visualizerSvg = await page.$(svgSelector);
            const editor = await page.$(editorSelector);
            let e0Label = await visualizerSvg.$("#label_e0")
            await e0Label.click()

            const edgeEdit = await editor.$(".mv-editedge");
            const guardInput = await edgeEdit.$("#guard")
            await guardInput.type("e==0;")

            const models = await page.evaluate("visualizer.getModels()");
            expect(models.models[0].edges[0].guard).toBe("e==0;")
        })
    })
})
