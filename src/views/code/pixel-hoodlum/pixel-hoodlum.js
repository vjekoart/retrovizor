import { PixelHoodlum } from "Library";

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
    }
}

function main ()
{
    const pixelHoodlum = new PixelHoodlum();

    dom.button.download.addEventListener( "click", ev =>
    {
        ev.preventDefault();

        imageToDownload( dom.image.output );
    } );

    dom.button.generate.addEventListener( "click", ev =>
    {
        ev.preventDefault();

        const base64 = getBase64FromImage( dom.image.input );

        pixelHoodlum
            .degenerate( base64 )
            .then( degenerated =>
            {
                renderBase64ToImage( degenerated, dom.image.output );
            } )
            .catch( error =>
            {
                console.warn( error );
                alert( "There was an error!" );
            } );
    } );

    dom.input.image.addEventListener( "change", ev =>
    {
        imageFileToImageElement( ev.target.files[ 0 ] );
    } );
}

function getBase64FromImage ( imageElement )
{
    const regex = new RegExp( "^data:image/.{1,5};base64" );

    if ( regex.test( imageElement.src ) )
    {
        return imageElement.src;
    }

    alert( "Missing input image!" );
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
}

function imageToDownload ( imageElement )
{
    console.log( "imageToDownload" );
}

function renderBase64ToImage ( base64, imageElement )
{
    dom.image.output.src = base64;
}

window.addEventListener( "DOMContentLoaded", main );
