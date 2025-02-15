import * as Core from "./src/core.js";

const Configuration = Core.general.getConfiguration();

async function build ()
{
    try
    {
        await Core.frontend.ensureBuildFolder( Configuration, true );
        await Core.frontend.copyAssets       ( Configuration       );

        const loopState =
        {
            library : {},
            scripts : {},
            styles  : {}
        }

        loopState.library = await Core.frontend.buildLibrary( Configuration                           );
        loopState.scripts = await Core.frontend.buildScripts( Configuration                           );
        loopState.styles  = await Core.frontend.buildStyles ( Configuration, loopState.library.styles );

        await Core.frontend.generateHTML( Configuration, loopState );
    }
    catch ( error )
    {
        console.error( "\nError during build action!", error );
    }
}

async function dev ()
{
    try
    {
        const loopState =
        {
            library : {},
            scripts : {},
            styles  : {}
        }

        await Core.frontend.ensureBuildFolder( Configuration );
        Core.frontend.startServer( Configuration );

        Core.frontend.watchLoop( Configuration, async changes =>
        {
            console.info( "\nStarting the loop...\n" );

            changes.copyAssets   && ( await Core.frontend.copyAssets( Configuration )                                                       );
            changes.buildLibrary && ( loopState.library = await Core.frontend.buildLibrary( Configuration, true )                           );
            changes.buildScripts && ( loopState.scripts = await Core.frontend.buildScripts( Configuration, true )                           );
            changes.buildStyles  && ( loopState.styles  = await Core.frontend.buildStyles ( Configuration, loopState.library.styles, true ) );
            changes.generateHTML && ( await Core.frontend.generateHTML( Configuration, loopState, true )                                    );

            console.info( "\nLoop completed." );
        } );
    }
    catch ( error )
    {
        console.error( "\nError during dev action!", error );
    }
}

function start ()
{
    dev();
}

function test ()
{
    Core.frontend.tests.runWebBrowser( Configuration );
}

function e2e ()
{
    Core.frontend.tests.runE2E( Configuration );
}

export function FrontendApp ()
{
    Core.general.expose
    (
        [
            build,
            dev,
            e2e,
            start,
            test
        ],
        dev
    );

    return Core;
}
