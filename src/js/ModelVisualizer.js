import { defaultModels, displayModels } from "./graph";
import { validateModels } from "./models";
import "../css/style.css";

export default class ModelVisualizer {
  constructor(container, models) {
    if (!container)
      throw Error("The container for rendering the model is required");
    if (typeof container === "string" || container instanceof string) {
      container = document.getElementById(container);
    }
    if (!models) models = defaultModels;
    this.container = container;
    this.update(models);
  }
  validate(models) {
    console.debug("Validating");
    validateModels(models);
  }
  refresh() {
    console.debug("Updating view");
    displayModels(this.container, this.models);
  }
  update(models) {
    console.debug("Updating models");

    this.validate(models);
    this.models = models;
    this.refresh();
  }
}
