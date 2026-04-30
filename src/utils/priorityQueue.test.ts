import { describe, expect, it } from "vitest";
import { PriorityQueue } from "./priorityQueue";

describe("PriorityQueue", () => {
  it("pops lower priorities first", () => {
    const queue = new PriorityQueue<string>();

    queue.push("slow", 30);
    queue.push("fast", 10);
    queue.push("middle", 20);

    expect(queue.length).toBe(3);
    expect(queue.peekPriority()).toBe(10);
    expect(queue.pop()).toBe("fast");
    expect(queue.pop()).toBe("middle");
    expect(queue.pop()).toBe("slow");
    expect(queue.length).toBe(0);
  });

  it("preserves all values with duplicate priorities", () => {
    const queue = new PriorityQueue<number>();

    queue.push(1, 10);
    queue.push(2, 10);
    queue.push(3, 5);

    expect(queue.pop()).toBe(3);
    expect([queue.pop(), queue.pop()].sort()).toEqual([1, 2]);
  });
});
