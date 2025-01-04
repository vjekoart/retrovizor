import { PixelHoodlum } from "Library";

function main ()
{
    const canvas       = document.querySelector( "#pixel-hoodlum" );
    const pixelHoodlum = new PixelHoodlum( canvas );

    console.log( "pixelHoodlum", pixelHoodlum );
}

window.addEventListener( "DOMContentLoaded", main );
