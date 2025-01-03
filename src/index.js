import { Utilities } from "Library";

function main ()
{
    console.log( "index.js: executed first at every page load" );

    Utilities.dummyUtility();
}

window.addEventListener( "DOMContentLoaded", main );
