import { CloseYourEyes } from "./services/close-your-eyes.service.js";
import { Utilities     } from "./utilities.js";

import { RetroFooter } from "./components/retro-footer.js";

customElements.define( "retro-footer", RetroFooter );

export
{
    CloseYourEyes,
    Utilities
};
