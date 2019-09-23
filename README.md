# Installing

## Browser scripts

You can get the latest browser-ready script:

https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.js
https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.css

### Dependencies required

`d3`
`dagre-d3`
`vue`

### Optional dependencies

`Milligram` - for designing the forms.

# Example

The following code initializes ModelVisualizer in editmode inside the element with id="visualizer", using default models defined in the library.

```js
visualizer = new ModelVisualizer({ container: "visualizer", editmode: false });
```

Yo can find a working example here:

https://altom.gitlab.io/altwalker/model-visualizer/

# Running locally

`npm run dev`

# Building

`npm run build`
