import { Blank } from "Library";

const dom =
{
    canvas     : document.querySelector( "canvas" ),
    experiment : document.querySelector( "retro-experiment" )
}

function main ()
{
    const blank  = new Blank( dom.canvas );
    const defaultOptions = blank.getOptions();

    blank.setup();

    dom.experiment.controls =
    {
        "run"  : "(Re)run",
        "stop" : "Stop"
    }

    dom.experiment.configuration =
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
            options : { min : 1, max : 50 },
            label   : "FPS",
            value   : defaultOptions.drawFPS
        },
        {
            key     : "drawPadding",
            type    : "range",
            options : { min : 1, max : 180 },
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
            type    : "color",
            label   : "Noise color",
            value   : defaultOptions.noiseColor
        }
    ];

    dom.experiment.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "run":
                const configuration = {}

                dom.experiment.setAttribute( "disabled", "disabled" );
                dom.experiment.values.forEach( x => configuration[ x.key ] = x.value );
                dom.experiment.showPlaceholder = false;

                blank.isRunning && blank.stop();
                blank.setOptions( configuration );
                blank
                    .generate()
                    .then(() => blank.run())
                    .catch( error =>
                    {
                        console.warn( error );
                        alert( "There was an error!" );
                    })
                    .finally(() =>
                    {
                        dom.experiment.removeAttribute( "disabled" );
                    });
                break;

            case "stop":
                blank.stop();
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });

    blank.setup();
}

window.addEventListener( "DOMContentLoaded", main );
