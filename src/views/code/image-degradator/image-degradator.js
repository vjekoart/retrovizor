import { ImageDegradator } from "Library";

const dom =
{
    image             : document.querySelector( "#image-output" ),
    experimentControl : document.querySelector( "retro-experiment-control" )
}

const state =
{
    fileName : null
}

function main ()
{
    const imageDegradator = new ImageDegradator();
    const defaultOptions  = imageDegradator.getOptions();

    dom.experimentControl.controls =
    {
        "generate" : "Degrade",
        "download" : "Download"
    }

    dom.experimentControl.options =
    [
        {
            key     : "image",
            type    : "file",
            options : { accept : "image/png, image/jpeg, image/webp" },
            label   : "Click to select an image",
            value   : null
        },
        {
            key     : "scaleDownFactor",
            type    : "range",
            options : { min : 2, max : 32 },
            label   : "Factor",
            value   : defaultOptions.scaleDownFactor
        },
        {
            key     : "maxLightness",
            type    : "range",
            options : { min : 2, max : 255 },
            label   : "Max lightness",
            value   : defaultOptions.maxLightness
        }
    ];

    dom.experimentControl.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "generate":
                let base64 = null;
                let name   = "";
                let rest   = {}

                dom.experimentControl.values.forEach( x => x.key === "image" ? [ base64, name ] = [ x.value, x.name ] : rest[ x.key ] = x.value );
                dom.experimentControl.setAttribute( "disabled", "disabled" );

                if ( !base64 )
                {
                    dom.experimentControl.removeAttribute( "disabled" );
                    alert( "Missing input image!" );
                    return;
                }

                imageDegradator.setOptions( rest );

                imageDegradator
                    .degrade( base64 )
                    .then( degraded =>
                    {
                        state.fileName = extractFileName( name );
                        dom.image.src  = degraded;
                    })
                    .catch( error =>
                    {
                        console.warn( error );
                        alert( "There was an error!" );
                    })
                    .finally(() =>
                    {
                        dom.experimentControl.removeAttribute( "disabled" );
                    });
                break;

            case "download":
                donwloadImage( dom.image );
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });
}

/** Trigger download event for provided image element */
function donwloadImage ( imageElement )
{
    if ( !imageElement.src )
    {
        return;
    }

    const a = document.createElement( "a" );

    a.href     = imageElement.src;
    a.target   = "_blank";
    a.download = state.fileName;

    a.click();
}

/** From "image.png" to "image.degraded.png" */
function extractFileName ( original )
{
    const originalName = original.split( "." ).toSpliced( -1, 1 ).join( "." );

    return [ originalName, "degraded", "png" ].join( "." );
}

window.addEventListener( "DOMContentLoaded", main );
