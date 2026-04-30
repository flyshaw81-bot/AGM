import { describe, expect, it } from "vitest";
import { createNativeRelationshipButtonPayload } from "./nativeRelationshipPayloads";

describe("nativeRelationshipPayloads", () => {
  it("creates state payloads from repair button datasets", () => {
    expect(
      createNativeRelationshipButtonPayload(
        {
          stateCapital: "12",
          stateColor: "#112233",
          stateCulture: "4",
          stateForm: "Monarchy",
          stateFormName: "Kingdom",
          stateFullName: "Kingdom of Northwatch",
          stateName: "Northwatch",
          statePopulation: "12345",
          stateRural: "10000",
          stateUrban: "2345",
        },
        "state",
      ),
    ).toEqual({
      entity: "state",
      next: {
        capital: 12,
        color: "#112233",
        culture: 4,
        form: "Monarchy",
        formName: "Kingdom",
        fullName: "Kingdom of Northwatch",
        name: "Northwatch",
        population: 12345,
        rural: 10000,
        urban: 2345,
      },
    });
  });

  it("creates burg and province payloads with optional numeric references", () => {
    expect(
      createNativeRelationshipButtonPayload(
        {
          burgCulture: "8",
          burgName: "Grey Mill",
          burgPopulation: "700",
          burgState: "2",
          burgType: "Town",
        },
        "burg",
      ),
    ).toMatchObject({
      entity: "burg",
      next: { culture: 8, name: "Grey Mill", population: 700, state: 2 },
    });
    expect(
      createNativeRelationshipButtonPayload(
        {
          provinceBurg: "",
          provinceColor: "#445566",
          provinceName: "East Reach",
          provinceState: "3",
          provinceType: "March",
        },
        "province",
      ),
    ).toMatchObject({
      entity: "province",
      next: { burg: undefined, name: "East Reach", state: 3 },
    });
  });

  it("ignores unsupported entities", () => {
    expect(createNativeRelationshipButtonPayload({}, "culture")).toBeNull();
  });
});
