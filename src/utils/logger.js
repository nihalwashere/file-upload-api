const winston = require("winston");
const WinstonCloudWatch = require("winston-aws-cloudwatch");
const AWS = require("aws-sdk");

const {
  APP_ENV,
  LOG_LEVEL,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
} = require("./config");

AWS.config.update({
  region: AWS_BUCKET_REGION,
});

const ENV = APP_ENV || "local";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const format = winston.format.combine(
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level} ${info.message}`
  ),
  winston.format.simple()
);

const transports = [new winston.transports.Console()];

const logger = winston.createLogger({
  level: LOG_LEVEL || "debug",
  levels,
  format,
  transports,
});

if (ENV !== "local") {
  logger.add(
    new WinstonCloudWatch({
      awsRegion: AWS_BUCKET_REGION,
      awsAccessKeyId: AWS_ACCESS_KEY,
      awsSecretKey: AWS_SECRET_KEY,
      logGroupName: "file-upload-api",
      logStreamName: ENV,
      createLogGroup: false,
      createLogStream: true,
      formatLog: (info) =>
        `${info.meta.timestamp} ${info.level} ${info.message}`,
    })
  );
}

module.exports = logger;
