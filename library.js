/**
 * Utility library that would be moved to a separate project, i.e. "product codebase organization"
 * library/utility.
 */
import Chokidar       from "chokidar";
import FS             from "fs/promises";
import FSSync         from "fs";
import Handlebars     from "handlebars";
import HTTP           from "http";
import Jasmine        from "jasmine";
import JasmineBrowser from "jasmine-browser-runner";
import Path           from "path";
import Process        from "node:process";
import ServeHandler   from "serve-handler";

import * as Bits      from "./library.bits.js";


/**
 * Expose functions of the component to the CLI (and other parts of the codebase in the future).
 * 
 * @param { Array<Function> } functions Array of functions to expose.
 * @param { Function        } fallback  Function to execute if none was provided when called via CLI.
 */
function expose ( functions, fallback )
{
    const exposed = {};

    functions.forEach( x => exposed[ x.name ] = x );

    const target = Process.argv[ 2 ];

    if ( !target )
    {
        fallback();
        return;
    }

    if ( !( target in exposed ) )
    {
        console.error( "Unknown function target:", target );
        return;        
    }

    exposed[ target ]();
}

/**
 * Return content of the `configuration.json` file merged with `.internals.json` file.
 */
function getConfiguration ()
{
    const internals     = JSON.parse( FSSync.readFileSync( ".internals.json"   , { encoding: "utf8" } ) );
    const configuration = JSON.parse( FSSync.readFileSync( "configuration.json", { encoding: "utf8" } ) );

    return Object.assign( configuration, { internals } );
}

async function buildLibrary ( configuration, dev = false )
{
    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const dirPath = Path.join( Bits.getRootPath(), libraryPath );
    const content = await Bits.readDirectoryContent( dirPath );

    const fileMappings =
    {
        scripts : {},
        styles  : {}
    };

    for ( const file in content )
    {
        const relativePath = Path.join( "/", libraryBuild, Bits.getCompiledPath( file, content[ file ], dev ) );

        Bits.isScriptFile( file ) && ( fileMappings.scripts[ Path.normalize( `Library/${ file }` ) ] = relativePath );
        Bits.isStyleFile ( file ) && ( fileMappings.styles [ Path.normalize( `Library/${ file }` ) ] = relativePath );
    }

    const outputBase = Path.join( Bits.getRootPath(), buildPath, libraryBuild );

    for ( const file in content )
    {
        let compiled;

        Bits.isScriptFile( file ) && ( compiled = await Bits.compileScript( file, content[ file ], buildType, dev ) );
        Bits.isStyleFile ( file ) && ( compiled = await Bits.compileStyle ( file, file, content[ file ], fileMappings.styles, buildType, dev ) );

        compiled?.code && await Bits.writeFile( Path.join( outputBase, file            ), compiled.code );
        compiled?.map  && await Bits.writeFile( Path.join( outputBase, `${ file }.map` ), compiled.map  );
    }

    if ( "Library/index.js" in fileMappings.scripts )
    {
        fileMappings.scripts[ "Library" ] = fileMappings.scripts[ "Library/index.js" ];
        delete fileMappings.scripts[ "Library/index.js" ];
    }

    return fileMappings;
}

