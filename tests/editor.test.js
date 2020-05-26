/* global PATH, visualizer, jest, page, expect, describe, beforeEach, test */

const models = {
  name: 'Test Models',
  models: [
    {
      name: 'FirstModel',
      generator: 'random(edge_coverage(100) && vertex_coverage(100))',
      startElementId: 'v0',
      vertices: [
        {
          id: 'v0',
          name: 'vertex_zero'
        },
        {
          id: 'v1',
          name: 'vertex_one'
        },
        {
          id: 'v2',
          name: 'vertex_two'
        }
      ],
      edges: [
        {
          id: 'e0',
          name: 'edge_A',
          sourceVertexId: 'v0',
          targetVertexId: 'v1'
        }
      ]
    },
    {
      name: 'SecondModel',
      generator: 'random(edge_coverage(100) && vertex_coverage(100))',
      vertices: [
        {
          id: 'v3',
          name: 'vertex_three'
        },
        {
          id: 'v4',
          name: 'vertex_four'
        },
        {
          id: 'v5',
          name: 'vertex_five'
        }
      ],
      edges: [
        {
          id: 'e1',
          name: 'edge_B',
          sourceVertexId: 'v3',
          targetVertexId: 'v4'
        },
        {
          id: 'e2',
          name: 'edge_C',
          sourceVertexId: 'v4',
          targetVertexId: 'v5'
        },
        {
          id: 'e3',
          name: 'edge_D',
          sourceVertexId: 'v5',
          targetVertexId: 'v3'
        }
      ]
    }
  ]
}

async function vueNextTick() {
  await page.evaluate(async () => {
    await visualizer.vm.$nextTick()
  })
}

