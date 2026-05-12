import type { EngineGenerationSessionRequest } from "../modules/engine-generation-session-services";
import type { EngineRuntimeContext } from "../modules/engine-runtime-context";
import type { NameBase } from "../modules/names-generator";
import type { Selection } from "../utils/svgSelection";
import type { PackedGraph } from "./PackedGraph";

declare global {
  /**
   * Test and fixture compile aliases for historical engine containers.
   * Product code must use EngineRuntimeContext or engine-browser-runtime-globals.
   */
  var seed: string;
  var pack: PackedGraph;
  var grid: any;
  var options: any;

  var graphHeight: number;
  var graphWidth: number;
  var TIME: boolean;
  var WARN: boolean;
  var ERROR: boolean;
  var DEBUG: { stateLabels?: boolean; [key: string]: boolean | undefined };
  var mapHistory: Array<{ seed?: string; [key: string]: unknown }>;
  var aleaPRNG: (seed: string) => () => number;

  var heightmapTemplates: any;
  var Routes: any;
  var populationRate: number;
  var urbanDensity: number;
  var urbanization: number;
  var distanceScale: number;
  var heightExponent: number;
  var temperatureScale: string;
  var heightUnit: string;
  var distanceUnit: string;
  var precipitationPercent: number;
  var mapSizePercent: number;
  var latitudePercent: number;
  var longitudePercent: number;
  var nameBases: NameBase[];

  var pointsInput: HTMLInputElement;
  var culturesInput: HTMLInputElement;
  var culturesSet: HTMLSelectElement;
  var mapName: HTMLInputElement;
  var religionsNumber: HTMLInputElement;

  var rivers: Selection<SVGElement, unknown, null, undefined>;
  var prec: Selection<SVGGElement, unknown, null, undefined>;
  var oceanLayers: Selection<SVGGElement, unknown, null, undefined>;
  var emblems: Selection<SVGElement, unknown, null, undefined>;
  var svg: Selection<SVGSVGElement, unknown, null, undefined>;
  var ice: Selection<SVGGElement, unknown, null, undefined>;
  var labels: Selection<SVGGElement, unknown, null, undefined>;
  var burgLabels: Selection<SVGGElement, unknown, null, undefined>;
  var burgIcons: Selection<SVGGElement, unknown, null, undefined>;
  var anchors: Selection<SVGGElement, unknown, null, undefined>;
  var terrs: Selection<SVGGElement, unknown, null, undefined>;
  var temperature: Selection<SVGGElement, unknown, null, undefined>;
  var markers: Selection<SVGGElement, unknown, null, undefined>;
  var defs: Selection<SVGDefsElement, unknown, null, undefined>;
  var coastline: Selection<SVGGElement, unknown, null, undefined>;
  var lakes: Selection<SVGGElement, unknown, null, undefined>;
  var provs: Selection<SVGGElement, unknown, null, undefined>;
  var getColorScheme: (scheme: string | null) => (t: number) => string;
  var getColor: (height: number, scheme: (t: number) => string) => string;
  var svgWidth: number;
  var svgHeight: number;
  var viewbox: Selection<SVGElement, unknown, null, undefined>;
  var routes: Selection<SVGElement, unknown, null, undefined>;
  var biomesData: {
    i: number[];
    name: string[];
    color: string[];
    biomesMatrix: Uint8Array[];
    habitability: number[];
    iconsDensity: number[];
    icons: string[][];
    cost: number[];
  };
  var notes: any[];
  var style: {
    burgLabels: { [key: string]: { [key: string]: string } };
    burgIcons: { [key: string]: { [key: string]: string } };
    anchors: { [key: string]: { [key: string]: string } };
    [key: string]: any;
  };

  var layerIsOn: (layerId: string) => boolean;
  var drawRoute: (route: any) => void;
  var invokeActiveZooming: () => void;
  var setSeed: (precreatedSeed?: string) => string;
  var generate: (
    options?: EngineGenerationSessionRequest,
  ) => Promise<EngineRuntimeContext | undefined>;
  var applyGraphSize: () => void;
  var randomizeOptions: () => void;
  var parseError: (error: Error) => string;
  var clearMainTip: () => void;
  var cleanupData: () => void;
  var regenerateMap: (options?: unknown) => void;
  var tip: (
    message: string,
    autoHide?: boolean,
    type?: "info" | "warn" | "error" | "success",
    timeout?: number,
  ) => void;
  var locked: (settingId: string) => boolean;
  var unlock: (settingId: string) => void;
  var scale: number;
  var changeFont: () => void;
  var getFriendlyHeight: (coords: [number, number]) => string;
  var addLakesInDeepDepressions: (lakeElevationLimit?: number) => void;
  var openNearSeaLakes: (heightmapTemplateId?: string) => void;
  var defineMapSize: (heightmapTemplateId?: string) => void;
  var calculateMapCoordinates: (settings?: {
    mapSizePercent?: number;
    latitudePercent?: number;
    longitudePercent?: number;
  }) => void;
  var calculateTemperatures: () => void;
  var generatePrecipitation: () => void;
  var reGraph: () => void;
  var createDefaultRuler: () => void;
  var showStatistics: (heightmapTemplateId?: string) => void;
  var setStudioViewportSize:
    | ((width: number, height: number) => void)
    | undefined;
  var studioViewportSync: (
    presetId: string,
    orientation: "landscape" | "portrait",
    fitMode: "contain" | "cover" | "actual-size",
  ) => void;
}
