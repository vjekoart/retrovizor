import { CanvasManager } from "Library/services/canvas-manager.service.js";
import { ImageManager  } from "Library/services/image-manager.service.js";

import { getRandomFromInterval } from "Library/utilities.js";

/**
 * @CloseYourEyes
 *
 * An experiment trying to depict what a human see when eyes are closed, in the dark.
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

        // TODO: register to window 'resize' event and stop the animation, recalculate frames and restart
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

                ++machineIndex;
            },
            this.options.frameDelay
        );
    }
}

export { CloseYourEyes }
