import { CloseYourEyes } from "./close-your-eyes.service.js";

describe( "CloseYourEyes suite", () =>
{
    it( "constructor", () =>
    {
        const canvas   = document.createElement( "canvas" );
        const instance = new CloseYourEyes( canvas );

        expect( instance instanceof CloseYourEyes ).toBe( true );        
    } );
} );
