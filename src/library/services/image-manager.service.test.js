import { ImageManager } from "./image-manager.service.js";

describe( "ImageManager suite", () =>
{
    it( "constructor", () =>
    {
        const instance = new ImageManager();

        expect( instance instanceof ImageManager ).toBe( true );        
    });
});
