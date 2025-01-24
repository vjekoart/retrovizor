import { CloseYourEyes } from "Library";

const dom =
{
    canvas            : document.querySelector( "canvas" ),
    experimentControl : document.querySelector( "retro-experiment-control" )
}

function main ()
{
    const closeYourEyes  = new CloseYourEyes( dom.canvas );
    const defaultOptions = closeYourEyes.getOptions();

    dom.experimentControl.controls =
    {
        "run"  : "(Re)run",
        "stop" : "Stop"
    }

    dom.experimentControl.options =
    [
        {
            key     : "alphaDelta",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "Fade-out alpha",
            value   : defaultOptions.alphaDelta
        },
        {
            key     : "drawFPS",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "FPS",
            value   : defaultOptions.drawFPS
        },
        {
            key     : "drawPadding",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "Padding",
            value   : defaultOptions.drawPadding
        },
        {
            key     : "frameCount",
            type    : "range",
            options : { min : 1, max : 40 },
            label   : "Number of frames",
            value   : defaultOptions.frameCount
        },
        {
            key     : "lineOpacityIncrease",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "Accent opacity",
            value   : defaultOptions.lineOpacityIncrease
        },
        {
            key     : "maxDotOpacity",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "Max dot opacity",
            value   : defaultOptions.maxDotOpacity
        },
        {
            key     : "minDotOpacity",
            type    : "range",
            options : { min : 1, max : 255 },
            label   : "Min dot opacity",
            value   : defaultOptions.minDotOpacity
        },
        {
            key     : "maxLineLength",
            type    : "range",
            options : { min : 1, max : 1024 },
            label   : "Max line length",
            value   : defaultOptions.maxLineLength
        },
        {
            key     : "noiseColor",
            type    : "text",
            label   : "Noise color",
            value   : JSON.stringify( defaultOptions.noiseColor )
        }
    ];

    dom.experimentControl.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "run":
                const options = {}

                dom.experimentControl.setAttribute( "disabled", "disabled" );
                dom.experimentControl.values.forEach( x => options[ x.key ] = x.key === "noiseColor" ? JSON.parse( x.value ) : x.value );

                closeYourEyes.isRunning && closeYourEyes.stop();
                closeYourEyes.setOptions( options );
                closeYourEyes
                    .generate()
                    .then(() => closeYourEyes.run())
                    .catch(( error ) =>
                    {
                        console.warn( error );
                        alert( "There was an error!" );
                    })
                    .finally(() =>
                    {
                        dom.experimentControl.removeAttribute( "disabled" );
                    });
                break;

            case "stop":
                closeYourEyes.stop();
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });

    closeYourEyes.setup();
}

window.addEventListener( "DOMContentLoaded", main );
