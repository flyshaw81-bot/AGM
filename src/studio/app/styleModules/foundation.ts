import { foundationAppChromeStyles } from "./foundationAppChrome";
import { foundationBrandThemeStyles } from "./foundationBrandTheme";
import { foundationControlsStyles } from "./foundationControls";
import { foundationEnvironmentStyles } from "./foundationEnvironment";
import { foundationTopbarFieldsStyles } from "./foundationTopbarFields";

export const foundationStyles =
  foundationEnvironmentStyles +
  foundationAppChromeStyles +
  foundationTopbarFieldsStyles +
  foundationBrandThemeStyles +
  foundationControlsStyles;
