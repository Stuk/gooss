GoDB.js
=======

## Use a Google spreadsheet as a database, no server needed.

API
---

### `GoDB.data(*object* worksheets, *function* callback(*string* err, *object* data))`

`worksheets` is an object where each property is the name of a worksheet, and
the value is another object that contains a URL and the worksheet index

`callback(*string* err, *object* data)` is called when the data has been
retreived from the Spreadsheet. If there has been an error, `err` will be set
to an error message, otherwise it will be `null`. `data` is an object that maps
the worksheet names given in `worksheets` to an array of rows from that
worksheet. Each array element is an object that maps each column name to its
value[1].

#### Example

This example uses the [Food spreadsheet][food_ss]. [Live](http://stuartk.com/godb/examples/food.html)

    GoDB.data(
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

This will log to the console:



Footnotes
---------

[1] This is not the most space-efficient representation of the sheet, but it's
the most developer friendly. I've designed this to be used with relatively
small (<100 rows) worksheets, and with this use case there should be no
problems.

[food_ss]: https://docs.google.com/spreadsheet/ccc?key=0Ar35F5WUAjXedE9SMDRnT0dmUXdNQmJxeG5CRXpjSVE
