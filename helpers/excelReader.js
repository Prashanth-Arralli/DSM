const config = require('config');
const excelReader = require('xlsx');
const Read = (options) => {
  let data = [];
  if (!options.file) return data;
  try {
    let workbook = excelReader.readFile(options.file);
    let sheets = workbook.SheetNames;
    sheets.forEach(async(item) => {
      let sheet = workbook.Sheets[item];
      var a = {};
      var headers = {};
      var result = [];
      for (z in sheet) {
        if (z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
          if (!isNaN(z[i])) {
            tt = i;
            break;
          }
        };
        var col = z.substring(0, tt);

        var row = parseInt(z.substring(tt));
        var value = sheet[z].v ? sheet[z].v : null;
        //store header names
        if (row == 1 && value) {
          if (options.fields)
            headers[col] = options.fields[value] ? options.fields[value] : value.toLowerCase();
          else
            headers[col] = value.toLowerCase();
          continue;
        }
        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
        if (options.defaultFields) {
          Object.keys(options.defaultFields).forEach((item) => {
            if (!data[row][item]) data[row][item] = options.defaultFields[item];
          })
        }
      }
    });
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    return data;
  } catch (ex) {
    console.log(ex)
  }
};
module.exports = {
  Read
};
