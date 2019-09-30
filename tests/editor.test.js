describe('visualizer in editmode', () => {
    let svgSelector = ".mv-editmode svg.mv-visualizer"
    let editorSelector = ".mv-editmode .mv-editor"
    beforeEach(async () => {
        await page.goto(PATH, { waitUntil: 'load' })
    })
    test('visualizer rendered', async () => {
        const visualizerSvg = await page.$(svgSelector);
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

    test("select model", async () => {
        const visualizerSvg = await page.$(svgSelector);
        const editor = await page.$(editorSelector);
        const modelSelect = await editor.$("#currentModel")
        await modelSelect.select("1")
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
        expect(await editor.$(".editvertex")).toBeTruthy()
    })

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
        expect(await editor.$(".editedge")).toBeTruthy()
    })
})