describe('visualizer in edit mode', () => {
  const visualizerSelector = '.mv-editmode svg.mv-visualizer'
  const editorSelector = '.mv-editmode .mv-editor'

  beforeEach(async () => {
    jest.setTimeout(30000)

    await page.goto(PATH, { waitUntil: 'load' })
    await page.waitForFunction(() => visualizer !== null)
    await page.waitForSelector(visualizerSelector, { visible: true })

    await page.evaluate((models) => visualizer.setModels(models), models)
    await vueNextTick()
  })

  test('should render the visualizer', async () => {
    const visualizerContainer = await page.$(visualizerSelector)
    expect(visualizerContainer).toBeTruthy()
  })

  test('should render the nodes', async () => {
    const visualizerContainer = await page.$(visualizerSelector)
    let nodes = await visualizerContainer.$$('#graph .nodes .node')
    expect(nodes).toBeTruthy()

    nodes = await visualizerContainer.$$eval('#graph .nodes .node', nodes => nodes.map(n => n.textContent))
    expect(nodes).toEqual(['vertex_zero', 'vertex_one', 'vertex_two'])
  })

  test('should render the editor', async () => {
    const editorContainer = await page.$(editorSelector)
    expect(editorContainer).toBeTruthy()
  })

  test('should update the graphLayoutOptions', async () => {
    const visualizerContainer = await page.$(visualizerSelector)
    const transformBefore = await visualizerContainer.$eval('#v0', n => n.getAttribute('transform'))

    await page.evaluate(() => visualizer.setGraphLayoutOptions({ marginx: 100 }))
    await vueNextTick()

    const transformAfter = await visualizerContainer.$eval('#v0', n => n.getAttribute('transform'))
    expect(transformBefore).not.toEqual(transformAfter)
  })

  describe('model editor', () => {
    test('should select a model', async () => {
      const visualizerContainer = await page.$(visualizerSelector)
      await page.select('select#currentModel', '1')

      const nodes = await visualizerContainer.$$eval('#graph .nodes .node', nodes => nodes.map(n => n.textContent))
      expect(nodes).toEqual(['vertex_three', 'vertex_four', 'vertex_five'])
    })

    test('should add a new model', async () => {
      const editorContainer = await page.$(editorSelector)
      const newModel = await editorContainer.$('button.mv-button-new-model')
      await newModel.click()

      const modelSelect = await editorContainer.$('#currentModel')
      const options = await modelSelect.$$eval('option', options => options.map(option => option.textContent))
      expect(options).toEqual(['FirstModel', 'SecondModel', 'NewModel0'])
    })

    test('should always create models with valid names', async () => {
      const editorContainer = await page.$(editorSelector)
      const newModel = await editorContainer.$('button.mv-button-new-model')
      await newModel.click()

      const modelSelect = await editorContainer.$('#currentModel')
      let options = await modelSelect.$$eval('option', options => options.map(option => option.textContent))
      expect(options).toEqual(['FirstModel', 'SecondModel', 'NewModel0'])

      await newModel.click()

      options = await modelSelect.$$eval('option', options => options.map(option => option.textContent))
      expect(options).toEqual(['FirstModel', 'SecondModel', 'NewModel0', 'NewModel1'])
    })

    test('should add model with an start element', async () => {
      const editorContainer = await page.$(editorSelector)
      const newModel = await editorContainer.$('button.mv-button-new-model')
      await newModel.click()

      const models = await page.evaluate('visualizer.getModels()')
      const model = models.models[models.models.length - 1]
      expect(model.startElementId).toEqual(model.vertices[0].id)
    })

    test('should delete a model', async () => {
      const editorContainer = await page.$(editorSelector)
      const deleteModel = await editorContainer.$('button.mv-button-delete-model')
      await deleteModel.click()

      const popUpContainer = await page.$('.mv-editmode .mv-overlay .mv-pop-up')
      expect(popUpContainer).toBeTruthy()

      const popUpDeleteModel = await popUpContainer.$('button.mv-button-delete-model')
      await popUpDeleteModel.click()

      const modelSelect = await editorContainer.$('#currentModel')
      const options = await modelSelect.$$eval('option', options => options.map(option => option.textContent))
      expect(options).toEqual(['SecondModel'])
    })

    test('should rename a model', async () => {
      const editorContainer = await page.$(editorSelector)
      const modelnameInput = await editorContainer.$('input#name')
      await modelnameInput.type('Modified')

      const models = await page.evaluate(() => { return visualizer.getModels() })
      expect(models).toBeTruthy()
      expect(models.name).toBe('Test Models')
      expect(models.models.map(m => m.name)).toContain('FirstModelModified')
    })

    test('should not add empty model action', async () => {
      const editor = await page.$(editorSelector)
      const addAction = await editor.$('button.mv-button-add-action')
      await addAction.click()

      const models = await page.evaluate('visualizer.getModels()')
      // adding an action should not append an empty action to the model
      expect(models.models[0].actions).toBeFalsy()
    })

    test('should add model action', async () => {
      const action = 'a = b'
      const editor = await page.$(editorSelector)

      const actionInput = await editor.$('.mv-new-action input')
      await actionInput.type(action)

      const addAction = await editor.$('button.mv-button-add-action')
      await addAction.click()

      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].actions).toBeTruthy()
      expect(models.models[0].actions[0]).toBe(action)
    })

    test('model name should be required', async () => {
      const editor = await page.$(editorSelector)

      const modelnameInput = await editor.$('input#name')
      await modelnameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')

      const errorValue = await page.$eval(`${editorSelector} span.error`, element => element.textContent)
      expect(errorValue).toBe('* name is required')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), modelnameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('model name should be a valid identifier', async () => {
      const editor = await page.$(editorSelector)
      const modelnameInput = await editor.$('input#name')
      await modelnameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await modelnameInput.type('#invalidIdentifier')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* name should be a valid identifier')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), modelnameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('model name should not be a reserved keyword', async () => {
      const editor = await page.$(editorSelector)
      const modelnameInput = await editor.$('input#name')
      await modelnameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await modelnameInput.type('return')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* name should not be a reserved keyword')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), modelnameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('generator should be required', async () => {
      const editor = await page.$(editorSelector)

      const generatorInput = await editor.$('input#generator')
      await generatorInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* generator is required')

      const hasErrorClass = await page.evaluate(generator => generator.classList.contains('error'), generatorInput)
      expect(hasErrorClass).toBeTruthy()
    })
  })

  describe('vertex editor', () => {
    test('selecting a vertex should display the vertex editor', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const v0 = await visualizerSvg.$('#v0')

      let hasEditClass = await page.evaluate(node => node.classList.contains('edit'), v0)
      expect(hasEditClass).toBe(false)

      await v0.click()
      hasEditClass = await page.evaluate(node => node.classList.contains('edit'), v0)
      expect(hasEditClass).toBe(true)

      // vertex editor should be displayed
      const editor = await page.$(editorSelector)
      expect(await editor.$('.mv-edit-vertex')).toBeTruthy()
    })

    test('should edit the vertex name', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const nameInput = await vertexEdit.$('#name')

      await nameInput.type('_name_changed')
      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].vertices[0].name).toBe('vertex_zero_name_changed')
    })

    test('vertex name should be required', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const nameInput = await vertexEdit.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* name is required')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('vertex name should be a valid identifier', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const nameInput = await vertexEdit.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await nameInput.type('#invalidIdentifier')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* name should be a valid identifier')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('vertex name should not be a reserved keyword', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const nameInput = await vertexEdit.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await nameInput.type('return')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* name should not be a reserved keyword')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('should add a sharedState', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const sharedStateInput = await vertexEdit.$('#sharedState')

      await sharedStateInput.type('mysharedstate')
      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].vertices[0].sharedState).toBe('mysharedstate')
    })

    test('should mark a vertex as blocked', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const editor = await page.$(editorSelector)
      const v0 = await visualizerSvg.$('#v0')
      await v0.click()
      const vertexEdit = await editor.$('.mv-edit-vertex')
      const blockedCheckbox = await vertexEdit.$('#blocked')

      await blockedCheckbox.click()
      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].vertices[0].properties.blocked).toBe(true)
    })

    test('should create a new vertex', async () => {
      await page.mouse.move(100, 100)
      const graph = await page.$('.mv-visualizer g#graph')
      await graph.click({ clickCount: 2 })

      const editor = await page.$(editorSelector)
      expect(await editor.$('.mv-edit-vertex')).toBeTruthy()
    })
  })

  describe('edge editor', () => {
    const selectEdge = async function () {
      const visualizerSvg = await page.$(visualizerSelector)
      const e0Label = await visualizerSvg.$('#label_e0')
      await e0Label.click()

      // editor is displayed
      const editor = await page.$(editorSelector)
      const edgeEditor = await editor.$('.mv-edit-edge')
      expect(edgeEditor).toBeTruthy()
      return edgeEditor
    }

    test('selecting a edge should display the edge editor', async () => {
      const visualizerSvg = await page.$(visualizerSelector)
      const e0Label = await visualizerSvg.$('#label_e0')

      let hasEditClass = await page.evaluate(el => el.classList.contains('edit'), e0Label)
      expect(hasEditClass).toBe(false)

      await e0Label.click()
      hasEditClass = await page.evaluate(el => el.classList.contains('edit'), e0Label)
      expect(hasEditClass).toBe(true)

      // edge editor should be displayed
      const editor = await page.$(editorSelector)
      expect(await editor.$('.mv-edit-edge')).toBeTruthy()
    })

    test('should not add empty edge action', async () => {
      const edgeEditor = await selectEdge()

      const addAction = await edgeEditor.$('button.mv-button-add-action')
      await addAction.click()

      const models = await page.evaluate('visualizer.getModels()')
      // adding an action should not append an empty action to the edge
      expect(models.models[0].edges[0].actions).toBeFalsy()
    })

    test('should add edge action', async () => {
      const edgeEditor = await selectEdge()

      const actionInput = await edgeEditor.$('.mv-new-action input')
      await actionInput.type('a=b')

      const addAction = await edgeEditor.$('button.mv-button-add-action')
      await addAction.click()

      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].actions).toBeTruthy()
      expect(models.models[0].edges[0].actions[0]).toBe('a=b')
    })

    test('should add a guard', async () => {
      const guard = 'e == 0'
      const edgeEditor = await selectEdge()

      const guardInput = await edgeEditor.$('#guard')
      await guardInput.type(guard)

      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].guard).toBe(guard)
    })

    test('edge name should not be required', async () => {
      const edgeEditor = await selectEdge()

      const nameInput = await edgeEditor.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')

      await expect(page).not.toMatchElement(`${editorSelector} span.error`)

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeFalsy()
    })

    test('edge name should be a valid indentifier', async () => {
      const edgeEditor = await selectEdge()

      const nameInput = await edgeEditor.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await nameInput.type('#invalidIdentifier')

      const errorValue = await page.$eval(`${editorSelector} span.error`, element => element.textContent)
      expect(errorValue).toBe('* name should be a valid identifier')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('edge name should not be a reserved keyword', async () => {
      const edgeEditor = await selectEdge()

      const nameInput = await edgeEditor.$('#name')
      await nameInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await nameInput.type('return')

      const errorValue = await page.$eval(`${editorSelector} span.error`, element => element.textContent)
      expect(errorValue).toBe('* name should not be a reserved keyword')

      const hasErrorClass = await page.evaluate(modelName => modelName.classList.contains('error'), nameInput)
      expect(hasErrorClass).toBeTruthy()
    })

    test('should add weight', async () => {
      const edgeEditor = await selectEdge()
      const weightInput = await edgeEditor.$('#weight')
      await weightInput.type('0.5')

      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].weight).toBe(0.5)
    })

    test('weight should be between 0 and 1', async () => {
      const edgeEditor = await selectEdge()
      const weightInput = await edgeEditor.$('#weight')
      await weightInput.type('-1')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* weight should be between 0 and 1')
      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].weight).toBe(undefined)
    })

    test('should add dependency', async () => {
      const edgeEditor = await selectEdge()
      const weightInput = await edgeEditor.$('#dependency')
      await weightInput.type('75')

      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].dependency).toBe(75)
    })

    test('dependency should be a positive number', async () => {
      const edgeEditor = await selectEdge()
      const weightInput = await edgeEditor.$('#dependency')
      await weightInput.type('-1')

      const errorValue = await page.$eval(editorSelector + ' span.error', el => el.textContent)
      expect(errorValue).toBe('* dependency cannot be negative')
      const models = await page.evaluate('visualizer.getModels()')
      expect(models.models[0].edges[0].dependency).toBe(undefined)
    })
  })
})
