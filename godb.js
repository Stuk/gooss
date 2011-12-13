var GoDB = (function() {
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
    // TODO If none of the columns have labels we should assume that the
    // tabel hasn't been set up properly and that the first row actually
    // contains the labels.
    var cols = [];
    var m = table.getNumberOfColumns();
    var i, j;
    for (i = 0; i < m; i++) {
      cols.push(table.getColumnLabel(i) || table.getColumnId(i));
    }

    // Map the row data to the column names
    m = table.getNumberOfRows();
    var data = [];
    for (i = 0; i < m; i++) {
      var row = {};
      for (j = 0; j < cols.length; j++) {
        row[cols[j]] = table.getValue(i, j);
      }
      data.push(row);
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
      // TODO replace _.each here with regular JS loops
      _.each(document.body.querySelectorAll('script[type="text/html"]'),
        function(tmpl) {
          // Generate the HTML.
          var html = templater(tmpl.innerHTML, context);

          // Create the wrapping div and set the attributes except the type
          // attribute.
          var container = document.createElement("div");
          container.innerHTML = html;
          _.each(tmpl.attributes, function(attr) {
            if (attr.name !== "type") {
              container.setAttribute(attr.name, attr.value);
            }
          });

          var parent = tmpl.parentElement;
          // Insert the div and remove the template script.
          parent.insertBefore(container, tmpl);
          parent.removeChild(tmpl);
        }
      );
    }
  };
}());
