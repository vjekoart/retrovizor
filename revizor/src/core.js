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

import * as Bits      from "./core.bits.js";


/**
 * Expose functions of the component to the CLI (and other parts of the codebase in the future).
 * 
 * @param { Array<Function> } functions - Array of functions to expose.
 * @param { Function        } fallback  - Function to execute if none was provided when called via CLI.
 */
function expose ( functions, fallback )
{
    const exposed = {}

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
    const internals     = JSON.parse( FSSync.readFileSync( Path.join( import.meta.dirname, "../internals.json" ), { encoding: "utf8" } ) );
    const configuration = JSON.parse( FSSync.readFileSync( "configuration.json"                                 , { encoding: "utf8" } ) );

    Bits.validateConfiguration( configuration );

    return Object.assign( configuration, { internals } );
}

/**
 * Main entry point for building a library. Based on the `buildType` different compile functions
 * will be executed.
 *
 * @param { Configuration } configuration
 * @param { boolean       } dev
 */
async function buildLibrary ( configuration, dev = false )
{
    let fileMappings = {}

    configuration.buildType === "native"                && ( fileMappings = await Bits.buildNativeLibrary( configuration, dev ) );
    configuration.buildType === "native-library-bundle" && ( fileMappings = await Bits.buildBundleLibrary( configuration, dev ) );

    let workerMappings = {}

    configuration.buildType === "native"                && ( workerMappings = await Bits.buildNativeWorkers( configuration, fileMappings.scripts, dev ) );
    configuration.buildType === "native-library-bundle" && ( workerMappings = await Bits.buildBundleWorkers( configuration, dev ) );

    fileMappings.scripts = Object.assign( fileMappings.scripts, workerMappings );

    return fileMappings;
}

/**
 * Main entry point for building template and view scripts. These script files are always built like
 * a native ES module intended for usage inside a web browser.
 *
 * @param { Configuration } configuration
 * @param { boolean       } dev
 */
async function buildScripts ( configuration, dev = false )
{
    const { buildPath } = configuration;
    const
    {
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
    }

    Object
        .keys( contentTemplates )
        .forEach( x => content[ Path.normalize( `templates/${ x }` ) ] = contentTemplates[ x ] );

    Object
        .keys( contentViews )
        .forEach( x => content[ Path.normalize( `views/${ x }` ) ] = contentViews[ x ] );

    const fileMappings = {}

    for ( const file in content )
    {
        const relativePath = Path.join( "/", Bits.getCompiledPath( file, content[ file ], dev ) );

        fileMappings[ file ] = relativePath.replace( "views/", "" );
    }

    const outputBase = Path.join( Bits.getRootPath(), buildPath );

    for ( const file in content )
    {
        const param    = { name : file, content : content[ file ] }
        const compiled = await Bits.compileScript( param, null, "native", dev );
        const output   = fileMappings[ file ];

        compiled?.code && await Bits.writeFile( Path.join( outputBase, output            ), compiled.code );
        compiled?.map  && await Bits.writeFile( Path.join( outputBase, `${ output }.map` ), compiled.map  );
    }

    return fileMappings;
}

/**
 * Main entry point for building template and view styles. These style files are always built like
 * using a `compileStyle` function.
 *
 * @param { Configuration } configuration
 * @param { name : string } additionalMappings - Object with import mappings for CSS files.
 * @param { boolean       } dev
 */
