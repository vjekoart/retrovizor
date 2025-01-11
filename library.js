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
    const internals     = JSON.parse( FSSync.readFileSync( ".internals.json",    { encoding: "utf8" } ) );
    const configuration = JSON.parse( FSSync.readFileSync( "configuration.json", { encoding: "utf8" } ) );

    return Object.assign( configuration, { internals } );
}

async function buildLibrary ( configuration, dev = false )
{
    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const fullLibraryPath = Path.join( Bits.getRootPath(), libraryPath );
    const libraryFiles    = await FS.readdir( fullLibraryPath, { recursive: true, withFileTypes: true } );
    const fileMappings    =
    {
        scripts : {},
        styles  : {}
    };

    for ( const dirent of libraryFiles )
    {
        if ( dirent.isDirectory() )
        {
            continue;
        }

        const file       = `${ dirent.path.replace( fullLibraryPath, "" ) }/${ dirent.name }`;
        const inputPath  = Path.join( fullLibraryPath, file );
        const outputPath = Path.join( Bits.getRootPath(), buildPath, libraryBuild, file );

        if ( file.endsWith( ".css" ) )
        {
            const fileName = await Bits.compileAndMoveStyle( inputPath, outputPath, buildType, dev );
            const filePath = Bits.replaceFileName( Path.normalize( `/${ libraryBuild }/${ file }` ), fileName );
            fileMappings.styles[ Path.normalize( `Library/${ file }` ) ] = filePath;
        }
        if ( Bits.isScriptFile( file ) )
        {
            const fileName = await Bits.compileAndMoveScript( inputPath, outputPath, buildType, dev );
            const filePath = Bits.replaceFileName( Path.normalize( `/${ libraryBuild }/${ file }` ), fileName );
            fileMappings.scripts[ Path.normalize( `Library/${ file }` ) ] = filePath;
        }
    }

    return fileMappings;
}

async function buildScripts ( configuration, dev = false )
{
    const { buildPath, buildType } = configuration;
    const {
        indexScript,
        indexScriptBuild,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath     = Path.join( Bits.getRootPath(), indexScript      );
    const fullBuildPath     = Path.join( Bits.getRootPath(), buildPath        );
    const fullOutputPath    = Path.join( fullBuildPath     , indexScriptBuild ); 
    const fullTemplatesPath = Path.join( Bits.getRootPath(), templatesPath    );
    const fullViewsPath     = Path.join( Bits.getRootPath(), viewsPath        );

    const indexFile = { input : fullIndexPath, output : fullOutputPath };

    const templates = await Bits.getTargetFiles(
        fullTemplatesPath,
        {
            filter : x => Bits.isScriptFile( x ),
            input  : x => Path.join( fullTemplatesPath, x ),
            output : x => Path.join( fullBuildPath, templatesBuild, x )
        }
    );

    const views = await Bits.getTargetFiles(
        fullViewsPath,
        {
            filter : x => Bits.isScriptFile( x ),
            input  : x => Path.join( fullViewsPath, x ),
            output : x => Path.join( fullBuildPath, x )
        }
    );

    for ( const file of [ indexFile, ...templates, ...views ] )
    {
        await Bits.compileAndMoveScript( file.input, file.output, buildType, dev );
    }
}

async function buildStyles ( configuration, dev = false )
{
    const { buildPath, buildType } = configuration;
    const {
        indexStyle,
        indexStyleBuild,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath     = Path.join( Bits.getRootPath(), indexStyle      );
    const fullBuildPath     = Path.join( Bits.getRootPath(), buildPath       );
    const fullOutputPath    = Path.join( fullBuildPath     , indexStyleBuild );
    const fullTemplatesPath = Path.join( Bits.getRootPath(), templatesPath   );
    const fullViewsPath     = Path.join( Bits.getRootPath(), viewsPath       );

    const indexFile = { input : fullIndexPath, output : fullOutputPath };

    const templates = await Bits.getTargetFiles(
        fullTemplatesPath,
        {
            filter : x => x.endsWith( ".css" ),
            input  : x => Path.join( fullTemplatesPath, x ),
            output : x => Path.join( fullBuildPath, templatesBuild, x )
        }
    );

    const views = await Bits.getTargetFiles(
        fullViewsPath,
        {
            filter : x => x.endsWith( ".css" ),
            input  : x => Path.join( fullViewsPath, x ),
            output : x => Path.join( fullBuildPath, x )
        }
    );

    for ( const file of [ indexFile, ...templates, ...views ] )
    {
        await Bits.compileAndMoveStyle( file.input, file.output, buildType, dev );
    }
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

async function generateHTML ( configuration, libraryMappings, dev = false )
{
    const { buildPath, dataFile } = configuration;

    Handlebars.registerHelper( "getFilePath" , ( ...args ) =>
    {
        args.pop();

        if ( dev )
        {
            return args.join( "" );
        }

        return Bits.getHashFileName( configuration, args.join( "" ) );
    } );

    Handlebars.registerPartial( await Bits.readTemplates() );
    await Bits.writeViews
    (
        Handlebars,
        configuration,
        libraryMappings,
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