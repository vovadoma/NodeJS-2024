import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';

const logger = require('pino')();

const redisURL = (workerData?.redisURL || 'redis://localhost:6379/4');
const streamName = (workerData?.streamName || 'data_sync_stream_test');
const appName = (workerData?.appName || 'app_test');

const redisSubClient = new Redis(redisURL);
const redisClient = new Redis(redisURL);

const streamNameProcessed = streamName + '::processed::' + appName;
const streamNameFailed = streamName + '::failed::' + appName;

logger.info('Sub data sync worker started.');

const readFromStream = async () => {
  const startCursor = await redisClient.lindex(streamNameProcessed, -1) || '0';
  const streamData: any = await redisClient.xread('BLOCK', 0, 'STREAMS', streamName, startCursor);
  const eventsData = streamData[0][1] || [];

  for (const event of eventsData) {
    const [id, data] = event;

    // TODO add to the Job Queue

    // mark as processed
    await redisClient.rpush(streamNameProcessed, id);

    // mark as failed
    await redisClient.rpush(streamNameFailed, id);

    console.log(id);
    console.dir(data);
  }
}

(async () => {
  await redisSubClient.subscribe(streamName);
  await readFromStream();
  redisSubClient.on('message', async (channel, message) => {
    await readFromStream();
  });
})();

// Error handling for the Redis client
const errorHandler = (err: any) => logger.error('Error connecting to Redis:', err);
redisSubClient.on('error', errorHandler);
redisClient.on('error', errorHandler);

// Gracefully close the Redis connection on exit
(async () => {
  process.on('SIGINT', () => {
    redisSubClient.disconnect();
    redisClient.disconnect();
    console.log('Redis connection closed');
    process.exit();
  });
})();
