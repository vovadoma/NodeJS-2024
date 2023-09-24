import { Worker } from 'worker_threads';
import path from 'path';
import pubEmitter from "../../pub.emitter";

const logger = require('pino')();

interface ConnectParams {
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

    pubEmitter.on('Publish::DataSyncEvent', (evenData) => {
      this.worker.postMessage(evenData);
    });
  }
}

