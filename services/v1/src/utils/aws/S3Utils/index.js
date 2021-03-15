const config = require('../../../config');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: config.AWS.accessKeyId,
  secretAccessKey: config.AWS.secretAccessKey,
  region: config.AWS.region,
  params: {
    Bucket: config.AWS.S3.bucket,
  },
});

module.exports = {
  upload(options = {}, type, userId, base64Data) {
    return new Promise((resolve, reject) => {
      console.log('Uploading image to AWS S3...');
      base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
      s3.upload(
        {
          ACL: 'public-read',
          Key: `${type}_profile_image:user_id_${userId}`,
          Bucket: `${config.AWS.S3.bucket}/${config.AWS.S3.bucketPIFolder}`,
          Body: Buffer.from(base64Data, 'base64'),
          ContentEncoding: 'base64',
        },
        options,
        (error, data) => {
          if (error) {
            console.log(`S3 Upload error: ${error}`);
            return reject(error);
          }
          console.log(`S3 Upload data: ${data}`);
          resolve(data.Location);
        },
      );
    });
  },
};
