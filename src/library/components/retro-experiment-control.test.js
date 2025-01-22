import { renderComponent        } from "../test.utilities.js";
import { RetroExperimentControl } from "./retro-experiment-control.js";

describe( "RetroExperimentControl", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-experiment-control", RetroExperimentControl );
    } );

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-experiment-control", "<retro-experiment-control></retro-experiment-control>" );
        const value = shadowRoot.innerHTML.includes( "Retrovizor" );
        expect( value ).toBeTruthy();
    } );
} );
