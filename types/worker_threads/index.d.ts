declare module 'worker_threads' {
    import EventEmitter = NodeJS.EventEmitter;
    export const isMainThread: boolean;
    export const parentPort: null | MessagePort;
    export const workerData: any;

    export class Worker {
        constructor(filename: string, options?: WorkerOptions);

        postMessage(value: any, transferList?: Object[]): void;
    }

    export interface WorkerOptions {
        eval?: boolean;
        workerData?: any;
        stdin?: boolean;
        stdout?: boolean;
        stderr?: boolean;
    }

    export interface MessagePort extends EventEmitter {
        close(): void;

        postMessage(value: any, transferList?: Object[]): void;

        ref(): void;

        unref(): void;

        start(): void;

        on(event: 'message', listener: (value: any) => void): this;

        once(event: 'message', listener: (value: any) => void): this;

        on(event: 'close', listener: () => void): this;

        once(event: 'close', listener: () => void): this;
    }
}
