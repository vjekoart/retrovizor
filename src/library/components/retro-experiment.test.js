import { renderComponent, waitFor } from "../test.utilities.js";
import { RetroExperiment   } from "./retro-experiment.js";

describe( "RetroExperiment", () =>
{
    beforeAll(() =>
    {
        customElements.define( "retro-experiment", RetroExperiment );
    });

    it( "renders: default", async () =>
    {
        const element = await renderComponent( "retro-experiment", "<retro-experiment></retro-experiment>" );

        element.controls      = { "start" : "Start the experiment" }
        element.configuration =
        [
            {
                key     : "color",
                type    : "text",
                label   : "Color",
                value   : "#FFFFFF"
            }, {
                key     : "scaleDownFactor",
                type    : "range",
                options : { min : 2, max : 128 },
                label   : "Factor",
                value   : 48
            }
        ];

        await waitFor( 1000 );

        expect( element.shadowRoot.innerHTML ).toContain( "Start the experiment" );
        expect( element.shadowRoot.innerHTML ).toContain( "Color"                );
        expect( element.shadowRoot.innerHTML ).toContain( "Factor"               );
    });
});
