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

    blank.setup().then
    (
        dimensions =>
        {
            const maxLineLength = Math.min( Math.max( dimensions.width, dimensions.height ), 1024 );

            dom.experiment.configuration =
            [
                {
                    key     : "alphaDelta",
                    type    : "range",
                    options : { min : 1, max : 200 },
                    label   : "Fade-out intensity",
                    value   : defaultOptions.alphaDelta
                },
                {
                    key     : "drawFPS",
                    type    : "range",
                    options : { min : 1, max : 40 },
                    label   : "Speed",
                    value   : defaultOptions.drawFPS
                },
                {
                    key     : "drawPadding",
                    type    : "range",
                    options : { min : 0, max : 180 },
                    label   : "Margins",
                    value   : defaultOptions.drawPadding
                },
                {
                    key     : "frameCount",
                    type    : "range",
                    options : { min : 1, max : 40 },
                    label   : "Frame count",
                    value   : defaultOptions.frameCount
                },
                {
                    key     : "lineOpacityIncrease",
                    type    : "range",
                    options : { min : 1, max : 150 },
                    label   : "Line visibility",
                    value   : defaultOptions.lineOpacityIncrease
                },
                {
                    key     : "maxLineLength",
                    type    : "range",
                    options : { min : 1, max : maxLineLength },
                    label   : "Line length",
                    value   : Math.min( defaultOptions.maxLineLength, maxLineLength )
                },
                {
                    key     : "backgroundColor",
                    type    : "color",
                    label   : "Background color",
                    value   : defaultOptions.backgroundColor
                },
                {
                    key     : "noiseColor",
                    type    : "color",
                    label   : "Noise color",
                    value   : defaultOptions.noiseColor
                }
            ];
        }
    );

    dom.experiment.controls =
    {
        "run"  : { style : "accent", label : "Run" },
        "stop" : "Stop"
    }

    dom.experiment.addEventListener( "configurationChanged", () =>
    {
        if ( blank.isRunning )
        {
            runBlank();
        }
    });

    dom.experiment.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "run":
                runBlank();
                break;

            case "stop":
                blank.stop();
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });

    const runBlank = () =>
    {
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

                let message;

                if ( error.message === "Error in the worker script." )
                {
                    message = error.errorEvent?.data?.error?.message;
                }
                else
                {
                    message = "Cannot compute.";
                }

                alert( message );
            })
            .finally(() =>
            {
                dom.experiment.removeAttribute( "disabled" );
            });
    }

    blank.setup();
}

window.addEventListener( "DOMContentLoaded", main );
