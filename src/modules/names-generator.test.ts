import { describe, expect, it } from "vitest";
import { NamesGenerator } from "./names-generator";

describe("NamesGenerator", () => {
  it("can calculate Markov chains without browser globals", () => {
    const names = new NamesGenerator();

    const chain = names.calculateChain("Aldor,Berin,Cael");

    expect(chain[""]).toEqual(expect.arrayContaining(["al", "be", "cael"]));
    expect(chain.l.length).toBeGreaterThan(0);
  });

  it("routes validation errors through injected adapters", () => {
    const errors: string[] = [];
    const names = new NamesGenerator({
      logs: {
        warn: () => {},
        error: (message) => {
          errors.push(message);
        },
      },
    });

    expect(names.getBase(undefined as unknown as number)).toBe("ERROR");
    expect(errors).toEqual(["Please define a base"]);
  });
});
