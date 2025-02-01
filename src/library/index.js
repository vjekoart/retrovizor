import * as Configuration from "Library/configuration.js";

import { Blank      } from "Library/services/blank.service.js";
import { Degradator } from "Library/services/degradator.service.js";

import
{
    formatCodeBlocks
} from "Library/utilities.js";

import { RetroContentBlock } from "Library/components/retro-content-block.js";
import { RetroExperiment   } from "Library/components/retro-experiment.js";
import { RetroFooter       } from "Library/components/retro-footer.js";
import { RetroNav          } from "Library/components/retro-nav.js";
import { RetroTitle        } from "Library/components/retro-title.js";

function initialize ()
{
    customElements.define( "retro-content-block", RetroContentBlock );
    customElements.define( "retro-experiment"   , RetroExperiment   );
    customElements.define( "retro-footer"       , RetroFooter       );
    customElements.define( "retro-nav"          , RetroNav          );
    customElements.define( "retro-title"        , RetroTitle        );
}

export
{
    Configuration,

    /* Services */
    Blank,
    Degradator,

    /* Utilities */
    formatCodeBlocks,

    initialize
}
