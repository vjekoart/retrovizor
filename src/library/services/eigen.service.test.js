import { Eigen } from "./eigen.service.js";

describe( "Eigen suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new Eigen();

        expect( instance instanceof Eigen ).toBe( true );        
    });

    it( "getAveragePixelColor", () =>
    {
        const pixels =
        [
            { r : 250, g : 250, b : 250 },
            { r : 200, g : 200, b : 200 },
            { r : 150, g : 100, b :  50 }
        ];

        const result = Eigen.getAveragePixelColor( pixels );

        expect( result ).toEqual({ r : 200, g : 183, b : 167 });
    });

    it( "getDegradedColor", () =>
    {
        const result = Eigen.getDegradedColor( { h : 100, s : 200, l : 200 }, 150 );

        expect( result.r ).toBeGreaterThanOrEqual( 0 );
        expect( result.g ).toBeGreaterThanOrEqual( 0 );
        expect( result.b ).toBeGreaterThanOrEqual( 0 );

        expect( result.r ).toBeLessThanOrEqual( 255 );
        expect( result.g ).toBeLessThanOrEqual( 255 );
        expect( result.b ).toBeLessThanOrEqual( 255 );
    });

    it( "getHSLFromRGB", () =>
    {
        const result = Eigen.getHSLFromRGB({ r : 22, g : 22, b : 29 });

        expect( result ).toEqual({ h : 240, s : 35, l : 26 });
    });

    it( "getRGBFromHSL", () =>
    {
        const result = Eigen.getRGBFromHSL({ h : 240, s : 35, l : 25 });

        expect( result ).toEqual({ r : 22, g : 22, b : 28 });
    });
});
