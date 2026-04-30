import {
  createGlobalStudioBootstrapTargets,
  startStudioApp,
} from "./studioBootstrap";
import { createStudioRenderer } from "./studioRenderer";

startStudioApp(createGlobalStudioBootstrapTargets(createStudioRenderer()));
