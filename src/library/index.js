import * as Configuration from "Library/configuration.js";

import { CloseYourEyes   } from "Library/services/close-your-eyes.service.js";
import { ImageDegradator } from "Library/services/image-degradator.service.js";

import
{
    formatCodeBlocks
} from "Library/utilities.js";

import { RetroContentBlock } from "Library/components/retro-content-block.js";
import { RetroFooter       } from "Library/components/retro-footer.js";
import { RetroNav          } from "Library/components/retro-nav.js";
import { RetroTitle        } from "Library/components/retro-title.js";

customElements.define( "retro-content-block", RetroContentBlock );
customElements.define( "retro-footer",        RetroFooter       );
customElements.define( "retro-nav",           RetroNav          );
customElements.define( "retro-title",         RetroTitle        );

export
{
    Configuration,

    // Services
    CloseYourEyes,
    ImageDegradator,

    // Utilities
    formatCodeBlocks
};
