import * as toml from 'toml';
import * as yaml from 'js-yaml';
import { readFile, readJson } from 'fs-extra';
import { parse, resolve } from 'path';
import { cwd } from 'process';

export interface Config {
    timeout: number;
    udmx?: {
        vendorId: number; deviceId: number;
    };
    artnet: {
        port: number; universe: number;
    };
    health?: number | false;
}

export const defaults: Config = {
    timeout: 1000,
    udmx: {
        vendorId: 0x16c0,
        deviceId: 0x5dc
    },
    artnet: {
        port: 6454,
        universe: 0
    },
    health: false
};

const readToml = async (path: string): Promise<Config> => {
    const file = await readFile(path, 'utf8');
    return toml.parse(file);
};

const readYaml = async (path: string): Promise<Config> => {
    const file = await readFile(path, 'utf8');
    return <Config>yaml.safeLoad(file);
};

export const read = async (filename: string): Promise<Config> => {
    const path = resolve(cwd(), filename);
    const { ext } = parse(path);
    let config: Config;
    switch (ext) {
        case '.toml':
            config = await readToml(path);
            break;
        case '.json':
            config = await readJson(path);
            break;
        case '.yml':
        case '.yaml':
            config = await readYaml(path);
            break;
        default:
            throw new Error('Invalid extension');
    }
    validate(config);
    return {
        timeout: config.timeout != null ? config.timeout : defaults.timeout,
        udmx: { ...defaults.udmx, ...config.udmx },
        artnet: { ...defaults.artnet, ...config.artnet },
        health: config.health != null ? config.health : defaults.health
    };
};

const validate = (config: Config) => {

};