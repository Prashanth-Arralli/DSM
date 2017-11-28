var multer = require('multer');
var config = require('config');
module.exports = {
  imgUpload: function (folder) {
    var image_storage = multer.diskStorage({
      destination: ROOT_FOLDER + '/public/' + folder,
      filename: function (req, file, cb) {
        var explodes = file.originalname.split(".");
        var accepted_extension = ["jpeg", "png", "jpg", "gif" ];
        if (explodes.length >= 2) {
          var ext = explodes[explodes.length - 1];
          if (accepted_extension.indexOf(ext) !== -1) {
            let name = explodes[0] + new Date().getTime() + "." + ext;
            file['url'] = config.get('baseUrl') + '/' + folder + '/' + name;
            return cb(null, name);
          } else {
            return cb(new Error("Only image file can be accepted"));
          }
        } else {
          return cb(new Error("Invalid file"));
        }
      }
    });
    return multer({
      storage: image_storage
    });
  },
  fileUpload: function (folder) {
    var image_storage = multer.diskStorage({
      destination: ROOT_FOLDER + '/public/' + folder,
      filename: function (req, file, cb) {
        var explodes = file.originalname.split(".");
        var accepted_extension = ["xlsx", 'xls', 'csv'];
        if (explodes.length >= 2) {
          var ext = explodes[explodes.length - 1];
          if (accepted_extension.indexOf(ext) !== -1) {
            let name = explodes[0] + new Date().getTime() + "." + ext;
            file['url'] = config.get('baseUrl') + '/' + folder + '/' + name;
            return cb(null, name);
          } else {
            return cb(new Error("Only image file can be accepted"));
          }
        } else {
          return cb(new Error("Invalid file"));
        }
      }
    });
    return multer({
      storage: image_storage
    });
  },
  assignImageDataToBody: function (type, field_name) {
    return function (req, res, next) {
      if (type == "array" && req.files)
        req.body[field_name] = req.files;
      else if (type == "single" && req.file)
        req.body[field_name] = req.file;
      else if (type == "single_array") {
        if (req.files)
          req.body[field_name] = req.files[0];
        else
          req.body[field_name] = req.file;
      } else if (type == "fields" && Array.isArray(field_name)) {
        field_name.forEach(function (name) {
          if (req.files && req.files[name] && req.files[name].length > 1)
            req.body[name] = req.files[name];
          else if (req.files && req.files[name] && req.files[name])
            req.body[name] = req.files[name][0];
          else
            delete req.body[name];
        });
      } else
        delete req.body[field_name];
      next();
    }
  }
}
