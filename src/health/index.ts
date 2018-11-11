import { isMainThread, Worker } from 'worker_threads';
import { resolve } from 'path';
import { Config } from '../config';
import { RemoteInfo } from 'dgram';

let worker: Worker;

export function setup(config: Config) {
    if (isMainThread) {
        startWorker(config);
    }
}

export function emit(type: MessageType, payload?: any) {
    if (isMainThread && worker) {
        worker.postMessage({
            type,
            payload
        });
    }
}

function startWorker(config: Config) {
    worker = new Worker(resolve(__dirname, './worker.js'), {
        workerData: config
    });
}

export enum MessageType {
    uDMXConnected,
    uDMXDisconnected,
    ArtnetPacket
}

export interface ArtnetPacketPayload {
    data: Uint8Array;
    peer: RemoteInfo;
    universe: number;
}