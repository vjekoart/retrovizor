import { ImageManager } from "./image-manager.service.js";

describe( "ImageManager suite", () =>
{
    it( "constructor", () =>
    {
        const canvas   = document.createElement( "canvas" );
        const instance = new ImageManager( canvas );

        expect( instance instanceof ImageManager ).toBe( true );        
    } );
} );
