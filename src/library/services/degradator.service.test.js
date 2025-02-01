import { Degradator } from "./degradator.service.js";

describe( "Degradator suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new Degradator();

        expect( instance instanceof Degradator ).toBe( true );        
    });
});
