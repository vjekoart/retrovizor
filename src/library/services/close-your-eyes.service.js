import { CanvasManager } from "Library/services/canvas-manager.service.js";
import { ImageManager }  from "Library/services/image-manager.service.js";

import { getRandomFromInterval } from "Library/utilities.js";

/**
 * CloseYourEyes - what we see when we close our eyes
 *
 * @What?
 * It's not going well with blurred stuff, and testing showed that it may not look so interesting.
 * 
 * It seems that good idea is to create a ImageManager function that will expand given background, e.g. bolden some lines
 * that follow white points in the background
 * 
 * Create cool effect by building on broken distorted pixels that create some kind of hallucination
 * 
 * Try to add something like broken non-straight lines, because they seem like a natural thing that comes out of this
 * hallucination. Closed-eyes are just inspiration, I should not try to copy that because I cant and it's not necessary.
 * 
 * @Tech
 * - extract managers to module files
 * - generate stuff on worker? initialization part has an impact on performance and UX
 * - clean up and prettify code
 * - create a TypeScript build system for this project
 * - this may be a custom web element that has verbose configuration (everything is optional)
 */
class CloseYourEyes
{
    constructor ( canvas )
    {
        this.options =
        {
            alphaDelta: 20,
            alphaDeltaFade: 10,
            drawPadding: 0,
            frameCount: 24,
            frameDelay: 30,
            noiseColor:
            {
                r: 185,
                g: 185,
                b: 202
            },
            accentColor:
            {
                r: 200,
                g: 200,
                b: 213
            },
            minDotOpacity: 30,
            maxDotOpacity: 120,
            maxImaginaryLineLength: 200,
            imaginaryLineDotOpacityIncrease: 120
        }

        this.canvasManager = new CanvasManager( canvas, this.options.drawPadding );
        this.imageManager  = new ImageManager(
            this.options.accentColor,
            this.options.noiseColor,
            this.options.minDotOpacity,
            this.options.maxDotOpacity,
            this.options.imaginaryLineDotOpacityIncrease
        );
    }

    setup ()
    {
        this.canvasManager.setup();
    }

    run ()
    {
        const backgrounds = [];

        for ( let i = 0; i < this.options.frameCount; ++i )
        {
            const coverage   = getRandomFromInterval( 5, 10 );
            const maxStep    = getRandomFromInterval( 80, 120 );
            const background = this.imageManager.generateDistortedArray( this.canvasManager.pixelCount, coverage, maxStep );

            backgrounds.push( background );
        }

        const imaginaryLines = [];

        for ( const background of backgrounds )
        {
            const imaginaryLine = this.imageManager.generateImaginaryLine(
                background,
                this.canvasManager.pixelCountX,
                this.canvasManager.pixelCountY,
                this.options.maxImaginaryLineLength
            )

            imaginaryLines.push( imaginaryLine );
        }

        let backgroundIndex = 0;
        let lineIndex       = 0;
        let machineIndex    = 0;

        // States: "BG", "BLANK", "LINE"
        //const machine = [ "BG", "BLANK", "BLANK", "BLANK", "LINE", "BLANK", "BLANK", "BLANK", "BLANK", "BLANK" ];
        //const machine = [ "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];
        const machine = [ "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];

        // TODO: draw lines rarely, so they really make an impact
        window.setInterval(
            () =>
            {
                if ( machineIndex === machine.length )
                {
                    machineIndex = 0;
                }

                const step = machine[ machineIndex ];

                if ( step === "BG" )
                {
                    this.canvasManager.mergeAndDrawImage( backgrounds[ backgroundIndex ], this.options.alphaDelta );

                    ++backgroundIndex;

                    if ( backgroundIndex === backgrounds.length )
                    {
                        backgroundIndex = 0;
                    }
                }

                if ( step === "LINE" )
                {
                    this.canvasManager.mergeAndDrawImage( imaginaryLines[ lineIndex ], this.options.alphaDelta );

                    ++lineIndex;

                    if ( lineIndex === imaginaryLines.length )
                    {
                        lineIndex = 0;
                    }
                }

                if ( step === "BLANK" )
                {
                    // TODO: just lower the opacity of all canvas
                    this.canvasManager.fadeImage( this.options.alphaDeltaFade );
                }

                ++machineIndex;
            },
            this.options.frameDelay
        );
    }
}

export { CloseYourEyes };
