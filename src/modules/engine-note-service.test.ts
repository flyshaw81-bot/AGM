import { afterEach, describe, expect, it } from "vitest";
import { createGlobalNoteService } from "./engine-note-service";

const originalNotes = globalThis.notes;

describe("createGlobalNoteService", () => {
  afterEach(() => {
    globalThis.notes = originalNotes;
  });

  it("reads and mutates the current global notes collection behind the adapter", () => {
    globalThis.notes = [
      { id: "a", name: "A", legend: "Alpha" },
      { id: "b", name: "B", legend: "Beta" },
    ];

    const noteService = createGlobalNoteService();

    expect(noteService.all()).toBe(globalThis.notes);
    expect(noteService.find((note) => note.id === "b")).toEqual({
      id: "b",
      name: "B",
      legend: "Beta",
    });
    expect(noteService.findIndex((note) => note.id === "a")).toBe(0);

    noteService.push({ id: "c", name: "C", legend: "Gamma" });
    expect(globalThis.notes.map((note) => note.id)).toEqual(["a", "b", "c"]);

    noteService.removeWhere((note) => note.id === "b");
    expect(globalThis.notes.map((note) => note.id)).toEqual(["a", "c"]);

    expect(noteService.splice(0, 1)).toEqual([
      { id: "a", name: "A", legend: "Alpha" },
    ]);
    expect(globalThis.notes.map((note) => note.id)).toEqual(["c"]);
  });
});
