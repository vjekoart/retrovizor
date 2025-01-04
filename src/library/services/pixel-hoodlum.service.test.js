import { PixelHoodlum } from "./pixel-hoodlum.service.js";

describe( "PixelHoodlum suite", () =>
{
    it( "constructor", () =>
    {
        const canvas   = document.createElement( "canvas" );
        const instance = new PixelHoodlum( canvas );

        expect( instance instanceof PixelHoodlum ).toBe( true );        
    } );
} );
