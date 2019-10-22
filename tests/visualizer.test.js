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
        expect(await page.$eval(".mv-viewmode .mv-tooltip", (t => t.style.display))).toBe("none")
        await v0.hover()
        await page.waitForSelector(".mv-viewmode .mv-tooltip", { visible: true })
        expect(await page.$eval(".mv-viewmode .mv-tooltip", (t => t.style.display))).toBe("block")
    })

    test('visualizer graph transform is set', async () => {
        const visualizerSvg = await page.$(svgSelector);
        const graphTransform = await visualizerSvg.$eval("g#graph", g => g.getAttribute("transform"))
        expect(graphTransform).toBeTruthy();
        expect(graphTransform).toContain("scale(1)")
    })

    test('visualizer graph pan', async () => {
        const visualizerSvg = await page.$(svgSelector);
        const graphTransformBefore = await visualizerSvg.$eval("g#graph", g => g.getAttribute("transform"))

        await page.mouse.move(100, 100);
        await page.mouse.down();
        await page.mouse.move(120, 120);
        await page.mouse.up();

        const graphTransformAfter = await visualizerSvg.$eval("g#graph", g => g.getAttribute("transform"))
        expect(graphTransformBefore).toBeTruthy()
        expect(graphTransformAfter).toBeTruthy()
        expect(graphTransformBefore == graphTransformAfter).toBeFalsy()
    })

    test('set graphLayoutOptions', async () => {
        const visualizerSvg = await page.$(svgSelector);
        let tBefore = await visualizerSvg.$eval("#v0", n => n.getAttribute("transform"))
        await page.evaluate(() => visualizer.setGraphLayoutOptions({ marginx: 100 }))
        let tAfter = await visualizerSvg.$eval("#v0", n => n.getAttribute("transform"))
        expect(tBefore).not.toEqual(tAfter)
    })
})
