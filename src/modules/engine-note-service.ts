export type EngineNote = {
  id: string;
  name: string;
  legend: string;
};

export type EngineNoteService = {
  all: () => EngineNote[];
  push: (note: EngineNote) => void;
  find: (predicate: (note: EngineNote) => boolean) => EngineNote | undefined;
  findIndex: (predicate: (note: EngineNote) => boolean) => number;
  removeWhere: (predicate: (note: EngineNote) => boolean) => void;
  splice: (start: number, deleteCount?: number) => EngineNote[];
};

export function createGlobalNoteService(): EngineNoteService {
  return {
    all: () => notes,
    push: (note) => {
      notes.push(note);
    },
    find: (predicate) => notes.find(predicate),
    findIndex: (predicate) => notes.findIndex(predicate),
    removeWhere: (predicate) => {
      notes = notes.filter((note) => !predicate(note));
    },
    splice: (start, deleteCount) => notes.splice(start, deleteCount),
  };
}
