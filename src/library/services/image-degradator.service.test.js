import { ImageDegradator } from "./image-degradator.service.js";

describe( "ImageDegradator suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new ImageDegradator();

        expect( instance instanceof ImageDegradator ).toBe( true );        
    });
});
