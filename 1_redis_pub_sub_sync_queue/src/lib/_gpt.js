class AsyncQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    async enqueue(job) {
        this.queue.push(job);
        if (!this.running) {
            await this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.running = false;
            return;
        }

        this.running = true;
        const job = this.queue.shift();

        try {
            await job();
        } catch (error) {
            console.error('Error processing job:', error);
        }

        await this.processQueue();
    }
}

// Пример использования
const asyncQueue = new AsyncQueue();

function asyncJob(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Job ${id} is done.`);
            resolve();
        }, 1000);
    });
}

let n = 0;
async function runAsyncJobs() {
    for (let i = n; i < (n + 5); i++) {
        await asyncQueue.enqueue(() => asyncJob(i));
    }
    n = n + 5;
}

runAsyncJobs();

setTimeout(runAsyncJobs, 3000);

setTimeout(runAsyncJobs, 5000);

setTimeout(runAsyncJobs, 10000);
