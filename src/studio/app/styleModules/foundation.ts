import { foundationAppChromeStyles } from "./foundationAppChrome";
import { foundationBrandThemeStyles } from "./foundationBrandTheme";
import { foundationControlsStyles } from "./foundationControls";
import { foundationEnvironmentStyles } from "./foundationEnvironment";
import { foundationTopbarFieldsStyles } from "./foundationTopbarFields";

export const foundationStyles =
  `@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0");\n` +
  foundationEnvironmentStyles +
  foundationAppChromeStyles +
  foundationTopbarFieldsStyles +
  foundationBrandThemeStyles +
  foundationControlsStyles;
