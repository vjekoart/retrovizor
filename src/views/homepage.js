import { Blank } from "Library";

const dom =
{
    bright : document.querySelector( "#bright"               ),
    canvas : document.querySelector( "canvas"                ),
    header : document.querySelector( "header[role=\"main\"]" ),
    navbar : document.querySelector( "retro-nav"             ),
    title  : document.querySelector( "retro-title"           )
}

const state =
{
    hidden   : false,
    interval : null
}

function main ()
{
    initializeBlank();
    initializeFullscreen();
}

function eventHandler ()
{
    state.interval && window.clearTimeout( state.interval );
    state.hidden   && showInterface();

    state.interval = window.setTimeout( hideInterface, 7000 );
}

function hideInterface ()
{
    dom.header?.classList.add( "hidden" );
    dom.navbar?.classList.add( "hidden" );
    dom.title ?.classList.add( "hidden" );

    state.hidden = true;
}

function showInterface ()
{
    dom.header?.classList.remove( "hidden" );
    dom.navbar?.classList.remove( "hidden" );
    dom.title ?.classList.remove( "hidden" );

    state.hidden = false;
}

async function initializeBlank ()
{
    const blank = new Blank( dom.canvas );

    await blank.setup();

    blank.on = event =>
    {
        if ( event === "generate:start" ) dom.bright.classList.remove( "hidden" );
        if ( event === "generate:end"   ) dom.bright.classList.add   ( "hidden" );
    }

    blank
        .generate()
        .then(() =>
        {
            window.setTimeout( () => blank.run(), 660 );
        })
        .catch( error =>
        {
            console.warn( error );
            alert( "There was an error!" );
        });
}

function initializeFullscreen ()
{
    [
        "keydown",
        "mousedown",
        "mousemove",
        "scroll",
        "touchstart"
    ].forEach( x => window.addEventListener( x, eventHandler ) );

    eventHandler();
}

window.addEventListener( "DOMContentLoaded", main );
