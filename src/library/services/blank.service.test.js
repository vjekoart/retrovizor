import { Blank } from "./blank.service.js";

describe( "Blank suite", () =>
{
    it( "constructor", () =>
    {
        const canvas   = document.createElement( "canvas" );
        const instance = new Blank( canvas );

        expect( instance instanceof Blank ).toBe( true );        
    });
});
