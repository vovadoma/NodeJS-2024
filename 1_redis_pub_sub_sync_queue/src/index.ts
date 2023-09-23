import process from "node:process";

import pub from './jobs/pub'
import sub from './jobs/sub'

import pubEmitter from "./pub.emitter";

const { REDIS_URL = 'redis://localhost:6379/4'} = process.env;

pub.init({ redisURL: REDIS_URL });
sub.init({ redisURL: REDIS_URL });

pubEmitter.update('', {});
