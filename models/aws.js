const AWS = require('aws-sdk');

// Configure the AWS SDK with your credentials
AWS.config.update({
    region: 'ap-southeast-1', // replace with your preferred region
    accessKeyId: "AKIA4BBV35IBJL7GW54M",
    secretAccessKey: "f7FK4CYj+/H9KByVxXGvdUSxSmxRuQb2IQ/IO0NB",
    AWS_SDK_LOAD_CONFIG: "1"
});

module.exports = AWS;