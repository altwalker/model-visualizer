# Model-Visualizer

A JavaScript library for visualizing and visually editing JSON models for [AltWalker](https://altwalker.github.io/altwalker/) and [GraphWalker](http://graphwalker.github.io/).

## Installation

### Browser scripts

You can get the latest browser-ready script:

* https://altwalker.github.io/model-visualizer/build/model-visualizer.css
* https://altwalker.github.io/model-visualizer/build/model-visualizer.js

#### CSS

Copy-paste the stylesheet `<link>` into your `<head>` before all other stylesheets to load our CSS.

```html
<link rel="stylesheet" href="https://altwalker.github.io/model-visualizer/build/model-visualizer.css">
```

#### JS

Place the following `<script>`s near the end of your pages, right before the closing `</body>` tag, to enable them.

```html
<script src="https://altwalker.github.io/model-visualizer/build/model-visualizer.js"></script>
```

### Required Dependencies

* [D3](https://d3js.org/)
* [dagre-d3](https://github.com/dagrejs/dagre-d3)
* [Vue.js](https://vuejs.org/)
* [lodash](https://lodash.com/)

### Optional Dependencies

* [d3-legend](https://d3-legend.susielu.com/) (__Optional__) - if you want to use the legend.
* [Milligram](https://milligram.io/) (__Optional__) - for the forms design.

## Example

The following code initializes `ModelVisualizer` in `editMode` inside the element with the id `visualizer`, using default models defined in the library.

```js
let visualizer = new ModelVisualizer({container: "visualizer", editMode: false});
```

Yo can find a working example [here](https://altwalker.github.io/model-visualizer/_static/examples/edit-mode.html).

## Setting Up a Development Environment

Install the npm dependencies:

```bash
$ npm install
```

### Running locally

```bash
$ npm run dev
```

Now you can visit http://localhost:8080/ and you should see a live demo.

### Building

```bash
$ npm run build
```

Will create a build inside the `public/` directory.

### Running Tests

```bash
$ npm run test
```

## Support

Join our Gitter chat room [here](https://gitter.im/altwalker/community) to chat with us or with other members of the community.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
