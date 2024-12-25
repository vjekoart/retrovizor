import { Utilities } from "./utilities.js";

describe( "Utilities suite", () =>
{
    it( "dummyUtility: dummy test", () =>
    {
        expect( Utilities.dummyUtility( 2, 3 )  ).toBe( 5 );
    } );
} );
