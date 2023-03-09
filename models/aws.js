const AWS = require('aws-sdk');

// Configure the AWS SDK with your credentials
AWS.config.update({
    region: '', // replace with your preferred region
    accessKeyId: "",
    secretAccessKey: "",
    AWS_SDK_LOAD_CONFIG: "1"
});

module.exports = AWS;