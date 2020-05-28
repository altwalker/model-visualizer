
/**
 * Base error for ModelVisualizer.
 */
export class ModelVisualizerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ModelVisualizerError'
  }
}

/**
 * Error for invalid but plottable graphs.
 */
export class ValidationError extends ModelVisualizerError {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Error for unplottable graphs.
 */
export class PlottingError extends ModelVisualizerError {
  constructor(message) {
    super(message)
    this.name = 'PlottingError'
  }
}
