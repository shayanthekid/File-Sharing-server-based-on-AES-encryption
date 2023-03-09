const multerS3 = require('multer-s3');
const multer = require('multer');
const AWS = require('../models/aws');
const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'bucket123niggermelon',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
});

module.exports = upload;

