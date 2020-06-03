/* global PATH, jest, visualizer, page, expect, describe, beforeEach, test */

describe('legend', () => {
  const legendSelector = '#legend'

  beforeEach(async () => {
    jest.setTimeout(30000)

    await page.goto(PATH, { waitUntil: 'load' })
  })

  test('legend displayed in edit mode', async () => {
    const legendText = await page.$eval(legendSelector, l => l.innerText)
    expect(legendText).toContain('Graph Legend')
    expect(legendText).toContain('Start Vertex')
    expect(legendText).toContain('Blocked Vertex')
    expect(legendText).toContain('Fake Vertex')
  })

  test('legend displayed in view mode', async () => {
    await page.waitForFunction(() => visualizer !== null)
    await page.evaluate(() => visualizer.setEditMode(false))

    const legendText = await page.$eval(legendSelector, l => l.innerText)
    expect(legendText).toContain('Graph Legend')
    expect(legendText).toContain('Start Vertex')
    expect(legendText).toContain('Blocked Vertex')
    expect(legendText).toContain('Fake Vertex')
  })
})
