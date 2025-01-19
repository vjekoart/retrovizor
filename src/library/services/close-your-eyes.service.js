import { CanvasManager } from "Library/services/canvas-manager.service.js";
import { ImageManager  } from "Library/services/image-manager.service.js";

import { getRandomFromInterval } from "Library/utilities.js";

/**
 * @CloseYourEyes
 *
 * An experiment trying to depict what a human see when eyes are closed, in the dark.
 *
 * @usage
 * TODO
 *
 * @constructor
 * TODO
 */
class CloseYourEyes
{
    constructor ( canvas )
    {
        this.options =
        {
            alphaDelta                      : 20,
            drawPadding                     : 0,
            frameCount                      : 24,
            frameDelay                      : 30,
            noiseColor                      : { r: 185 , g: 185 , b: 202 },
            minDotOpacity                   : 30,
            maxDotOpacity                   : 120,
            maxImaginaryLineLength          : 200,
            imaginaryLineDotOpacityIncrease : 120
        }

        // TODO: register to window 'resize' event and stop the animation, recalculate frames and restart
        this.canvasManager = new CanvasManager( canvas, this.options.drawPadding );
        this.imageManager  = new ImageManager
        ({
            colors :
            {
                noise : this.options.noiseColor
            },
            dot :
            {
                opacity :
                {
                    min : this.options.minDotOpacity,
                    max : this.options.maxDotOpacity
                }
            },
            imaginaryLineDotOpacityIncrease : this.options.imaginaryLineDotOpacityIncrease
        });

        this.backgrounds    = [];
        this.imaginaryLines = [];
    }

    setup ()
    {
        this.canvasManager.setup();
    }

    generate ()
    {
        this.backgrounds = [];

        for ( let i = 0; i < this.options.frameCount; ++i )
        {
            const coverage   = getRandomFromInterval( 5 , 10  );
            const maxStep    = getRandomFromInterval( 80, 120 );
            const background = this.imageManager.generateDistortedArray( this.canvasManager.pixelCount, coverage, maxStep );

            this.backgrounds.push( background );
        }

        this.imaginaryLines = [];

        for ( const background of this.backgrounds )
        {
            const imaginaryLine = this.imageManager.generateImaginaryLine
            (
                background,
                this.canvasManager.pixelCountX,
                this.canvasManager.pixelCountY,
                this.options.maxImaginaryLineLength
            )

            this.imaginaryLines.push( imaginaryLine );
        }
    }

    run ()
    {
        let backgroundIndex = 0;
        let lineIndex       = 0;
        let machineIndex    = 0;

        const machine = [ "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];

        window.setInterval(
            () =>
            {
                machineIndex === machine.length && ( machineIndex = 0 );

                const step = machine[ machineIndex ];

                if ( step === "BG" )
                {
                    this.canvasManager.mergeAndDrawImage( this.backgrounds[ backgroundIndex ], this.options.alphaDelta );

                    ( ++backgroundIndex ) === this.backgrounds.length && ( backgroundIndex = 0 );
                }

                if ( step === "LINE" )
                {
                    this.canvasManager.mergeAndDrawImage( this.imaginaryLines[ lineIndex ], this.options.alphaDelta );

                    ( ++lineIndex ) === this.imaginaryLines.length && ( lineIndex = 0 );
                }

                ++machineIndex;
            },
            this.options.frameDelay
        );
    }
}

export { CloseYourEyes }
