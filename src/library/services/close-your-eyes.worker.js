import { ImageManager }          from "Library/services/image-manager.service.js";
import { getRandomFromInterval } from "Library/utilities.js";

self.onmessage = async ev =>
{
    if ( ev.data?.action === "start" )
    {
        try
        {
            const content = await generate( ev.data.options );

            self.postMessage({ action : "end", content });
        }
        catch ( error )
        {
            self.postMessage({ action : "error", error });
        }
    }
}

function generate ( options )
{
    const
    {
        frameCount,
        lineOpacityIncrease,
        maxDotOpacity,
        minDotOpacity,
        maxLineLength,
        noiseColor,
        pixelCountX,
        pixelCountY,
        pixelCount
    } = options;

    const backgrounds    = [];
    const imaginaryLines = [];

    const imageManager   = new ImageManager
    ({
        colors :
        {
            noise : noiseColor
        },
        dot :
        {
            opacity :
            {
                max : maxDotOpacity,
                min : minDotOpacity
            }
        },
        lineOpacityIncrease : lineOpacityIncrease
    });

    for ( let i = 0; i < frameCount; ++i )
    {
        const coverage   = getRandomFromInterval( 5 , 10  );
        const maxStep    = getRandomFromInterval( 80, 120 );
        const background = imageManager.generateDistortedArray( pixelCount, coverage, maxStep );

        backgrounds.push( background );
    }

    for ( const background of backgrounds )
    {
        const imaginaryLine = imageManager.generateImaginaryLine
        (
            background,
            pixelCountX,
            pixelCountY,
            maxLineLength
        )

        imaginaryLines.push( imaginaryLine );
    }

    return { backgrounds, imaginaryLines }
}
