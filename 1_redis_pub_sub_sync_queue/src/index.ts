import process from "node:process";

import pub from './jobs/pub'
import sub from './jobs/sub'

import pubEmitter from "./pub.emitter";

const {
    REDIS_URL = 'redis://localhost:6379/4',
    REDIS_STREAM = 'Publish::DataSyncEvent::V2'
} = process.env;

const appName = 'App1';

pub.init({ redisURL: REDIS_URL, streamName: REDIS_STREAM });
sub.init({ redisURL: REDIS_URL, streamName: REDIS_STREAM, appName });

pubEmitter.update('', {});
