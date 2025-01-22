import { CloseYourEyes } from "Library";

const dom =
{
    button :
    {
        run  : document.querySelector( "#button-run"  ),
        stop : document.querySelector( "#button-stop" )
    },
    canvas : document.querySelector( "canvas" ),
    configuration :
    {
        alphaDelta          : document.querySelector( "#configuration-alphaDelta"          ),
        drawFPS             : document.querySelector( "#configuration-drawFPS"             ),
        drawPadding         : document.querySelector( "#configuration-drawPadding"         ),
        frameCount          : document.querySelector( "#configuration-frameCount"          ),
        lineOpacityIncrease : document.querySelector( "#configuration-lineOpacityIncrease" ),
        maxDotOpacity       : document.querySelector( "#configuration-maxDotOpacity"       ),
        minDotOpacity       : document.querySelector( "#configuration-minDotOpacity"       ),
        maxLineLength       : document.querySelector( "#configuration-maxLineLength"       ),
        noiseColor          : document.querySelector( "#configuration-noiseColor"          )
    },
    experimentControl : document.querySelector( "retro-experiment-control" )
}

function main ()
{
    const closeYourEyes  = new CloseYourEyes( dom.canvas );
    const defaultOptions = closeYourEyes.getOptions();

    dom.experimentControl.initialize({});

    // dom.configuration.alphaDelta.value          = defaultOptions.alphaDelta;
    // dom.configuration.drawFPS.value             = defaultOptions.drawFPS;
    // dom.configuration.drawPadding.value         = defaultOptions.drawPadding;
    // dom.configuration.frameCount.value          = defaultOptions.frameCount;
    // dom.configuration.lineOpacityIncrease.value = defaultOptions.lineOpacityIncrease;
    // dom.configuration.maxDotOpacity.value       = defaultOptions.maxDotOpacity;
    // dom.configuration.minDotOpacity.value       = defaultOptions.minDotOpacity;
    // dom.configuration.maxLineLength.value       = defaultOptions.maxLineLength;
    // dom.configuration.noiseColor.value          = JSON.stringify( defaultOptions.noiseColor );

    dom.button.run.addEventListener( "click", ev =>
    {
        ev.preventDefault();

        closeYourEyes.isRunning && closeYourEyes.stop();

        closeYourEyes.setOptions( dom.experimentControl.getValues() );

        /* TODO: handle input formatting for rgb format */
        // closeYourEyes.setOptions
        // ({
        //     alphaDelta          : parseInt( dom.configuration.alphaDelta.value         , 10 ),
        //     drawFPS             : parseInt( dom.configuration.drawFPS.value            , 10 ),
        //     drawPadding         : parseInt( dom.configuration.drawPadding.value        , 10 ),
        //     frameCount          : parseInt( dom.configuration.frameCount.value         , 10 ),
        //     lineOpacityIncrease : parseInt( dom.configuration.lineOpacityIncrease.value, 10 ),
        //     maxDotOpacity       : parseInt( dom.configuration.maxDotOpacity.value      , 10 ),
        //     minDotOpacity       : parseInt( dom.configuration.minDotOpacity.value      , 10 ),
        //     maxLineLength       : parseInt( dom.configuration.maxLineLength.value      , 10 ),
        //     noiseColor          : JSON.parse( dom.configuration.noiseColor.value )
        // });

        closeYourEyes
            .generate()
            .then(() => closeYourEyes.run())
            .catch(( error ) =>
            {
                console.warn( error );
                alert( "There was an error!" );
            });
    });

    dom.button.stop.addEventListener( "click", ev =>
    {
        ev.preventDefault();
        closeYourEyes.stop();
    });

    closeYourEyes.onEvent = ( name, data ) =>
    {
        console.log( "closeYourEyes.onEvent", name, data );

        // TODO: on 'generating' show loading state
        // TODO: on 'generating-done' hide loading state
        // TODO: maybe not here, but on error show error state
    }

    closeYourEyes.setup();
}

window.addEventListener( "DOMContentLoaded", main );
