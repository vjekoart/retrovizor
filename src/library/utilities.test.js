import
{
    renderComponent,
    requestSelector
} from "./test.utilities.js";

import { formatCodeBlocks } from "./utilities.js";

describe( "Utilities suite", () =>
{
    it( "formatCodeBlocks", async () =>
    {
        const unformattedInput = `
    <pre>
        const x = 2;
        const y =
        {
            z: 3
        };</pre>
        `;

        const expectedOutput = `const x = 2;\nconst y =\n{\n    z: 3\n};`;

        void await renderComponent( "pre", unformattedInput );
        formatCodeBlocks();

        const element = await requestSelector( "pre" );

        expect( element.innerHTML ).toBe( expectedOutput );
    } );
} );
