import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';

const logger = require('pino')();

const redisURL = (workerData?.redisURL || 'redis://localhost:6379/4');
const streamName = (workerData?.streamName || 'data_sync_stream_test');
const redisClient = new Redis(redisURL);

logger.info('Pub data sync worker started.');

const publishEvent = async (eventData: any) => {
  try {
    const id = await redisClient.xadd(streamName, '*', 'message', JSON.stringify(eventData)) as string;
    await redisClient.publish(streamName, id);
    logger.info(`Message published to channel ${streamName}: ${id}`);
  } catch (err) {
    logger.error('Error publishing message:', err);
  }
}

if (parentPort) {
  parentPort.on('message', async (eventData: any) => {
    await publishEvent(eventData);
  });
} else {
  publishEvent({data: 'test event data'});
}
