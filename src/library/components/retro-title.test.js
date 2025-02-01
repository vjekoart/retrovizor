import { renderComponent } from "../test.utilities.js";
import { RetroTitle      } from "./retro-title.js";

describe( "RetroTitle", () =>
{
    beforeAll(() =>
    {
        customElements.define( "retro-title", RetroTitle );
    });

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-title", "<retro-title></retro-title>" );
        const value          = shadowRoot.innerHTML.includes( "trov" );

        expect( value ).toBeTruthy();
    });
});
