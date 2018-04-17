import 'mocha';
import { expect, use } from 'chai';
import { enable, disable, registerMock, registerAllowable } from 'mockery';
import { stub } from 'sinon';
import * as sinonChai from 'sinon-chai';

use(sinonChai);

describe('config', () => {
    let tomlMock;
    let yamlMock;
    let fsMock;
    let pathMock;
    let processMock;

    let config;

    before(() => enable());

    after(() => disable());

    before(async() => {
        tomlMock = {
            parse: stub()
        };
        yamlMock = {
            safeLoad: stub()
        };
        fsMock = {
            readJson: stub(),
            readFile: stub()
        };
        pathMock = {
            parse: stub(),
            resolve: stub()
        };
        processMock = {
            cwd: stub()
        };
        registerMock('toml', tomlMock);
        registerMock('js-yaml', yamlMock);
        registerMock('fs-extra', fsMock);
        registerMock('path', pathMock);
        registerMock('process', processMock);
        registerAllowable('./config');
        config = await import('./config');
    });

    it('should expose a read function', () => {
        expect(config.read).to.be.an.instanceOf(Function);
    });

    it('should merge the path with the cwd', async() => {
        const path = 'path';
        const cwd = '/home/maxjoehnk';
        processMock.cwd.returns(cwd);
        pathMock.parse.returns({});
        try {
            await config.read(path);
        }catch (err) {
        }
        expect(pathMock.resolve).to.have.been.calledWith(cwd, path);
    });

    describe('parsing', () => {
        it('should parse json when ext is .json', async() => {
            const path = 'path';
            pathMock.resolve.returns(path);
            pathMock.parse.returns({
                ext: '.json'
            });
            fsMock.readJson.resolves({});
            await config.read(path);
            expect(fsMock.readJson).to.have.been.calledWith(path);
        });

        it('should parse toml when ext is .toml', async() => {
            const path = 'path';
            const buffer = 'filecontents';
            pathMock.resolve.returns(path);
            pathMock.parse.returns({
                ext: '.toml'
            });
            fsMock.readFile.resolves(buffer);
            tomlMock.parse.returns({});
            await config.read(path);
            expect(fsMock.readFile).to.have.been.calledWith(path);
            expect(tomlMock.parse).to.have.been.calledWith(buffer);
        });

        it('should parse yaml when ext is .yml', async() => {
            const path = 'path';
            const buffer = 'filecontents';
            pathMock.resolve.returns(path);
            pathMock.parse.returns({
                ext: '.yml'
            });
            fsMock.readFile.resolves(buffer);
            yamlMock.safeLoad.returns({});
            await config.read(path);
            expect(fsMock.readFile).to.have.been.calledWith(path);
            expect(yamlMock.safeLoad).to.have.been.calledWith(buffer);
        });

        it('should parse yaml when ext is .yaml', async() => {
            const path = 'path';
            const buffer = 'filecontents';
            pathMock.resolve.returns(path);
            pathMock.parse.returns({
                ext: '.yaml'
            });
            fsMock.readFile.resolves(buffer);
            yamlMock.safeLoad.returns({});
            await config.read(path);
            expect(fsMock.readFile).to.have.been.calledWith(path);
            expect(yamlMock.safeLoad).to.have.been.calledWith(buffer);
        });
    });

    describe('defaults', () => {
        it ('should return default timeout when no timeout is set', async() => {
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({});
            const result = await config.read();
            expect(result.timeout).to.equal(1000);
        });

        it ('should return timeout from config when set', async() => {
            const timeout = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                timeout
            });
            const result = await config.read();
            expect(result.timeout).to.equal(timeout);
        });

        it ('should return default udmx when no udmx options are set', async() => {
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({});
            const result = await config.read();
            expect(result.udmx.vendorId).to.equal(0x16c0);
            expect(result.udmx.deviceId).to.equal(0x5dc);
        });

        it ('should return udmx.vendorId from config when set', async() => {
            const vendorId = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                udmx: {
                    vendorId
                }
            });
            const result = await config.read();
            expect(result.udmx.vendorId).to.equal(vendorId);
            expect(result.udmx.deviceId).to.equal(0x5dc);
        });

        it ('should return udmx.deviceId from config when set', async() => {
            const deviceId = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                udmx: {
                    deviceId
                }
            });
            const result = await config.read();
            expect(result.udmx.vendorId).to.equal(0x16c0);
            expect(result.udmx.deviceId).to.equal(deviceId);
        });

        it ('should return udmx from config when set', async() => {
            const vendorId = Math.random();
            const deviceId = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                udmx: {
                    vendorId,
                    deviceId
                }
            });
            const result = await config.read();
            expect(result.udmx.vendorId).to.equal(vendorId);
            expect(result.udmx.deviceId).to.equal(deviceId);
        });

        it ('should return default artnet when no artnet options are set', async() => {
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({});
            const result = await config.read();
            expect(result.artnet.port).to.equal(6454);
            expect(result.artnet.universe).to.equal(0);
        });

        it ('should return artnet.port from config when set', async() => {
            const port = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                artnet: {
                    port
                }
            });
            const result = await config.read();
            expect(result.artnet.port).to.equal(port);
            expect(result.artnet.universe).to.equal(0);
        });

        it ('should return artnet.universe from config when set', async() => {
            const universe = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                artnet: {
                    universe
                }
            });
            const result = await config.read();
            expect(result.artnet.port).to.equal(6454);
            expect(result.artnet.universe).to.equal(universe);
        });

        it ('should return artnet from config when set', async() => {
            const port = Math.random();
            const universe = Math.random();
            pathMock.parse.returns({ ext: '.json' });
            fsMock.readJson.returns({
                artnet: {
                    port,
                    universe
                }
            });
            const result = await config.read();
            expect(result.artnet.port).to.equal(port);
            expect(result.artnet.universe).to.equal(universe);
        });
    });
});