async function buildScripts ( configuration, dev = false )
{
    const { buildPath, buildType } = configuration;
    const {
        sourcePath,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath     = Path.join( Bits.getRootPath(), sourcePath, "index.js" );
    const fullTemplatesPath = Path.join( Bits.getRootPath(), templatesPath          );
    const fullViewsPath     = Path.join( Bits.getRootPath(), viewsPath              );

    const contentTemplates  = await Bits.readDirectoryContent( fullTemplatesPath, Bits.isScriptFile );
    const contentViews      = await Bits.readDirectoryContent( fullViewsPath    , Bits.isScriptFile );

    const content =
    {
        "index.js" : await FS.readFile( fullIndexPath, { encoding: "utf8" } )
    };

    Object
        .keys( contentTemplates )
        .forEach( x => content[ Path.normalize( `templates/${ x }` ) ] = contentTemplates[ x ] );

    Object
        .keys( contentViews )
        .forEach( x => content[ Path.normalize( `views/${ x }` ) ] = contentViews[ x ] );

    const fileMappings = {};

    for ( const file in content )
    {
        const relativePath = Path.join( "/", Bits.getCompiledPath( file, content[ file ], dev ) );

        fileMappings[ file ] = relativePath.replace( "views/", "" );
    }

    const outputBase = Path.join( Bits.getRootPath(), buildPath );

    for ( const file in content )
    {
        const compiled = await Bits.compileScript( file, content[ file ], buildType, dev );
        const output   = fileMappings[ file ];

        compiled?.code && await Bits.writeFile( Path.join( outputBase, output            ), compiled.code );
        compiled?.map  && await Bits.writeFile( Path.join( outputBase, `${ output }.map` ), compiled.map  );
    }

    return fileMappings;
}

async function buildStyles ( configuration, additionalMappings, dev = false )
{
    const { buildPath, buildType } = configuration;
    const {
        sourcePath,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath     = Path.join( Bits.getRootPath(), sourcePath, "index.css" );
    const fullTemplatesPath = Path.join( Bits.getRootPath(), templatesPath           );
    const fullViewsPath     = Path.join( Bits.getRootPath(), viewsPath               );

    const contentTemplates  = await Bits.readDirectoryContent( fullTemplatesPath, Bits.isStyleFile );
    const contentViews      = await Bits.readDirectoryContent( fullViewsPath    , Bits.isStyleFile );

    const content =
    {
        "index.css" : await FS.readFile( fullIndexPath, { encoding: "utf8" } )
    };

    Object
        .keys( contentTemplates )
        .forEach( x => content[ Path.normalize( `templates/${ x }` ) ] = contentTemplates[ x ] );

    Object
        .keys( contentViews )
        .forEach( x => content[ Path.normalize( `views/${ x }` ) ] = contentViews[ x ] );

    const fileMappings = {};

    for ( const file in content )
    {
        const relativePath = Path.join( "/", Bits.getCompiledPath( file, content[ file ], dev ) );

        fileMappings[ file ] = relativePath.replace( "views/", "" );
    }

    const outputBase = Path.join( Bits.getRootPath(), buildPath );

    for ( const file in content )
    {
        const compiled = await Bits.compileStyle( file, file, content[ file ], additionalMappings, buildType, dev );
        const output   = fileMappings[ file ];

        compiled?.code && await Bits.writeFile( Path.join( outputBase, output            ), compiled.code );
        compiled?.map  && await Bits.writeFile( Path.join( outputBase, `${ output }.map` ), compiled.map  );
    }

    return fileMappings;
}

async function copyAssets ( configuration )
{
    const { buildPath, buildType } = configuration;
    const { assetsPath           } = configuration.internals;

    const fullAssetsPath = Path.join( Bits.getRootPath(), assetsPath            );
    const fullOutputPath = Path.join( Bits.getRootPath(), buildPath, assetsPath );

    await FS.cp( fullAssetsPath, fullOutputPath, { recursive: true } );
}

async function ensureBuildFolder ( configuration )
{
    const { buildPath } = configuration;
    const fullBuildPath = Path.join( Bits.getRootPath(), buildPath );

    try
    {
        await Bits.checkPath( fullBuildPath, true );
    }
    catch ( error )
    {
        if ( error.code === "ENOENT" )
        {
            await FS.mkdir( fullBuildPath, { recursive: true } );
            console.info( "Build folder created." );
            return;
        }

        throw error;
    }
}

async function generateHTML ( configuration, loopState, dev = false )
{
    const { buildPath, dataFile } = configuration;

    Handlebars.registerHelper( "getFilePath" , ( ...args ) =>
    {
        args.pop();

        const path = args.join( "" );

        if ( loopState.library.scripts[ path ] ) return loopState.library.scripts[ path ];
        if ( loopState.library.styles [ path ] ) return loopState.library.styles [ path ];
        if ( loopState.scripts        [ path ] ) return loopState.scripts        [ path ];
        if ( loopState.styles         [ path ] ) return loopState.styles         [ path ];

        throw new Error( `Could not find path for ${ path }!` );
    } );

    Handlebars.registerPartial( await Bits.readTemplates() );
    await Bits.writeViews
    (
        Handlebars,
        configuration,
        loopState,
        dev
    );
}

function startServer ( configuration )
{
    const { buildPath } = configuration;
    const { devPort   } = configuration.internals;
    const fullBuildPath = Path.join( Bits.getRootPath(), buildPath );

    console.info( "[startServer] Starting..." );

    const server = HTTP.createServer( ( request, response ) =>
    {
        ServeHandler( request, response, { public: fullBuildPath } );
    } );

    server.listen( devPort, () =>
    {
        console.info( `[startServer] Listening on port ${ devPort }...` );
    } );
}

/**
 * @param {( changes ) => void} onChange
 * @see WatchPool class for all possible changes.
 */
function watchLoop ( configuration, onChange )
{
    const { assetsPath, sourcePath } = configuration.internals;

    const fullAssetsPath = Path.join( Bits.getRootPath(), assetsPath );
    const fullSourcePath = Path.join( Bits.getRootPath(), sourcePath );
    const watchPool      = new Bits.WatchPool( onChange );

    Chokidar
        .watch( [ fullAssetsPath, fullSourcePath ], { persistent: true, usePolling: true } )
        .on( "all", ( event, path ) =>
        {
            if ( event === "add" || event === "change" )
            {
                watchPool.push( path );
            }
        } );
}

const tests =
{
    getE2ELocation: () =>
    {
        return Bits.getE2ELocation();
    },

    runE2E: async ( configuration ) =>
    {
        const { buildPath }         = configuration;
        const { sourcePath, tests } = configuration.internals;
        const fullBuildPath         = Path.join( Bits.getRootPath(), buildPath );

        const server = HTTP.createServer( ( request, response ) =>
        {
            ServeHandler( request, response, { public: fullBuildPath } );
        } );

        server.listen( tests.e2ePort, () =>
        {
            console.info( `[startServer] Listening on port ${ tests.e2ePort }...` );
        } );

        const root   = Path.join( Bits.getRootPath(), sourcePath );
        const units  = await Bits.getTestFiles( root, tests.e2eTestIncludes );
        const runner = new Jasmine();
        const config =
        {
            random     : false,
            spec_dir   : sourcePath,
            spec_files : units
        };

        runner.loadConfig( config );

        const results = await runner.execute();
        console.info( results );
    },

    runWebBrowser: async ( configuration ) =>
    {
        const { dependencies      } = configuration;
        const { sourcePath, tests } = configuration.internals;

        const root   = Path.join( Bits.getRootPath(), sourcePath );
        const units  = await Bits.getTestFiles( root, tests.browserTestIncludes );

        const config =
        {
            projectBaseDir       : Bits.getRootPath(),
            srcDir               : sourcePath,
            specDir              : sourcePath,
            specFiles            : units,
            esmFilenameExtension : ".js",
            enableTopLevelAwait  : false,
            useHtmlReporter      : false,
            env                  :
            {
                stopSpecOnExpectationFailure : false,
                stopOnSpecFailure            : false,
                random                       : true
            },
            importMap:
            {
                moduleRootDir : ".",
                imports       : dependencies
            },
            listenAddress : "localhost",
            hostname      : "localhost",
            port          : tests.jasmineBrowserServerPort,
            browser       :
            {
                name : "headlessFirefox"
            }
        };

        const results = await JasmineBrowser.runSpecs( config );
        console.info( results );
    },
};


/**
 * Export namespaces
 */ 
const general = {
    expose,
    getConfiguration
}

const frontend = {
    buildLibrary,
    buildScripts,
    buildStyles,
    copyAssets,
    ensureBuildFolder,
    generateHTML,
    startServer,
    watchLoop,
    tests
}

export { general, frontend };
