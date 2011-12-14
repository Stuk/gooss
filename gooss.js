// Gooss.js
// Use a Google spreadsheet as a database, no server-side code needed.
//
// Copyright (c) 2011 Stuart Knightley
// Gooss.js is freely distributable under the MIT license.
// See https://stuartk.com/gooss/ for more details and documentation.

var gooss = (function() {
  "use strict";

  // Process the response from the Google Docs query into a nice JS object.
  //
  // The representation I've chosen isn't the most efficient (each row is
  // an object with every cell mapped to its column name) but it's the
  // most pleasant to use in the templates. And I'm designing this on
  // the basis that people aren't going to be using GDocs as a giant
  // database, but as a small one with less than 100 rows.
  var processDataTable = function (table) {
    // Get all the column names.

    // Array of column labels
    var cols = [],
    // Array of rows in the data tabel. Return variable.
    data = [],
    n_cols = table.getNumberOfColumns(), n_rows = table.getNumberOfRows(),
    // Store how many columns don't have Labels
    misses = 0,
    // If there are no labels, then relabel from the first row. (Technically
    // we don't need this variable, but it makes the code easier to read.
    relabel = false,
    i, j;

    for (i = 0; i < n_cols; i++) {
      // Note the use of the comma operator here to increment the number of
      // label misses, while still returning the column id.
      cols.push(table.getColumnLabel(i) || (misses++, table.getColumnId(i)));
    }
    // If none of the columns have labels we should assume that the
    // table hasn't been set up properly and that the first row actually
    // contains the labels.
    relabel = misses === n_cols;

    // Map the row values to the column names
    for (i = 0; i < n_rows; i++) {
      var row = {};
      for (j = 0; j < n_cols; j++) {
        // Use the first row as labels if we need to
        // TODO: Move this into its own loop?
        if (relabel && i === 0) {
          cols[j] = table.getValue(i, j);
        } else {
          row[cols[j]] = table.getValue(i, j);
        }
      }
      data.push(row);
    }

    // If we've relabeled the first row is useless.
    if (relabel) {
      data.shift();
    }

    return data;
  };

  return {
    data: function(worksheets, callback) {
      if (!worksheets) {
        throw "Worksheets needed";
      }
      if (!callback) {
        throw "Callback needed";
      }

      google.load("visualization", "1", {callback: function() {
        // TODO Sadly it seems
        // extra sheets don't have the labels set correctly, even if the
        // first row is frozen. So either we need to guess-correct this,
        // find out how to set labels in Google Docs, or find some other
        // API which will give us sheet/frozen row data.

        var data = {}, sheets = 0;

        for (var sheet_name in worksheets) {
          if (worksheets.hasOwnProperty(sheet_name)) {
            sheets += 1;
            var sheet = worksheets[sheet_name];
            sheet.index = sheet.index || 0;
            var query = new google.visualization.Query(sheet.url + "&gid=" + parseInt(sheet.index));
            query.send((function() {
              var _sheet_name = sheet_name;
              return function (response) {
                if (response.isError()) {
                  callback(response.getDetailedMessage());
                  // prevent the callback being called again for any successful
                  // sheets
                  sheets = -2;
                  return;
                }

                data[_sheet_name] = processDataTable(response.getDataTable());
                sheets -= 1;
                if (sheets === 0) {
                  callback(null, data)
                }
              }
            })());
          }
        }


      }});
    },

    template: function(context, templater) {
      if (typeof context === 'undefined') {
        throw "No context given for templates";
      }
      if (!templater && typeof _ === 'undefined') {
        throw "No templater set. Please load underscore.js";
      }
      templater = templater || _.template;

      // Replace each template script with the HTML that it generates, wrapped in
      // a div. The div element inherits all the attributes set on the template
      // element.
      var templates = document.body.querySelectorAll('script[type="text/html"]')
      for (var i = 0; i < templates.length; i++) {
        var tmpl = templates[i];
        // Generate the HTML.
        var html = templater(tmpl.innerHTML, context);

        // Create the wrapping div and set the attributes except the type
        // attribute.
        var container = document.createElement("div");
        container.innerHTML = html;
        for (var j = 0; j < tmpl.attributes.length; j++) {
          var attr = tmpl.attributes[j];
          if (attr.name !== "type") {
            container.setAttribute(attr.name, attr.value);
          }
        }

        var parent = tmpl.parentNode;
        // Insert the div and remove the template script.
        parent.insertBefore(container, tmpl);
        parent.removeChild(tmpl);
      }
    }
  };
}());
