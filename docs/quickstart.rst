Quickstart
==========

Get started with ModelVisualizer, with CDN and a template starter page.

Browser scripts
---------------

You can get the latest browser-ready script:

* https://altwalker.github.io/model-visualizer/build/model-visualizer.css
* https://altwalker.github.io/model-visualizer/build/model-visualizer.js

CSS
~~~

Copy-paste the stylesheet ``<link>`` into your ``<head>`` before all other
stylesheets to load our CSS.

.. code-block:: html

    <link rel="stylesheet" href="https://altwalker.github.io/model-visualizer/build/model-visualizer.css">


JavaScript
~~~~~~~~~~

Place the following ``<script>`` s near the end of your pages, right before the
closing ``</body>`` tag, to enable them.

.. code-block:: html

    <script src="https://altwalker.github.io/model-visualizer/build/model-visualizer.js"></script>


Dependencies
~~~~~~~~~~~~

Required Dependencies
*********************

* `Vue.js <https://vuejs.org/>`_
* `lodash <https://lodash.com/>`_

Optional Dependencies
*********************

* `Milligram <https://milligram.io/>`_ (**Optional**) - for the forms design.

Initialize the ModelVisualizer
------------------------------

The following code initializes ``ModelVisualizer`` in ``editMode`` inside the
element with the id ``visualizer``, using default models defined in the
library.

.. code-block:: javascript

    let visualizer = new ModelVisualizer({container: "visualizer", editMode: false});

Yo can find a working example `here <https://altwalker.github.io/model-visualizer/_static/examples/edit-mode.html>`_.

Starter Template
----------------

Put it all together and your pages should look like this:

.. code-block:: html

    <!doctype html>
    <html lang="en">
        <head>
            <title>ModelVisualizer - Starter Template</title>

            <!-- ModelVisualizer CSS -->
            <link rel="stylesheet" href="https://altwalker.github.io/model-visualizer/build/model-visualizer.css">

            <!-- Optional Milligram CSS -->
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/milligram/1.3.0/milligram.css">
        </head>
        <body>
            <div id="visualizer">
            </div>

            <!-- VueJS -->
            <script src="https://cdn.jsdelivr.net/npm/vue"></script>

            <!-- lodash -->
            <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"></script>

            <!-- Model-Visualizer -->
            <script src="https://altwalker.github.io/model-visualizer/build/model-visualizer.js"></script>

            <!-- Main JS -->
            <script>
                let visualizer = new ModelVisualizer({container: "visualizer", editMode: false});
            </script>
        </body>
    </html>
