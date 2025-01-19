import { CanvasManager } from "Library/services/canvas-manager.service.js";
import { ImageManager  } from "Library/services/image-manager.service.js";

import { getRandomFromInterval } from "Library/utilities.js";

/**
 * @CloseYourEyes
 *
 * An experiment trying to depict what a human see when eyes are closed, in the dark.
 *
 * @usage
 * ```javascript
 * TODO
 * closeYourEyes.onEvent = ( name, data? ) => { ... }
 * ```
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
            imaginaryLineDotOpacityIncrease : 120,
            maxDotOpacity                   : 120,
            minDotOpacity                   : 30,
            maxImaginaryLineLength          : Math.floor( 0.3 * window.innerWidth ),
            noiseColor                      : { r: 185 , g: 185 , b: 202 }
        }

        this.onEvent             = null; /* A user can set a callback to get service events   */

        /* Internal */
        this.animationId         = null; /* Non-null when the animation is running            */
        this.backgrounds         = [];
        this.imaginaryLines      = [];
        this.timerId             = null; /* Non-null when the resize is waiting for execution */

        this.resizeCycleActive    = false;
        this.resizeCycleShouldRun = false;
        this.resizeDelay          = 1000;

        this.canvasManager       = new CanvasManager( canvas, this.options.drawPadding );
        this.imageManager        = new ImageManager
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
    }

    generate ()
    {
        this.sendEvent( "generating" );
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

    sendEvent ( name, data = null )
    {
        typeof this.onEvent === "function" && this.onEvent( name, data );
    }

    resize ()
    {
        if ( !this.resizeCycleActive )
        {
            this.resizeCycleShouldRun = this.stop();
            this.resizeCycleActive = true;
        }

        this.canvasManager.clearImage();
        this.resizeTimer();
    }

    resizeDo ( wasRunning )
    {
        this.resizeCycleActive = false;
        this.generate();
        this.resizeCycleShouldRun && this.run();
    }

    resizeTimer ()
    {
        if ( this.timerId )
        {
            window.clearTimeout( this.timerId );
        }

        this.timerId = window.setTimeout(
            () =>
            {
                this.resizeDo();
                this.timerId = null;
            },
            this.resizeDelay
        );
    }

    run ()
    {
        let backgroundIndex = 0;
        let lineIndex       = 0;
        let machineIndex    = 0;

        // TODO: this shouldn't be defined here
        const machine    = [ "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];

        this.animationId = window.setInterval
        (
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

    setup ()
    {
        this.canvasManager.setup();

        window.addEventListener( "resize", () => this.resize() );
    }

    /**
     * Returns `true` if animation was running, and `false` otherwise.
     */
    stop ()
    {
        if ( this.animationId )
        {
            window.clearInterval( this.animationId );
            this.animationId = null;

            return true;
        }

        return false;
    }
}

export { CloseYourEyes }
