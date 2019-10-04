describe('legend', () => {
    let editorSelector = ".mv-editmode .mv-editor"
    let svgEditModeSelector = ".mv-editmode svg.mv-visualizer"
    let svgViewModeSelector = ".mv-viewmode svg.mv-visualizer"
    let legendSelector = "#legend"

    beforeEach(async () => {
        await page.goto(PATH, { waitUntil: 'load' })
    })

    test('legend displayed in edit mode', async () => {
        const legend = await page.$(legendSelector);
        const legendText = await legend.evaluate(l => l.innerText)
        expect(legendText).toContain("Graph Legend")
        expect(legendText).toContain("Start Vertex")
        expect(legendText).toContain("Blocked Vertex")
        expect(legendText).toContain("Fake Vertex")
    })

    test('legend displayed in view mode', async () => {
        await page.waitForFunction(() => visualizer !== null)
        await page.evaluate(() => visualizer.setEditMode(false))

        const legend = await page.$(legendSelector);
        const legendText = await legend.evaluate(l => l.innerText)
        expect(legendText).toContain("Graph Legend")
        expect(legendText).toContain("Start Vertex")
        expect(legendText).toContain("Blocked Vertex")
        expect(legendText).toContain("Fake Vertex")
    })

})