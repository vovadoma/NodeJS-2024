import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';

const appName = 'app1';
const logger = require('pino')();

const redisURL = (workerData?.redisURL || 'redis://localhost:6379/4');
const channelName = 'Publish::DataSyncEvent::channel';
const streamName= 'Publish::DataSyncEvent::stream';
const redisSubClient = new Redis(redisURL);
const redisClient = new Redis(redisURL);

const streamNameProcessed = streamName + '::processed::' + appName;

logger.info('Sub data sync worker started.');

(async () => {
  await redisSubClient.subscribe(channelName);

  redisSubClient.on('message', async (channel, message) => {
    const startCursor = await redisClient.lindex(streamNameProcessed, -1) || '0';
    const streamData: any = await redisClient.xread('BLOCK', 0, 'STREAMS', streamName, startCursor);
    const eventsData = streamData[0][1] || [];

    for (const event of eventsData) {
      const [id, data] = event;

      // mark as processed
      await redisClient.rpush(streamNameProcessed, id);

      console.log(id);
      console.dir(data);
    }
  });
})();