async function buildStyles ( configuration, additionalMappings, dev = false )
{
    const { buildPath } = configuration;
    const
    {
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
    }

    Object
        .keys( contentTemplates )
        .forEach( x => content[ Path.normalize( `templates/${ x }` ) ] = contentTemplates[ x ] );

    Object
        .keys( contentViews )
        .forEach( x => content[ Path.normalize( `views/${ x }` ) ] = contentViews[ x ] );

    const fileMappings = {}

    for ( const file in content )
    {
        const relativePath = Path.join( "/", Bits.getCompiledPath( file, content[ file ], dev ) );

        fileMappings[ file ] = relativePath.replace( "views/", "" );
    }

    const outputBase = Path.join( Bits.getRootPath(), buildPath );

    for ( const file in content )
    {
        const param    = { name : file, content : content[ file ] }
        const compiled = await Bits.compileStyle( param, additionalMappings, "native", dev );
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

async function ensureBuildFolder ( configuration, clear = false )
{
    const { buildPath } = configuration;
    const fullBuildPath = Path.join( Bits.getRootPath(), buildPath );

    await Bits.ensureFolder( fullBuildPath, clear );
}

async function generateHTML ( configuration, loopState, dev = false )
{
    await Bits.registerHelpers ( Handlebars, configuration, loopState );
    await Bits.registerPartials( Handlebars );

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

    console.info( "Starting server..." );

    const server = HTTP.createServer(( request, response ) =>
    {
        ServeHandler( request, response, { public: fullBuildPath } );
    });

    server.listen( devPort, () =>
    {
        console.info( `Server listening on port ${ devPort }...` );
    });
}

/**
 * Main watch loop used in the dev mode. Watches for file changes, and informs the callback
 * about a change type.
 *
 * See WatchPool class for a list of all possible changes.
 *
 * @param { Configuration       } configuration
 * @param { ( changes ) => void } onChange
 */
function watchLoop ( configuration, onChange )
{
    const { assetsPath, sourcePath } = configuration.internals;

    const fullAssetsPath = Path.join( Bits.getRootPath(), assetsPath );
    const fullSourcePath = Path.join( Bits.getRootPath(), sourcePath );
    const watchPool      = new Bits.WatchPool( onChange );

    Chokidar
        .watch([ fullAssetsPath, fullSourcePath ], { persistent : true, usePolling : true })
        .on( "all", ( event, path ) =>
        {
            if ( event === "add" || event === "change" )
            {
                watchPool.push( path );
            }
        });
}

const tests =
{
    getE2ELocation : () =>
    {
        return Bits.getE2ELocation();
    },

    runE2E : async configuration =>
    {
        const { buildPath }         = configuration;
        const { sourcePath, tests } = configuration.internals;
        const fullBuildPath         = Path.join( Bits.getRootPath(), buildPath );

        const server = HTTP.createServer(( request, response ) =>
        {
            ServeHandler( request, response, { public : fullBuildPath } );
        });

        server.listen( tests.e2ePort, () =>
        {
            console.info( `Server listening on port ${ tests.e2ePort }...` );
        });

        const root   = Path.join( Bits.getRootPath(), sourcePath );
        const units  = await Bits.getTestFiles( root, tests.e2eTestIncludes );
        const runner = new Jasmine();
        const config =
        {
            random     : false,
            spec_dir   : sourcePath,
            spec_files : units
        }

        runner.loadConfig( config );

        const results = await runner.execute();

        console.info( results );
    },

    runWebBrowser : async configuration =>
    {
        const
        {
            buildPath,
            nativeDependencies
        } = configuration;

        const
        {
            libraryPath,
            sourcePath,
            tests
        } = configuration.internals;

        const root            = Path.join( Bits.getRootPath(), sourcePath );
        const units           = await Bits.getTestFiles( root, tests.browserTestIncludes );
        const libraryMappings = await Bits.getTestLibraryMappings( Bits.getRootPath(), libraryPath );

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
                imports       : Object.assign( nativeDependencies, libraryMappings )
            },
            listenAddress : "localhost",
            hostname      : "localhost",
            port          : tests.jasmineBrowserServerPort,
            browser       :
            {
                name : "headlessFirefox"
            }
        }

        if ( configuration.buildType === "native-library-bundle" )
        {
            console.info( "Compiling test specs before execution..." );

            const testBuildPath     = Path.join( Bits.getRootPath(), buildPath, tests.browserTestBuild );
            const compiledSpecFiles = [];

            await Bits.ensureFolder( testBuildPath, true );

            for ( const spec of config.specFiles )
            {
                const entry     = Path.join( root, spec );
                const entryName = `${ tests.browserTestBuild }/${ spec.split( "/" ).pop() }`;
                const compiled  = await Bits.compileBundle( entry, entryName, testBuildPath, libraryPath, true );

                compiledSpecFiles.push( compiled.split( "/" ).pop() );
            }

            config.specDir   = testBuildPath;
            config.specFiles = compiledSpecFiles;

            console.info( "Compiled." );
        }

        const results = await JasmineBrowser.runSpecs( config );

        console.info( results );
    }
}


/**
 * Export namespaces
 */ 
const general =
{
    expose,
    getConfiguration
}

const frontend =
{
    buildLibrary,
    buildScripts,
    buildStyles,
    copyAssets,
    ensureBuildFolder,
    generateHTML,
    startServer,
    tests,
    watchLoop
}

export { general, frontend }
