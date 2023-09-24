import { Worker } from 'worker_threads';
import path from 'path';

const logger = require('pino')();

interface ConnectParams {
  appName: string,
  streamName: string,
  redisURL: string
}

export default new class {

  protected worker: any;

  init (params: ConnectParams) {

    this.worker = new Worker(path.resolve(__dirname, './worker.js'), {
      workerData: { ...params }
    });

    this.worker.on('message', (result: any) => {
      logger.info(result);
    });

    this.worker.on('error', (error: any) => {
      logger.error(error);
    });
  };

}


