import undoredo from "../src/js/undoredo"


test('Initial state is set', () => {
    var state = new undoredo("initial_state")
    expect(state.current()).toBe("initial_state")
});


test('UndoRedo', () => {
    var state = new undoredo("state0")
    state.push("state1")
    state.push("state2")
    state.push("state3")
    expect(state.current()).toBe("state3")
    state.undo()
    expect(state.current()).toBe("state2")
    state.undo()
    expect(state.current()).toBe("state1")
    state.undo()
    expect(state.current()).toBe("state0")
    state.undo()
    expect(state.current()).toBe("state0")
    state.redo()
    expect(state.current()).toBe("state1")
    state.redo()
    expect(state.current()).toBe("state2")
    state.redo()
    expect(state.current()).toBe("state3")
    state.redo()
    expect(state.current()).toBe("state3")
});

test('redo after push does nothing', () => {
    var state = new undoredo("state0")
    state.push("state1")
    state.push("state2")
    state.push("state3")
    state.undo()
    state.undo()
    expect(state.current()).toBe("state1")
    state.redo()
    expect(state.current()).toBe("state2")

    state.push("new state")
    expect(state.current()).toBe("new state")
    state.redo()
    expect(state.current()).toBe("new state")

    state.undo()
    expect(state.current()).toBe("state2")
});
