import { ImageDegradator } from "Library";

const dom =
{
    image : document.querySelector( "#image-output" ),
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
        }, {
            key     : "scaleDownFactor",
            type    : "range",
            options : { min : 2, max : 128 },
            label   : "Factor",
            value   : defaultOptions.scaleDownFactor
        }, {
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
                setProcessing( true );

                let base64 = null;
                let name   = "";
                let rest   = {}

                dom.experimentControl.values.forEach( x => x.key === "image" ? [ base64, name ] = [ x.value, x.name ] : rest[ x.key ] = x.value );

                if ( !base64 )
                {
                    setProcessing( false );
                    alert( "Missing input image!" );
                    return;
                }

                imageDegradator.setOptions( rest );

                imageDegradator
                    .degrade( base64 )
                    .then(( degraded ) =>
                    {
                        state.fileName = extractFileName( name );
                        renderBase64ToImage( degraded, dom.image );
                    })
                    .catch(( error ) =>
                    {
                        console.warn( error );
                        alert( "There was an error!" );
                    })
                    .finally(() =>
                    {
                        setProcessing( false );
                    });
                break;

            case "download":
                imageToDownload( dom.image );
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });
}

/* From "image.png" to "image.degraded.png" */
function extractFileName ( original )
{
    const originalName = original.split( "." ).toSpliced( -1, 1 ).join( "." );

    return [ originalName, "degraded", "png" ].join( "." );
}

function imageToDownload ( imageElement )
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

function renderBase64ToImage ( base64, imageElement )
{
    dom.image.src = base64;
}

function setProcessing ( isProcessing )
{
    if ( isProcessing )
    {
        dom.experimentControl.setAttribute( "disabled", "disabled" );
        return;
    }

    dom.experimentControl.removeAttribute( "disabled" );
}

window.addEventListener( "DOMContentLoaded", main );
