describe('visualizer in viewmode', () => {
    let svgSelector = ".mv-viewmode svg.mv-visualizer"
    beforeEach(async () => {
        await page.goto(PATH, { waitUntil: 'load' })
        await page.waitForFunction(() => visualizer !== null)
        await page.evaluate(() => visualizer.setEditMode(false))
    })

    test('visualizer rendered', async () => {
        const visualizerSvg = await page.$(svgSelector);
        expect(visualizerSvg).toBeTruthy()
    })

    test('tooltip displayed on hover', async () => {
        const visualizerSvg = await page.$(svgSelector);
        let v0 = await visualizerSvg.$("#v0")
        let tooltip = await page.$(".mv-viewmode .mv-tooltip")
        expect(await tooltip.evaluate(t => t.style.display)).toBe("none")
        await v0.hover()
        expect(await tooltip.evaluate(t => t.style.display)).toBe("block")
    })
})
