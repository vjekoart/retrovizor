import { renderComponent } from "../test.utilities.js";
import { RetroFooter     } from "./retro-footer.js";

describe( "RetroFooter", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-footer", RetroFooter );
    });

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-footer", "<retro-footer></retro-footer>" );
        const value          = shadowRoot.innerHTML.includes( "retrovizor" );

        expect( value ).toBeTruthy();
    });
});
