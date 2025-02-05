import { Degradator } from "Library";

const dom =
{
    image      : document.querySelector( "img" ),
    input      : document.querySelector( "input" ),
    experiment : document.querySelector( "retro-experiment" )
}

const state =
{
    fileName   : null,
    lastBase64 : null
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
            key     : "scaleDownFactor",
            type    : "range",
            options : { min : 2, max : 128 },
            label   : "Factor",
            value   : defaultOptions.scaleDownFactor
        },
        {
            key     : "maxLightness",
            type    : "range",
            options : { min : 2, max : 255 },
            label   : "Lightness",
            value   : defaultOptions.maxLightness
        },
        {
            key   : "colorColdPrimary",
            type  : "color",
            label : "Color: cold primary",
            value : defaultOptions.colors.coldPrimary
        },
        {
            key   : "colorColdSecondary",
            type  : "color",
            label : "Color: cold secondary",
            value : defaultOptions.colors.coldSecondary
        },
        {
            key   : "colorWarmPrimary",
            type  : "color",
            label : "Color: warm primary",
            value : defaultOptions.colors.warmPrimary
        },
        {
            key   : "colorWarmSecondary",
            type  : "color",
            label : "Color: warm secondary",
            value : defaultOptions.colors.warmSecondary
        }
    ];

    dom.input.addEventListener( "change", ev =>
    {
        ev.preventDefault();

        if ( ev.target.files.length === 0 )
        {
            return;
        }

        getFileContent( ev.target.files[ 0 ] ).then(({ base64, name }) =>
        {
            degrade( base64, name );
        });
    });

    dom.experiment.addEventListener( "configurationChanged", () =>
    {
        if ( state.lastBase64, state.fileName )
        {
            degrade( state.lastBase64, state.fileName );
        }
    });

    dom.experiment.addEventListener( "controlClicked", ev =>
    {
        switch ( ev.detail )
        {
            case "generate":
                dom.input.click();
                break;

            case "download":
                downloadImage( dom.image );
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });

    const degrade = ( base64, name ) =>
    {
        dom.experiment.setAttribute( "disabled", "disabled" );
        dom.experiment.showPlaceholder = false;

        const options = (() =>
        {
            const mapped = {}
            dom.experiment.values.forEach( x => mapped[ x.key ] = x.value );
            return mapped;
        })();

        options.colors =
        {
            coldPrimary   : options.colorColdPrimary,
            coldSecondary : options.colorColdSecondary,
            warmPrimary   : options.colorWarmPrimary,
            warmSecondary : options.colorWarmSecondary
        }

        degradator.setOptions( options );

        degradator
            .degrade( base64 )
            .then( degraded =>
            {
                state.fileName   = extractFileName( name );
                state.lastBase64 = base64;
                dom.image.src    = degraded;
            })
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

/** From File to { name : "filename", base64 : <file content in base64 format> } */
function getFileContent ( file )
{
    return new Promise( resolve =>
    {
        const reader = new FileReader();
    
        reader.onload = () => resolve
        ({
            base64 : reader.result,
            name   : file.name
        });
    
        reader.readAsDataURL( file );
    });
}

window.addEventListener( "DOMContentLoaded", main );
