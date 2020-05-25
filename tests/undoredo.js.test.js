/* global expect, describe, test */

import UndoRedo from '../src/js/undoredo'

describe('UndoRedo', () => {
  test('it should set the initial state', () => {
    var state = new UndoRedo('Initial State')

    expect(state.current()).toBe('Initial State')
  })

  test('it should return the currnt state', () => {
    var state = new UndoRedo('Initial State')
    expect(state.current()).toBe('Initial State')

    state.push('State 1')
    expect(state.current()).toBe('State 1')

    state.push('State 2')
    expect(state.current()).toBe('State 2')

    state.push('State 3')
    expect(state.current()).toBe('State 3')
  })

  test('it should undo the last change', () => {
    var state = new UndoRedo('Initial State')
    state.push('State 1')
    state.push('State 2')
    state.push('State 3')

    expect(state.current()).toBe('State 3')

    state.undo()
    expect(state.current()).toBe('State 2')

    state.undo()
    expect(state.current()).toBe('State 1')

    state.undo()
    expect(state.current()).toBe('Initial State')
  })

  test('it should not undo if there are no more change', () => {
    var state = new UndoRedo('Initial State')
    state.push('State 1')
    state.push('State 2')

    expect(state.current()).toBe('State 2')

    state.undo()
    expect(state.current()).toBe('State 1')

    state.undo()
    expect(state.current()).toBe('Initial State')

    state.undo()
    expect(state.current()).toBe('Initial State')
  })

  test('it should redo the changes', () => {
    var state = new UndoRedo('Initial State')
    state.push('State 1')
    state.push('State 2')
    state.push('State 3')

    expect(state.current()).toBe('State 3')

    state.undo()
    expect(state.current()).toBe('State 2')

    state.undo()
    expect(state.current()).toBe('State 1')

    state.undo()
    expect(state.current()).toBe('Initial State')

    state.redo()
    expect(state.current()).toBe('State 1')

    state.redo()
    expect(state.current()).toBe('State 2')

    state.redo()
    expect(state.current()).toBe('State 3')
  })

  test('it should not redo if there are no more change', () => {
    var state = new UndoRedo('Initial State')
    state.push('State 1')
    state.push('State 2')

    expect(state.current()).toBe('State 2')

    state.undo()
    expect(state.current()).toBe('State 1')

    state.undo()
    expect(state.current()).toBe('Initial State')

    state.redo()
    expect(state.current()).toBe('State 1')

    state.redo()
    expect(state.current()).toBe('State 2')

    state.redo()
    expect(state.current()).toBe('State 2')
  })

  test('it should not redo after push', () => {
    var state = new UndoRedo('Initial State')
    state.push('State 1a')

    expect(state.current()).toBe('State 1a')

    state.undo()
    expect(state.current()).toBe('Initial State')

    state.push('State 1b')
    expect(state.current()).toBe('State 1b')

    state.redo()
    expect(state.current()).toBe('State 1b')
  })
})
