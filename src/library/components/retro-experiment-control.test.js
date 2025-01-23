import { renderComponent, waitFor } from "../test.utilities.js";
import { RetroExperimentControl } from "./retro-experiment-control.js";

describe( "RetroExperimentControl", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-experiment-control", RetroExperimentControl );
    } );

    it( "renders: default", async () =>
    {
        const element = await renderComponent( "retro-experiment-control", "<retro-experiment-control></retro-experiment-control>" );

        element.controls = { "start" : "Start the experiment" }
        element.options  =
        [
            {
                key     : "scaleDownFactor",
                type    : "range",
                options : { min : 2, max : 128 },
                label   : "Factor",
                value   : 48
            }
        ];

        await waitFor( 1000 );

        expect( element.shadowRoot.innerHTML ).toContain( "Start the experiment" );
        expect( element.shadowRoot.innerHTML ).toContain( "Factor"               );
    } );
} );

