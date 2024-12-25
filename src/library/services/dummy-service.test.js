import { DummyService } from "./dummy-service.js";

describe( "DummyService suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new DummyService();

        expect( instance instanceof DummyService ).toBe( true );        
    } );
} );
