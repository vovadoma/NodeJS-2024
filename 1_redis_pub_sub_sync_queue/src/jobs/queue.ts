export type Task = Record<string, any>;
export type CallbackFinish = (err: Error | null, task: Task) => void;
export type CallbackSuccess = (res?: Task) => void;
export type CallbackFailure = (err: Error, res: Task) => void;
export type CallbackDone = (err: Error | null, res: Task) => void;
export type CallbackProgress = (task: Task, finish: CallbackFinish) => void;
export type CallbackDrain = (lastDone: number) => void;
export type TaskItem = { task: Task, start: number };

export default class Queue {

  concurrency: number;

  count: number;

  lastCount: number;

  waiting: TaskItem[];

  onProcess: CallbackProgress = async () => { return; };

  onDone: CallbackDone | null;

  onSuccess: CallbackSuccess | null;

  onFailure: CallbackFailure | null;

  onDrain: CallbackDrain | null;

  constructor (concurrency: number) {
    this.concurrency = concurrency;
    this.count = 0;
    this.lastCount = 0;
    this.waiting = [];
    this.onDone = null;
    this.onSuccess = null;
    this.onFailure = null;
    this.onDrain = null;
  }

  static channels (concurrency: number): Queue {
    return new Queue(concurrency);
  }

  add (task: Task) {
    const hasChannel = this.count < this.concurrency;
    if (hasChannel) {
      this.next(task);
      return;
    }
    this.waiting.push({ task, start: Date.now() });
  }

  next (task: Task) {
    this.count++;
    let finished = false;
    const { onProcess } = this;
    const finish: CallbackFinish = (err, res) => {
      if (finished) return;
      finished = true;
      this.count--;
      this.lastCount++;
      this.finish(err, res);
      if (this.waiting.length > 0) this.takeNext();
    };
    if (onProcess) onProcess(task, finish);
  }

  takeNext () {
    const { task } = this.waiting.shift() as TaskItem;
    this.next(task);
    return;
  }

  finish (err: Error | null, res: Task) {
    const { onFailure, onSuccess, onDone, onDrain } = this;
    if (err) {
      if (onFailure) onFailure(err, res);
    } else if (onSuccess) {
      onSuccess(res);
    }
    if (onDone) onDone(err, res);
    const currentTasksCount = this.count + this.waiting.length;
    if (currentTasksCount === 0 && onDrain) onDrain(this.lastCount);
  }

  process (listener: CallbackProgress) {
    this.onProcess = listener;
    return this;
  }

  done (listener: CallbackDone) {
    this.onDone = listener;
    return this;
  }

  success (listener: CallbackSuccess) {
    this.onSuccess = listener;
    return this;
  }

  failure (listener: CallbackFailure) {
    this.onFailure = listener;
    return this;
  }

  drain (listener: CallbackDrain) {
    this.onDrain = listener;
    return this;
  }

}
