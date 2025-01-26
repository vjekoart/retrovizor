const dom   =
{
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
    [
        "keydown",
        "mousedown",
        "mousemove",
        "scroll",
        "touchstart"
    ].forEach( x => window.addEventListener( x, eventHandler ) );

    eventHandler();
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

window.addEventListener( "DOMContentLoaded", main );
