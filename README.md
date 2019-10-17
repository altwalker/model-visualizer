# Model-Visualizer

A JavaScript library for displaying JSON models for AltWalker and GraphWalker.

## Installation

### Browser scripts

You can get the latest browser-ready script:

* https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.js
* https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.css

#### CSS

Copy-paste the stylesheet `<link>` into your `<head>` before all other stylesheets to load our CSS.

```html
<link rel="stylesheet" href="https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.css">
```

#### JS

Place the following `<script>`s near the end of your pages, right before the closing `</body>` tag, to enable them.

```html
<script src="https://altom.gitlab.io/altwalker/model-visualizer/model-visualizer.js"></script>
```

### Dependencies Required

* [D3](https://d3js.org/)
* [dagre-d3](https://github.com/dagrejs/dagre-d3)
* [Vue.js](https://vuejs.org/)
* [lodash](https://lodash.com/)

### Optional dependencies
* [Milligram](https://milligram.io/) (__Optional__) - for the forms design.


## Example

The following code initializes `ModelVisualizer` in `editmode` inside the element with the id `visualizer`, using default models defined in the library.

```js
let visualizer = new ModelVisualizer({container: "visualizer", editmode: false});
```

Yo can find a working example [here](https://altom.gitlab.io/altwalker/model-visualizer/).

## Setting Up a Development Environment

Install the npm dependencies:

```
$ npm install
```

### Running locally

```
$ npm run dev
```

Now you can visit http://localhost:8080/ and you should see a live demo.

### Building

```
$ npm run build
```

Will create a build inside the `public/` directory.

### Running Tests

```
$ npm run test
```

## Support

Join our Gitter chat room [here](https://gitter.im/altwalker/community) to chat with us or with other members of the community.

## License

Model-Visualizer is licensed under the GNU General Public License v3.0.
