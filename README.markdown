gooss.js
========

Use a Google spreadsheet as a database, no server-side code needed.

API
---

### `gooss.data(worksheets, callback)`

The function will retrieve the given worksheets from Google, arrange the data
into nice objects, and call your callback with the data when all the worksheets
have been loaded.

`worksheets` is an object where each property is the name of a worksheet and
the value is an object with the properties `url` and `index`. See below for
an example.

`callback(err, data)` is called when the data has been
retrieved from the spreadsheet. If there has been an error, `err` will be set
to an error message, otherwise it will be `null`. `data` is an object that maps
the worksheet names given in `worksheets` to an array of rows from that
worksheet. Each array element is an object that maps each column name to its
value[1].

#### Example

This example uses the [Food spreadsheet][food_ss]. [Live demo](http://stuartk.com/gooss/examples/food.html)

    gooss.data(
      {
        Food: {
          url: "https://docs.google.com/spreadsheet/ccc?key=0Ar35F5WUAjXedE9SMDRnT0dmUXdNQmJxeG5CRXpjSVE",
          index: 0
        },
        Ingredients: {
          url: "https://docs.google.com/spreadsheet/ccc?key=0Ar35F5WUAjXedE9SMDRnT0dmUXdNQmJxeG5CRXpjSVE",
          index: 1
        }
      },
      function (err, data) {
        if (err) return alert(err);
        console.log(data);
      }
    );

This will log to the console something like ("…" is more data):

    {
      Food: [
        { "Cooking time": 20, "Ingredients": "Butter\nSugar\nEggs\nFlour",  "Name": "Cake", "Preparation time": 10 },
        { "Cooking time": 10, "Ingredients": "Eggs\nCheese", "Name": "Omelette", "Preparation time": 5 },
        …
      ],
      Ingredients: [
        { "Measure": "Weight", "Name": "Butter", "Picture": "http://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Butter_at_the_Borough_Market.jpg/250px-Butter_at_the_Borough_Market.jpg" },
        …
      ]
    }


### `gooss.template(data [, templater])`

This function will find all `<script>` tags with type `text/html` in the body
of the page and replace them with the rendered template wrapped inside a
`<div>`. The `div` will maintain all the attributes set on the script tag
(except `type`).

`data` is the data to be used in the template, most likely from inside the
`gooss.data` callback.

`templater(template, data)` (optional) is the templating function to use. It
should accept a template string (taken from the `<script>` tags) and a data
object. It must return a string. If not set it will use `_.template()` from
[Underscore.js](http://documentcloud.github.com/underscore/) (you must load the
Underscore library onto your page).

#### Example

This example uses the data from the above example. [Live demo](http://stuartk.com/gooss/examples/template.html)

    <body>
      <h1>Menu</h1>
      <script type="text/html" class="menu">
      <ul>
        <% for (var i = 0; i < Food.length; i++) { %>
          <li><%- Food[i].Name %> (contains <% print(Food[i].Ingredients.replace(/\n/g, ", ")) %>)</li>
        <% } %>
      </ul>
      </script>

      <script type="text/javascript">
        // Data has been set elsewhere. This line would probably be inside the
        // gooss.data callback function.
        gooss.template(data);
      </script>
    </body>

Will result in the DOM looking like:

    <body>
      <h1>Menu</h1>
      <div class="menu">
        <ul>
          <li>Cake (contains Butter, Sugar, Eggs, Flour)</li>
          <li>Omelette (contains Eggs, Cheese)</li>
        </ul>
      </div>

      <script type="text/javascript">
        …
      </script>
    </body>

Full examples
-------------

See a full example at http://stuartk.com/bundle

Quick start
-----------

### Spreadsheet

  1. Go to http://docs.google.com/ and create a new spreadsheet.
  2. In the top right click "Share".
  3. Under "Who has access" click "Change".
  4. Select "Anyone with the link".
  5. Make a note of the "Link to share".

### Website

  1. Clone [this repository](https://github.com/Stuk/gooss-quickstart)
  2. In `index.html` set the `url` to the one from above.
  3. Code your template.
  4. Push to Github or your favourite static file host!

### RSS feed (bonus)

  1. On your spreadsheet go to "File" > "Publish to the Web".
  2. Select your main worksheet, and click "Start publishing".
  3. Under "Get a link to the published data" select RSS.
  4. Put this in the first `<link>` tag in `index.html`.

Footnotes
---------

[1] This is not the most space-efficient representation of the sheet, but it's
the most developer friendly. I've designed gooss to be used with relatively
small (<100 rows) worksheets.

[food_ss]: https://docs.google.com/spreadsheet/ccc?key=0Ar35F5WUAjXedE9SMDRnT0dmUXdNQmJxeG5CRXpjSVE

License
-------

Licensed under the MIT license.
