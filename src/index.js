import
{
    CloseYourEyes,
    Utilities
}
from "Library";

function main ()
{
    // Testing
    Utilities.dummyUtility();

    const canvas        = document.querySelector( "canvas" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.setup();
    closeYourEyes.run();
}

window.addEventListener( "DOMContentLoaded", main );
