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

export type EngineNoteStorageAdapter = {
  getNotes: () => EngineNote[];
  setNotes: (nextNotes: EngineNote[]) => void;
};

export function createGlobalNoteStorageAdapter(): EngineNoteStorageAdapter {
  return {
    getNotes: () => notes,
    setNotes: (nextNotes) => {
      notes = nextNotes;
    },
  };
}

export function createNoteService(
  storageAdapter: EngineNoteStorageAdapter,
): EngineNoteService {
  return {
    all: () => storageAdapter.getNotes(),
    push: (note) => {
      storageAdapter.getNotes().push(note);
    },
    find: (predicate) => storageAdapter.getNotes().find(predicate),
    findIndex: (predicate) => storageAdapter.getNotes().findIndex(predicate),
    removeWhere: (predicate) => {
      storageAdapter.setNotes(
        storageAdapter.getNotes().filter((note) => !predicate(note)),
      );
    },
    splice: (start, deleteCount) =>
      storageAdapter.getNotes().splice(start, deleteCount),
  };
}

export function createGlobalNoteService(): EngineNoteService {
  return createNoteService(createGlobalNoteStorageAdapter());
}
