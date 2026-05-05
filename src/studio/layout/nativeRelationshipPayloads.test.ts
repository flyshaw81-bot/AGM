import { describe, expect, it } from "vitest";
import {
  createDirectRelationshipButtonPayload,
  createNativeRelationshipButtonPayload,
} from "./nativeRelationshipPayloads";

describe("direct relationship payloads", () => {
  it("creates state payloads from repair button datasets", () => {
    expect(
      createDirectRelationshipButtonPayload(
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
      createDirectRelationshipButtonPayload(
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
      createDirectRelationshipButtonPayload(
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
    expect(createDirectRelationshipButtonPayload({}, "culture")).toBeNull();
  });

  it("keeps the previous relationship payload helper as a compatibility alias", () => {
    expect(
      createNativeRelationshipButtonPayload(
        { stateName: "Northwatch" },
        "state",
      ),
    ).toMatchObject({
      entity: "state",
      next: { name: "Northwatch" },
    });
  });
});
