// Placeholder for future AWS wiring (S3 client, SES client, CloudWatch
// logger, etc). Reads from env but never requires them to be set locally.
const cloudConfig = {
  region: process.env.AWS_REGION || null,
  s3Bucket: process.env.AWS_S3_BUCKET || null,
  isConfigured: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
};

module.exports = cloudConfig;
