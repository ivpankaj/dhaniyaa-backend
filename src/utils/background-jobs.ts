import { EventEmitter } from 'events';

// Define the shape of a job
export interface Job<T = any> {
    id: string;
    type: string;
    payload: T;
    execute: (payload: T) => Promise<void>;
    attempts: number;
}

class BackgroundJobManager extends EventEmitter {
    private queue: Job[] = [];
    private isProcessing = false;
    private maxRetries = 3;

    constructor() {
        super();
        // Start processing loop if needed, but we'll use event-driven for simplicity first
        this.on('job_added', () => this.processNext());
    }

    public add<T>(type: string, payload: T, execute: (payload: T) => Promise<void>) {
        const job: Job<T> = {
            id: Math.random().toString(36).substring(7),
            type,
            payload,
            execute,
            attempts: 0
        };
        this.queue.push(job);
        console.log(`[JobQueue] Job added: ${type} (${job.id})`);
        this.emit('job_added');
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const job = this.queue.shift();

        if (job) {
            try {
                console.log(`[JobQueue] Processing job: ${job.type} (${job.id})`);
                await job.execute(job.payload);
                console.log(`[JobQueue] Job completed: ${job.type} (${job.id})`);
            } catch (error) {
                console.error(`[JobQueue] Job failed: ${job.type} (${job.id})`, error);
                job.attempts++;
                if (job.attempts < this.maxRetries) {
                    console.log(`[JobQueue] Retrying job: ${job.type} (${job.id}) attempt ${job.attempts + 1}`);
                    this.queue.push(job); // Re-queue
                } else {
                    console.error(`[JobQueue] Job failed permanently: ${job.type} (${job.id})`);
                    // Could store in a dead-letter queue (DB) here
                }
            } finally {
                this.isProcessing = false;
                // Check for more jobs
                if (this.queue.length > 0) {
                    this.emit('job_added');
                }
            }
        } else {
            this.isProcessing = false;
        }
    }
}

export const backgroundJobManager = new BackgroundJobManager();
