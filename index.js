/**
 * Components' definition file. Place with majority of custom code when it comes to product codebase organization.
 *
 * @see Readme.md
 */
import { performance } from "node:perf_hooks";

import * as Library from "./library.js";
import * as Bits    from "./index.bits.js";

const Configuration = Library.getConfiguration();

function _writePerformance ( mode )
{
    performance.measure( "ensureBuildFolder:duration",    "ensureBuildFolder:start",    "ensureBuildFolder:end" );
    performance.measure( "generateHTML:duration",         "generateHTML:start",         "generateHTML:end"      );
    performance.measure( "buildScripts:duration",         "buildScripts:start",         "buildScripts:end"      );
    performance.measure( "buildStyles:duration",          "buildStyles:start",          "buildStyles:end"       );
    performance.measure( "buildLibrary:duration",         "buildLibrary:start",         "buildLibrary:end"      );
    performance.measure( `${ mode }:duration`,            `${ mode }:start`,            `${ mode }:end`         );

    const entries = performance.getEntries();

    entries.forEach( x =>
    {
        if ( x.name.endsWith( ":duration" ) )
        {
            console.log( x.name, ( x.duration / 1000 ).toFixed( 4 ), "seconds" );
        }
    } );
}

/**
 * TODO
 * - Support for nested views
 * - buildStyles: injection is done via templating actually, that can be done in a better way
 * - buildScripts: injection is done via templating actually, that can be done in a better way
 * - ??? try/catch block here doesn't make sense? whoever runs this will watch on output, important that return code is not 0
 * - ??? Create bundle for nested (imported) CSS files that are not part of the library OR move modules to appropriate place in dist
 * - ??? Create bundle for nested (imported) JS files that are not part of the library OR move modules to appropriate place in dist
 */
export async function build ()
{
    try
    {
        performance.mark( "build:start" );

        await Bits.ensureBuildFolder( Configuration.buildPath );
        await Promise.all([
            Bits.generateHTML( Configuration.buildPath, Configuration.internals, Configuration.dataFile  ),
            Bits.buildLibrary( Configuration.buildPath, Configuration.buildType, Configuration.internals ),
            Bits.buildScripts( Configuration.buildPath, Configuration.buildType, Configuration.internals ),
            Bits.buildStyles ( Configuration.buildPath, Configuration.buildType, Configuration.internals )
        ]);

        performance.mark( "build:end" );
        _writePerformance( "build" );
    }
    catch ( error )
    {
        console.error( "[build:error]", error );
    }
}

export function deploy ()
{
    console.log( "Hello from deploy!" );
}

export async function dev ()
{
    try
    {
        await Bits.ensureBuildFolder( Configuration.buildPath );
        Bits.startServer( Configuration.buildPath, Configuration.internals );
        Bits.watchLoop( Configuration.internals, changes =>
        {
            if ( changes.generateHTML )
            {
                Bits.generateHTML( Configuration.buildPath, Configuration.internals, Configuration.dataFile, true );
            }
            if ( changes.buildLibrary )
            {
                Bits.buildLibrary( Configuration.buildPath, Configuration.buildType, Configuration.internals, true );
            }
            if ( changes.buildScripts )
            {
                Bits.buildScripts( Configuration.buildPath, Configuration.buildType, Configuration.internals, true );
            }
            if ( changes.buildStyles )
            {
                Bits.buildStyles( Configuration.buildPath, Configuration.buildType, Configuration.internals, true );
            }
        } );
    }
    catch ( error )
    {
        console.error( "[dev:error]", error );
    }
}

export function start ()
{
    console.log( "Hello from start!" );
}

export function test ()
{
    console.log( "Hello from test!" );
}

/* Expose component methods, to others and to the CLI */
Library.expose(
    [
        build,
        deploy,
        dev,
        start,
        test
    ],
    dev
);
