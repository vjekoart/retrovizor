import { ImageDegradator } from "Library";

const dom =
{
    button :
    {
        download : document.querySelector( "#button-download" ),
        generate : document.querySelector( "#button-generate" )
    },
    image :
    {
        input  : document.querySelector( "#image-input"  ),
        output : document.querySelector( "#image-output" )
    },
    input :
    {
        image : document.querySelector( "#input-image" )
    },
    configuration :
    {
        factor    : document.querySelector( "#configuration-factor"    ),
        lightness : document.querySelector( "#configuration-lightness" )
    },
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
    [
        {
            key   : "generate",
            label : "Degenerate"
        }, {
            key   : "download",
            label : "Download"
        }
    ];

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
        console.log( "controlClicked", ev.detail );
        console.log( "dom.experimentControl.values", dom.experimentControl.values );
        return;

        switch ( ev.detail )
        {
            case "generate":
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

                imageDegradator
                    .degrade( base64 )
                    .then(( degraded ) =>
                    {
                        state.fileName = extractFileName( name );
                        renderBase64ToImage( degraded, dom.image.output );
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
                imageToDownload( dom.image.output );
                break;

            default:
                console.warn( "Unknown control", ev.detail );
        }
    });

    // dom.configuration.factor.value    = defaultOptions.scaleDownFactor;
    // dom.configuration.lightness.value = defaultOptions.maxLightness;

    dom.button.download.addEventListener( "click", ev =>
    {
        ev.preventDefault();
        imageToDownload( dom.image.output );
    } );

    dom.button.generate.addEventListener( "click", ev =>
    {
        ev.preventDefault();
        setProcessing( true );

        // TODO : separate "image" and the rest from "getValues" return value
        imageDegradator.setOptions( dom.experimentControl.getValues() );

        // imageDegradator.setOptions
        // ({
        //     maxLightness    : parseInt( dom.configuration.lightness.value, 10 ),
        //     scaleDownFactor : parseInt( dom.configuration.factor.value   , 10 )
        // });

        // TODO : instead of "dom.image.input" use value from dom.experimentControl.getValues()
        const base64 = getBase64FromImage( dom.image.input );

        if ( !base64 )
        {
            setProcessing( false );
            alert( "Missing input image!" );
            return;
        }

        imageDegradator
            .degrade( base64 )
            .then(( degraded ) =>
            {
                renderBase64ToImage( degraded, dom.image.output );
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
    });

    dom.input.image.addEventListener( "change", ev =>
    {
        imageFileToImageElement( ev.target.files[ 0 ] );
    });
}

/* From "image.png" to "image.degraded.png" */
function extractFileName ( original )
{
    const originalName = original.split( "." ).toSpliced( -1, 1 ).join( "." );

    return [ originalName, "degraded", "png" ].join( "." );
}

function getBase64FromImage ( imageElement )
{
    const regex = new RegExp( "^data:image/.{1,5};base64" );

    if ( regex.test( imageElement.src ) )
    {
        return imageElement.src;
    }

    return null;
}

function imageFileToImageElement ( file )
{
    if ( !file )
    {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => dom.image.input.src = reader.result;
    reader.readAsDataURL( file );

    state.fileName = extractFileName( file.name );
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
    dom.image.output.src = base64;
}

function setProcessing ( isProcessing )
{
    if ( isProcessing )
    {
        dom.button.generate.innerText = "Processing...";
        dom.button.generate.setAttribute( "disabled", "disabled" );
        return;
    }

    dom.button.generate.innerText = "Degrade";
    dom.button.generate.removeAttribute( "disabled" );
}

window.addEventListener( "DOMContentLoaded", main );
