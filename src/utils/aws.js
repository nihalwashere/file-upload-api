const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");

const {
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
} = require("./config");

const s3 = new S3({
  region: AWS_BUCKET_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

const uploadFile = async ({ key, body, contentType }) => {
  const payload = {
    Bucket: AWS_BUCKET_NAME,
    Body: body,
    Key: key,
    ContentEncoding: "base64",
    ContentType: contentType,
  };

  return await s3.upload(payload).promise();
};

const deleteFile = async (key) => {
  const payload = {
    Bucket: AWS_BUCKET_NAME,
    Key: key,
  };

  return await s3.deleteObject(payload).promise();
};

module.exports = { uploadFile, deleteFile };
