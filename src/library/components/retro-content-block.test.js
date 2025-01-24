import { renderComponent   } from "../test.utilities.js";
import { RetroContentBlock } from "./retro-content-block.js";

describe( "RetroContentBlock", () =>
{
    beforeAll( () =>
    {
        customElements.define( "retro-content-block", RetroContentBlock );
    });

    it( "renders: default", async () =>
    {
        const { shadowRoot } = await renderComponent( "retro-content-block", "<retro-content-block></retro-content-block>" );

        expect( shadowRoot.innerHTML.includes( "Dummy title" ) ).toBeTruthy();
        expect( shadowRoot.innerHTML.includes( "1970-01-01"  ) ).toBeTruthy();
    });

    it( "renders: content", async () =>
    {
        const { shadowRoot } = await renderComponent(
            "retro-content-block",
            `
                <retro-content-block data-date="2025-01-01" data-href="/custom-url/">
                    <span slot="title">Article title</span>
                    <span slot="excerpt">A custom excerpt provided as slot.</span>
                </retro-content-block>
            `
        );

        const slotTitle   = shadowRoot.querySelector( "slot[name=\"title\"]"   );
        const slotExcerpt = shadowRoot.querySelector( "slot[name=\"excerpt\"]" );

        expect( slotTitle  .assignedNodes()[ 0 ].innerText ).toBe( "Article title"                      );
        expect( slotExcerpt.assignedNodes()[ 0 ].innerText ).toBe( "A custom excerpt provided as slot." );

        expect( shadowRoot.innerHTML.includes( "/custom-url/" ) ).toBeTruthy();
        expect( shadowRoot.innerHTML.includes( "2025-01-01"   ) ).toBeTruthy();
    });
});
