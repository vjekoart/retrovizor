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
        image         : document.querySelector( "#input-image" ),
        configuration :
        {
            factor    : document.querySelector( "#configuration-factor"    ),
            lightness : document.querySelector( "#configuration-lightness" )
        }
    }
}

const state =
{
    fileName : null
}

function main ()
{
    const imageDegradator = new ImageDegradator();
    const defaultOptions  = imageDegradator.getOptions();

    dom.input.configuration.factor.value    = defaultOptions.scaleDownFactor;
    dom.input.configuration.lightness.value = defaultOptions.maxLightness;

    dom.button.download.addEventListener( "click", ev =>
    {
        ev.preventDefault();
        imageToDownload( dom.image.output );
    } );

    dom.button.generate.addEventListener( "click", ev =>
    {
        ev.preventDefault();
        setProcessing( true );

        imageDegradator.setOptions(
        {
            maxLightness    : parseInt( dom.input.configuration.lightness.value, 10 ),
            scaleDownFactor : parseInt( dom.input.configuration.factor.value   , 10 )
        } );

        const base64 = getBase64FromImage( dom.image.input );

        if ( !base64 )
        {
            setProcessing( false );
            alert( "Missing input image!" );
            return;
        }

        imageDegradator
            .degenerate( base64 )
            .then( degenerated =>
            {
                renderBase64ToImage( degenerated, dom.image.output );
            } )
            .catch( error =>
            {
                console.warn( error );
                alert( "There was an error!" );
            } )
            .finally( () =>
            {
                setProcessing( false );
            } );
    } );

    dom.input.image.addEventListener( "change", ev =>
    {
        imageFileToImageElement( ev.target.files[ 0 ] );
    } );
}

function extractFileName ( original )
{
    const originalName = original.split( "." ).toSpliced( -1, 1 ).join( "." );

    return [ originalName, "degenerated", "png" ].join( "." );
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

function setProcessing ( state )
{
    if ( state )
    {
        dom.button.generate.innerText = "Processing...";
        dom.button.generate.setAttribute( "disabled", "disabled" );
        return;
    }

    dom.button.generate.innerText = "Degenerate";
    dom.button.generate.removeAttribute( "disabled" );
}

window.addEventListener( "DOMContentLoaded", main );
