export class PriorityQueue<T> {
  private readonly items: T[] = [];
  private readonly priorities: number[] = [];

  get length(): number {
    return this.items.length;
  }

  push(item: T, priority: number): void {
    this.items.push(item);
    this.priorities.push(priority);
    this.bubbleUp(this.items.length - 1);
  }

  peekPriority(): number {
    return this.priorities[0];
  }

  pop(): T {
    const first = this.items[0];
    const last = this.items.pop() as T;
    const lastPriority = this.priorities.pop() as number;

    if (this.items.length) {
      this.items[0] = last;
      this.priorities[0] = lastPriority;
      this.sinkDown(0);
    }

    return first;
  }

  private bubbleUp(index: number): void {
    const item = this.items[index];
    const priority = this.priorities[index];

    while (index > 0) {
      const parentIndex = (index - 1) >> 1;
      const parentPriority = this.priorities[parentIndex];
      if (priority >= parentPriority) break;

      this.items[index] = this.items[parentIndex];
      this.priorities[index] = parentPriority;
      index = parentIndex;
    }

    this.items[index] = item;
    this.priorities[index] = priority;
  }

  private sinkDown(index: number): void {
    const item = this.items[index];
    const priority = this.priorities[index];
    const length = this.items.length;

    while (true) {
      const leftIndex = index * 2 + 1;
      const rightIndex = leftIndex + 1;
      let swapIndex = -1;
      let swapPriority = priority;

      if (leftIndex < length && this.priorities[leftIndex] < swapPriority) {
        swapIndex = leftIndex;
        swapPriority = this.priorities[leftIndex];
      }

      if (rightIndex < length && this.priorities[rightIndex] < swapPriority) {
        swapIndex = rightIndex;
      }

      if (swapIndex === -1) break;

      this.items[index] = this.items[swapIndex];
      this.priorities[index] = this.priorities[swapIndex];
      index = swapIndex;
    }

    this.items[index] = item;
    this.priorities[index] = priority;
  }
}
