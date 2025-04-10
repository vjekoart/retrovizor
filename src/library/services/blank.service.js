import { CanvasManager } from "Library/services/canvas-manager.service.js";
import { Colors        } from "Library/utilities.js";

/**
 * An experiment trying to depict what a human see when eyes are closed, in the dark.
 *
 * @usage
 * const canvas   = document.querySelector( "canvas" );
 * const instance = new Blank( canvas );
 *
 * await instance.setup();
 * instance.generate().then(() => instance.run());
 *
 * // Listen for events of interest
 * instance.on = event =>
 * {
 *     if ( event === "generate:start" ) // Show loading
 *     if ( event === "generate:end"   ) // Hide loading
 * }
 */
class Blank
{
    /**
     * @param { HTMLCanvasElement } canvas  - HTML canvas element where the animation will be displayed.
     */
    constructor ( canvas )
    {
        this.options =
        {
            alphaDelta          : 30,
            drawFPS             : 24,
            drawPadding         : 0,
            frameCount          : 9,
            lineOpacityIncrease : 100,
            maxDotOpacity       : 100,
            minDotOpacity       : 30,
            maxLineLength       : Math.min( Math.floor( 0.3 * window.innerWidth ), 1024 ),
            backgroundColor     : { r :  22, g :  22, b :  29 },
            noiseColor          : { r : 185, g : 185, b : 202 }
        }

        this.on = null;

        /* Internal */
        this.isRunning            = false;
        this.backgrounds          = [];
        this.imaginaryLines       = [];
        this.timerId              = null; /* Non-null when the resize is waiting for execution */

        this.resizeCycleActive    = false;
        this.resizeCycleShouldRun = false;
        this.resizeDelay          = 500;
        this.animationState       =
        {
            backgroundIndex : 0,
            lineIndex       : 0,
            machineIndex    : 0,
            machine         : []
        }

        this.canvasManager        = new CanvasManager( canvas, this.options.drawPadding );
        this.worker               = new Worker
        (
            import.meta.resolve( "Library/services/blank.worker.js" ),
            { type : "module" }
        );
    }

    drawFrame ()
    {
        this.animationState.machineIndex === this.animationState.machine.length && ( this.animationState.machineIndex = 0 );

        const step = this.animationState.machine[ this.animationState.machineIndex ];

        if ( step === "BG" )
        {
            this.canvasManager.mergeAndDrawImage( this.backgrounds[ this.animationState.backgroundIndex ], this.options.alphaDelta );

            ( ++this.animationState.backgroundIndex ) === this.backgrounds.length && ( this.animationState.backgroundIndex = 0 );
        }

        if ( step === "LINE" )
        {
            this.canvasManager.mergeAndDrawImage( this.imaginaryLines[ this.animationState.lineIndex ], this.options.alphaDelta );

            ( ++this.animationState.lineIndex ) === this.imaginaryLines.length && ( this.animationState.lineIndex = 0 );
        }

        ++this.animationState.machineIndex;
    }

    generate ()
    {
        return new Promise(( resolve, reject ) =>
        {
            this.reportEvent( "generate:start" );

            this.backgrounds    = [];
            this.imaginaryLines = [];

            this.canvasManager.clearBackground();
            this.canvasManager.clearImage();
            this.canvasManager.setOptions({ padding : this.options.drawPadding });

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
                if ( ev.data?.action === "end" )
                {
                    this.backgrounds    = ev.data.content.backgrounds;
                    this.imaginaryLines = ev.data.content.imaginaryLines;

                    this.reportEvent( "generate:end" );
                    resolve();
                    return;
                }

                reject({ message : "Error in the worker script.", errorEvent : ev });
            }
        });
    }

    getOptions ()
    {
        return this.options;
    }

    setOptions ( options )
    {
        this.options = options;
    }

    reportEvent ( eventName )
    {
        typeof this.on === "function" && this.on( eventName );
    }

    resize ()
    {
        if ( !this.resizeCycleActive )
        {
            this.resizeCycleShouldRun = this.stop();
            this.resizeCycleActive    = true;
        }

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

        this.timerId = window.setTimeout
        (
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
        this.isRunning = true;

        this.animationState.backgroundIndex = 0;
        this.animationState.lineIndex       = 0;
        this.animationState.machineIndex    = 0;
        this.animationState.machine         =
        [ "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "LINE", "BG", "BG", "BG", "BG", "BG", "BG" ];

        const fpsDelay = Math.floor( 1000 / this.options.drawFPS );

        let previousTime = null;

        const wrapper = timestamp =>
        {
            if ( !this.isRunning )
            {
                this.canvasManager.clearBackground();
                this.canvasManager.clearImage();
                return;
            }

            if ( !previousTime || ( timestamp - previousTime ) > fpsDelay )
            {
                previousTime = timestamp;

                this.drawFrame();
            }

            window.requestAnimationFrame( t => wrapper( t ) );
        }

        this.canvasManager.setBackground( Colors.objectRGBToHex( this.options.backgroundColor ) );
        window.requestAnimationFrame( t => wrapper( t ) );
    }

    setup ()
    {
        return new Promise( resolve =>
        {
            window.setTimeout(() =>
            {
                const dimensions = this.canvasManager.setup();
                window.addEventListener( "resize", () => this.resize() );

                resolve( dimensions );
            }, 1 );
        });
    }

    /**
     * Returns `true` if animation was running, and `false` otherwise.
     *
     * @return { boolean }
     */
    stop ()
    {
        if ( this.isRunning )
        {
            this.isRunning = false;
            return true;
        }

        return false;
    }
}

export { Blank }
