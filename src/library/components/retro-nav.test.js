import { renderComponent } from "../test.utilities.js";
import { RetroNav        } from "./retro-nav.js";

describe( "RetroNav", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-nav", RetroNav );
    });

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-nav", "<retro-nav></retro-nav>" );

        expect( shadowRoot.innerHTML.includes( "Home" ) ).toBeTruthy();
        expect( shadowRoot.innerHTML.includes( "Code" ) ).toBeTruthy();
        expect( shadowRoot.innerHTML.includes( "Text" ) ).toBeTruthy();
        expect( shadowRoot.innerHTML.includes( "User" ) ).toBeTruthy();
    });
});
