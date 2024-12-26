import { CloseYourEyes } from "./close-your-eyes.service.js";

describe( "CloseYourEyes suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new CloseYourEyes();

        expect( instance instanceof CloseYourEyes ).toBe( true );        
    } );
} );
