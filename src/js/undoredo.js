export default class UndoRedo {
  constructor(initialState) {
    this.states = [JSON.parse(JSON.stringify(initialState))]
    this.currentStateIndex = 0
  }

  push(state) {
    state = JSON.parse(JSON.stringify(state))

    if (JSON.stringify(this.current()) === JSON.stringify(state)) return this
    this.states = this.states.slice(0, this.currentStateIndex + 1)
    this.states.push(state)
    this.currentStateIndex++
    return this
  }

  undo() {
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--
    }
    return this
  }

  redo() {
    if (this.currentStateIndex < this.states.length - 1) {
      this.currentStateIndex++
    }
    return this
  }

  current() {
    return JSON.parse(JSON.stringify(this.states[this.currentStateIndex]))
  }
}
