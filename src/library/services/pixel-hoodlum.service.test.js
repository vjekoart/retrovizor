import { PixelHoodlum } from "./pixel-hoodlum.service.js";

describe( "PixelHoodlum suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new PixelHoodlum();

        expect( instance instanceof PixelHoodlum ).toBe( true );        
    } );
} );
