import { CloseYourEyes   } from "./services/close-your-eyes.service.js";
import { ImageDegradator } from "./services/image-degradator.service.js";
import { Utilities       } from "./utilities.js";

import { RetroContentBlock } from "./components/retro-content-block.js";
import { RetroFooter       } from "./components/retro-footer.js";
import { RetroNav          } from "./components/retro-nav.js";
import { RetroTitle        } from "./components/retro-title.js";

customElements.define( "retro-content-block", RetroContentBlock );
customElements.define( "retro-footer",        RetroFooter       );
customElements.define( "retro-nav",           RetroNav          );
customElements.define( "retro-title",         RetroTitle        );

export
{
    CloseYourEyes,
    ImageDegradator,
    Utilities
};
