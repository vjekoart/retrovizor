import * as Core from "./src/core.js";

const Configuration = Core.general.getConfiguration();

async function build ()
{
    try
    {
        await Core.frontend.ensureBuildFolder( Configuration, true );
        await Core.frontend.copyAssets       ( Configuration       );

        const state =
        {
            library : {},
            scripts : {},
            styles  : {}
        }

        state.library = await Core.frontend.buildLibrary( Configuration                       );
        state.scripts = await Core.frontend.buildScripts( Configuration                       );
        state.styles  = await Core.frontend.buildStyles ( Configuration, state.library.styles );

        await Core.frontend.generateHTML( Configuration, state );
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
        const state =
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

            changes.copyAssets   && ( await Core.frontend.copyAssets( Configuration )                                               );
            changes.buildLibrary && ( state.library = await Core.frontend.buildLibrary( Configuration, true )                       );
            changes.buildScripts && ( state.scripts = await Core.frontend.buildScripts( Configuration, true )                       );
            changes.buildStyles  && ( state.styles  = await Core.frontend.buildStyles ( Configuration, state.library.styles, true ) );
            changes.generateHTML && ( await Core.frontend.generateHTML( Configuration, state, true )                                );

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
