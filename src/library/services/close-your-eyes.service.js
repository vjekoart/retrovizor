import { CanvasManager } from "Library/services/canvas-manager.service.js";

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
            noiseColor                      : { r : 185, g : 185, b : 202 }
        }

        this.onEvent              = null; /* A user can set a callback to get service events   */

        /* Internal */
        this.animationId          = null; /* Non-null when the animation is running            */
        this.backgrounds          = [];
        this.imaginaryLines       = [];
        this.timerId              = null; /* Non-null when the resize is waiting for execution */

        this.resizeCycleActive    = false;
        this.resizeCycleShouldRun = false;
        this.resizeDelay          = 1000;

        this.canvasManager        = new CanvasManager( canvas, this.options.drawPadding );
        this.worker               = new Worker
        (
            import.meta.resolve( "Library/services/close-your-eyes.worker.js" ),
            { type : "module" }
        );
    }

    generate ()
    {
        return new Promise(( resolve, reject ) =>
        {
            this.sendEvent( "generating" );

            this.backgrounds    = [];
            this.imaginaryLines = [];

            const action  = "start";
            const options = Object.assign
            (
                this.options,
                {
                    pixelCountX : this.canvasManager.pixelCountX,
                    pixelCountY : this.canvasManager.pixelCountY,
                    pixelCount  : this.canvasManager.pixelCount
                }
            );

            this.worker.postMessage({ action, options });

            this.worker.onmessage = ev =>
            {
                this.sendEvent( "generating-done" );

                if ( ev.data?.action === "end" )
                {
                    this.backgrounds    = ev.data.content.backgrounds;
                    this.imaginaryLines = ev.data.content.imaginaryLines;

                    resolve();
                    return;
                }

                reject({ message : "Error in the worker script.", errorEvent : ev });
            }
        });
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

    async resizeDo ()
    {
        this.resizeCycleActive = false;
        await this.generate();
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
