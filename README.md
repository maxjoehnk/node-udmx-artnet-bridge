# uDMX Artnet Bridge
A Node.JS based bridge from uDMX to an Artnet Universe.

# Usage
```bash
npm i -g udmx-artnet-bridge
udmx-artnet-bridge
```

# Configuration
You can configure udmx-artnet-bridge with a toml, yaml or json file.
Just specify the path via the `--config` flag.

```javascript
{
    timeout: 1000, // specifies the interval in which we try to connect to the udmx device
    udmx: {
        vendorId: 0x16c0,
        deviceId: 0x5dc
    },
    artnet: {
        port: 6454,
        universe: 0
    }
}
```