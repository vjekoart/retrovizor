import { CloseYourEyes } from "Library";

function main ()
{
    const canvas        = document.querySelector( "canvas" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.setup();
    closeYourEyes.run();
}

window.addEventListener( "DOMContentLoaded", main );
