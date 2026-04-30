type NativeRelationshipButtonDataset = Partial<
  Record<
    | "burgCulture"
    | "burgName"
    | "burgPopulation"
    | "burgState"
    | "burgType"
    | "provinceBurg"
    | "provinceColor"
    | "provinceFullName"
    | "provinceName"
    | "provinceState"
    | "provinceType"
    | "stateCapital"
    | "stateColor"
    | "stateCulture"
    | "stateForm"
    | "stateFormName"
    | "stateFullName"
    | "stateName"
    | "statePopulation"
    | "stateRural"
    | "stateUrban",
    string
  >
>;

export type NativeRelationshipButtonPayload =
  | {
      entity: "state";
      next: {
        capital?: number;
        color?: string;
        culture?: number;
        form?: string;
        formName: string;
        fullName: string;
        name: string;
        population?: number;
        rural?: number;
        urban?: number;
      };
    }
  | {
      entity: "burg";
      next: {
        culture?: number;
        name: string;
        population?: number;
        state?: number;
        type?: string;
      };
    }
  | {
      entity: "province";
      next: {
        burg?: number;
        color?: string;
        fullName?: string;
        name: string;
        state?: number;
        type?: string;
      };
    };

function optionalDatasetNumber(value: string | undefined) {
  return value ? Number(value) : undefined;
}

function requiredDatasetNumber(value: string | undefined) {
  return Number(value || Number.NaN);
}

export function createNativeRelationshipButtonPayload(
  dataset: NativeRelationshipButtonDataset,
  entity: string,
): NativeRelationshipButtonPayload | null {
  if (entity === "state") {
    return {
      entity,
      next: {
        capital: optionalDatasetNumber(dataset.stateCapital),
        color: dataset.stateColor || "",
        culture: optionalDatasetNumber(dataset.stateCulture),
        form: dataset.stateForm || "",
        formName: dataset.stateFormName || "",
        fullName: dataset.stateFullName || "",
        name: dataset.stateName || "",
        population: requiredDatasetNumber(dataset.statePopulation),
        rural: requiredDatasetNumber(dataset.stateRural),
        urban: requiredDatasetNumber(dataset.stateUrban),
      },
    };
  }

  if (entity === "burg") {
    return {
      entity,
      next: {
        culture: optionalDatasetNumber(dataset.burgCulture),
        name: dataset.burgName || "",
        population: requiredDatasetNumber(dataset.burgPopulation),
        state: optionalDatasetNumber(dataset.burgState),
        type: dataset.burgType || "",
      },
    };
  }

  if (entity === "province") {
    return {
      entity,
      next: {
        burg: optionalDatasetNumber(dataset.provinceBurg),
        color: dataset.provinceColor || "",
        fullName: dataset.provinceFullName || "",
        name: dataset.provinceName || "",
        state: optionalDatasetNumber(dataset.provinceState),
        type: dataset.provinceType || "",
      },
    };
  }

  return null;
}
