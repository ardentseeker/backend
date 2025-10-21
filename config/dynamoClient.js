import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

// simple logger with timestamps
const logger = {
  info: (...msg) => console.log(new Date().toISOString(), '[INFO]', ...msg),
  warn: (...msg) => console.warn(new Date().toISOString(), '[WARN]', ...msg),
  error: (...msg) => console.error(new Date().toISOString(), '[ERROR]', ...msg),
};

AWS.config.update({ region: process.env.AWS_REGION });
// enable SDK logging through our logger (AWS SDK v2 expects an object with `log`)
AWS.config.logger = { log: (...args) => logger.info(...args) };

const dynamo = new AWS.DynamoDB();
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

// test function to verify table exists and is reachable
export async function testDynamoConnection() {
  if (!TABLE_NAME) {
    const err = new Error('TABLE_NAME environment variable is not set');
    logger.error(err.message);
    throw err;
  }

  try {
    const res = await dynamo.describeTable({ TableName: TABLE_NAME }).promise();
    logger.info('DynamoDB table found:', TABLE_NAME, 'status=', res.Table.TableStatus);
    return res;
  } catch (err) {
    // log friendly message and rethrow for caller to handle
    if (err.code === 'ResourceNotFoundException') {
      logger.error('DynamoDB table not found:', TABLE_NAME);
    } else {
      logger.error('DynamoDB describeTable failed:', err.message);
    }
    throw err;
  }
}

export { dynamoClient, TABLE_NAME, logger };
