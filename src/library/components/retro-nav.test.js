import { renderComponent } from "../test.utilities.js";
import { RetroNav        } from "./retro-nav.js";

describe( "RetroNav", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-nav", RetroNav );
    } );

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-nav", "<retro-nav></retro-nav>" );
        const value = shadowRoot.innerHTML.includes( "retrovizor" );
        expect( value ).toBeTruthy();
    } );
} );
