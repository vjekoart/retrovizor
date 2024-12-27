import { renderComponent } from "../test.utilities.js";
import { RetroFooter     } from "./retro-footer.js";

describe( "RetroFooter", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-footer", RetroFooter );
    } );

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-footer", "<retro-footer></retro-footer>" );
        const value = shadowRoot.innerHTML.includes( "Default dummyValue!" );
        expect( value ).toBeTruthy();
    } );
    it( "renders: data-dummy-value", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-footer", "<retro-footer data-dummy-value=\"Test\"></retro-footer>" );
        const value = shadowRoot.innerHTML.includes( "Test" );
        expect( value ).toBeTruthy();
    } );
} );
