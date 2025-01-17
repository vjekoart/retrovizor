import { CanvasManager } from "./canvas-manager.service.js";

describe( "CanvasManager suite", () =>
{
    it( "constructor", () =>
    {
        const canvas   = document.createElement( "canvas" );
        const instance = new CanvasManager( canvas );

        expect( instance instanceof CanvasManager ).toBe( true );        
    } );
} );
