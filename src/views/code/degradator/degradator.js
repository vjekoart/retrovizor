import { Degradator } from "Library";

const dom =
{
    image      : document.querySelector( "img" ),
    experiment : document.querySelector( "retro-experiment" )
}

const state =
{
    fileName : null
}

function main ()
{
    const degradator = new Degradator();
    const defaultOptions  = degradator.getOptions();

    dom.experiment.controls =
    {
        "generate" : { style: "accent", label : "Select an image" },
        "download" : "Download"
    }

    dom.experiment.configuration =
    [
        {
            key   : "colorColdPrimary",
            type  : "color",
            label : "Primary cold color replacement",
            value : defaultOptions.colors.coldPrimary
        },
        {
            key   : "colorColdSecondary",
            type  : "color",
            label : "Secondary cold color replacement",
            value : defaultOptions.colors.coldSecondary
        },
        {
            key   : "colorWarmPrimary",
            type  : "color",
            label : "Primary warm color replacement",
            value : defaultOptions.colors.warmPrimary
        },
        {
            key   : "colorWarmSecondary",
            type  : "color",
            label : "Secondary warm color replacement",
            value : defaultOptions.colors.warmSecondary
        },
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

    dom.experiment.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "generate":
                let base64 = null;
                let name   = "";
                let rest   = {}

                dom.experiment.values.forEach( x => x.key === "image" ? [ base64, name ] = [ x.value, x.name ] : rest[ x.key ] = x.value );
                dom.experiment.setAttribute( "disabled", "disabled" );

                if ( !base64 )
                {
                    dom.experiment.removeAttribute( "disabled" );
                    alert( "Missing input image!" );
                    return;
                }

                dom.experiment.showPlaceholder = false;

                rest.colors =
                {
                    coldPrimary   : rest.colorColdPrimary,
                    coldSecondary : rest.colorColdSecondary,
                    warmPrimary   : rest.colorWarmPrimary,
                    warmSecondary : rest.colorWarmSecondary
                }

                degradator.setOptions( rest );

                degradator
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
                        dom.experiment.removeAttribute( "disabled" );
                    });
                break;

            case "download":
                downloadImage( dom.image );
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });
}

/** Trigger download event for provided image element */
function downloadImage ( imageElement )
{
    if ( !imageElement.src )
    {
        alert( "There's nothing to download." );
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
