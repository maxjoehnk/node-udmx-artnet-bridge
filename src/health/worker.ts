import { isMainThread, parentPort, workerData } from 'worker_threads';
import * as express from 'express';
import { ArtnetPacketPayload, MessageType } from './index';

if (isMainThread) {
    throw new Error('Worker file started from main process');
}

interface HealthApiState {
    udmx: {
        connected: boolean;
    };
    artnet: {
        port: number; universe: number;
    };
    writes: ArtnetWrite[];
}

interface ArtnetWrite {
    timestamp: number;
    peer: string;
    universe: number;
    data: number[];
}

const state: HealthApiState = {
    udmx: {
        connected: false
    },
    artnet: workerData.artnet,
    writes: []
};

parentPort.on('message', msg => {
    switch (msg.type) {
        case MessageType.uDMXConnected:
            udmxConnected();
            break;
        case MessageType.uDMXDisconnected:
            udmxDisconnected();
            break;
        case MessageType.ArtnetPacket:
            artnetPacket(msg.payload);
            break;
    }
});

function udmxConnected() {
    state.udmx.connected = true;
}

function udmxDisconnected() {
    state.udmx.connected = false;
}

function artnetPacket({ peer, universe, data }: ArtnetPacketPayload) {
    const write: ArtnetWrite = {
        timestamp: Date.now(),
        peer: peer.address,
        universe,
        data: [...data]
    };
    state.writes.push(write);
}

function isHealthy(): boolean {
    return state.udmx.connected;
}

function getLastWrite(): ArtnetWrite {
    const amountOfWrites = state.writes.length;
    if (amountOfWrites === 0) {
        return null;
    }
    return state.writes[amountOfWrites - 1];
}

const app = express();

app.get('/health', (req, res) => {
    const healthy = isHealthy();
    const lastWrite = getLastWrite();

    res.status(200);
    res.json({
        healthy,
        lastWrite,
        connected: state.udmx.connected
    });
    res.end();
});

app.get('/health/config', (req, res) => {
    res.status(200);
    res.json({
        artnet: state.artnet
    });
    res.end();
});

app.get('/health/history', (req, res) => {
    res.status(200);
    res.json(state.writes);
    res.end();
});

app.listen(workerData.health, () => console.log(`Health Api listening on 0.0.0.0:${workerData.health}`));
