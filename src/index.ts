import { Server } from 'artnet-node';
import * as uDMX from 'udmx';
import * as yargs from 'yargs';
import { read, defaults } from './config';
import * as debug from 'debug';
import { setup as healthApiSetup, emit, MessageType, ArtnetPacketPayload } from './health';

const d = debug('udmx-artnet-bridge');

const init = async() => {
    const { c } = yargs
        .alias('c', 'config')
        .describe('c', 'path to the configuration file')
        .string('c')
        .argv;
    let config = defaults;

    if (c) {
        config = await read(c);
    }

    if (config.health) {
        healthApiSetup(config);
    }

    const buffer = new Array(512).fill(0);

    const device = new uDMX({
        vendor: config.udmx.vendorId,
        device: config.udmx.deviceId
    });
    const connect = () => {
        try {
            d('Connecting to dongle');
            device.connect();
        }catch(err) {
            d('Connection failed');
            emit(MessageType.uDMXDisconnected);
            setTimeout(() => connect(), 1000);
        }
    };
    device.on('connected', () => {
        console.log('Connected to uDMX dongle');
        emit(MessageType.uDMXConnected);
        for (let i = 0; i < 512; i++) {
            device.set(i + 1, buffer[i]);
        }
    });
    connect();
    Server.listen(config.artnet.port, ({ data, universe }, peer) => {
        emit(MessageType.ArtnetPacket, <ArtnetPacketPayload>{
            data,
            universe,
            peer
        });
        if (universe !== config.artnet.universe) {
            return;
        }
        d(`Received Artnet msg from ${peer.address}`);
        Promise.all(new Array(data.length)
            .fill(0)
            .map(async(_, i) => {
                const value = data.readUInt8(i);
                if (buffer[i] === value) {
                    return;
                }
                await device.set(i + 1, value);
                buffer[i] = value;
            }))
            .catch(err => console.error(err));
    });
};

init().catch(err => console.error(err));