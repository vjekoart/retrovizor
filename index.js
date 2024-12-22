/**
 * Components' definition file. Place with majority of custom code when it comes to product codebase organization.
 *
 * @see Readme.md
 */
import { performance } from "node:perf_hooks";

import * as Library from "./library.js";
import * as Bits    from "./index.bits.js";


// TODO: this should be something like: Library.getConfiguration() where "internals" would be added from different file
//       and overriden if defined in configuration.json
import Configuration from "./configuration.json" assert { type: "json" };

function _writePerformance ( mode )
{
    performance.measure( "ensureBuildFolder:duration",    "ensureBuildFolder:start",    "ensureBuildFolder:end"    );
    performance.measure( "generateHTML:duration",         "generateHTML:start",         "generateHTML:end"         );
    performance.measure( "compileInjectStyles:duration",  "compileInjectStyles:start",  "compileInjectStyles:end"  );
    performance.measure( "compileInjectScripts:duration", "compileInjectScripts:start", "compileInjectScripts:end" );
    performance.measure( `${ mode }:duration`,            `${ mode }:start`,            `${ mode }:end`            );

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
 * - compileInjectStyles: injection is done via templating actually, that can be done in a better way
 * - compileInjectScripts: injection is done via templating actually, that can be done in a better way
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
            Bits.generateHTML        ( Configuration.buildPath, Configuration.internals, Configuration.dataFile ),
            // TODO: Compile "library" and inject in every view
            Bits.compileInjectStyles ( Configuration.buildPath, Configuration.internals ),
            Bits.compileInjectScripts( Configuration.buildPath, Configuration.internals )
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
            if ( changes.compileInjectStyles )
            {
                Bits.compileInjectStyles( Configuration.buildPath, Configuration.internals, true );
            }
            if ( changes.compileInjectScripts )
            {
                Bits.compileInjectScripts( Configuration.buildPath, Configuration.internals, true );
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