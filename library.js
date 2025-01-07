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
    console.info( "[buildLibrary] Starting..." );

    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const fullLibraryPath = Path.join( Bits.getRootPath(), libraryPath );
    const libraryFiles    = await FS.readdir( fullLibraryPath, { recursive: true } );
    const compilePromises = [];

    for ( const file of libraryFiles )
    {
        const inputPath  = Path.join( fullLibraryPath, file );
        const outputPath = Path.join( Bits.getRootPath(), buildPath, libraryBuild, file );

        if ( file.endsWith( ".css" ) )
        {
            compilePromises.push( Bits.compileAndMoveStyle( inputPath, outputPath, buildType, dev ) );
        }
        if ( Bits.isScriptFile( file ) )
        {
            compilePromises.push( Bits.compileAndMoveScript( inputPath, outputPath, buildType, dev ) );
        }
    }

    await Promise.all( compilePromises );

    console.info( "[buildLibrary] Done." );
}

async function buildScripts ( configuration, dev = false )
{
    console.info( "[buildScripts] Starting Babel process..." );

    const { buildPath, buildType } = configuration;
    const {
        indexScript,
        indexScriptBuild,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath  = Path.join( Bits.getRootPath(), indexScript );
    const fullBuildPath  = Path.join( Bits.getRootPath(), buildPath   );
    const fullOutputPath = Path.join( fullBuildPath, indexScriptBuild ); 

    await Bits.compileAndMoveScript( fullIndexPath, fullOutputPath, buildType, dev );

    // View and template scripts
    const fullTemplatesPath   = Path.join( Bits.getRootPath(), templatesPath );
    const fullViewsPath       = Path.join( Bits.getRootPath(), viewsPath     );
    const templateFiles       = await FS.readdir( fullTemplatesPath );
    const viewFiles           = await FS.readdir( fullViewsPath, { recursive: true } );
    const scriptTemplateFiles = templateFiles
                                    .filter( x => Bits.isScriptFile( x ) )
                                    .map( x =>
                                    {
                                        return {
                                            input  : Path.join( fullTemplatesPath, x ),
                                            output : Path.join( fullBuildPath, templatesBuild, x )
                                        }
                                    } );
    const scriptViewFiles     = viewFiles
                                    .filter( x => Bits.isScriptFile( x ) )
                                    .map( x =>
                                    {
                                        return {
                                            input  : Path.join( fullViewsPath, x ),
                                            output : Path.join( fullBuildPath, x )
                                        }
                                    } );

    const filesToBuild = scriptTemplateFiles.concat( scriptViewFiles );

    for ( const file of filesToBuild )
    {
        await Bits.compileAndMoveScript( file.input, file.output, buildType, dev );
    }

    console.info( "[buildScripts] Done." );
}

async function buildStyles ( configuration, dev = false )
{
    console.info( "[buildStyles] Starting PostCSS process..." );

    const { buildPath, buildType } = configuration;
    const {
        indexStyle,
        indexStyleBuild,
        templatesBuild,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullIndexPath  = Path.join( Bits.getRootPath(), indexStyle );
    const fullBuildPath  = Path.join( Bits.getRootPath(), buildPath  );
    const fullOutputPath = Path.join( fullBuildPath, indexStyleBuild );

    await Bits.compileAndMoveStyle( fullIndexPath, fullOutputPath, buildType, dev );

    // View and template styles
    const fullTemplatesPath  = Path.join( Bits.getRootPath(), templatesPath );
    const fullViewsPath      = Path.join( Bits.getRootPath(), viewsPath     );
    const templateFiles      = await FS.readdir( fullTemplatesPath );
    const viewFiles          = await FS.readdir( fullViewsPath, { recursive: true } );
    const styleTemplateFiles = templateFiles
                                    .filter( x => x.endsWith( ".css" ) )
                                    .map( x =>
                                    {
                                        return {
                                            input  : Path.join( fullTemplatesPath, x ),
                                            output : Path.join( fullBuildPath, templatesBuild, x )
                                        }
                                    } );
    const styleViewFiles     = viewFiles
                                    .filter( x => x.endsWith( ".css" ) )
                                    .map( x =>
                                    {
                                        return {
                                            input  : Path.join( fullViewsPath, x ),
                                            output : Path.join( fullBuildPath, x )
                                        }
                                    } );

    const filesToBuild = styleTemplateFiles.concat( styleViewFiles );

    for ( const file of filesToBuild )
    {
        await Bits.compileAndMoveStyle( file.input, file.output, buildType, dev );
    }

    console.info( "[buildStyles] Done." );
}

async function copyAssets ( configuration )
{
    console.info( "[copyAssets] Identifying and copying asset files..." );

    const { buildPath, buildType } = configuration;
    const { assetsPath           } = configuration.internals;

    const fullAssetsPath = Path.join( Bits.getRootPath(), assetsPath            );
    const fullOutputPath = Path.join( Bits.getRootPath(), buildPath, assetsPath );

    await FS.cp( fullAssetsPath, fullOutputPath, { recursive: true } );

    console.info( "[copyAssets] Done." );
}

async function ensureBuildFolder ( configuration )
{
    console.info( "[ensureBuildPath] Checking build folder..." );

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
            console.info( "[ensureBuildPath] Build folder created." );
            return;
        }

        throw error;
    }

    console.info( "[ensureBuildPath] Done." );
}

async function generateHTML ( configuration, dev = false )
{
    console.info( "[generateHTML] Starting template generation..." );

    const { buildPath, dataFile } = configuration;
    const {
        indexTemplate,
        layoutPrefix,
        templatesPath,
        viewsPath
    } = configuration.internals;

    const fullBuildPath     = Path.join( Bits.getRootPath(), buildPath     );
    const fullTemplatesPath = Path.join( Bits.getRootPath(), templatesPath );
    const fullViewsPath     = Path.join( Bits.getRootPath(), viewsPath     );
    const fullIndexPath     = Path.join( Bits.getRootPath(), indexTemplate );
    const fullDataFilePath  = Path.join( Bits.getRootPath(), dataFile      );

    console.info( "[generateHTML] Registering Handlebars partials..." );

    const partials = {
        index: await FS.readFile( fullIndexPath, { encoding: "utf8" } )
    };

    const templateFiles     = await FS.readdir( fullTemplatesPath );
    const htmlTemplateFiles = templateFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlTemplateFiles )
    {
        if ( file.startsWith( layoutPrefix ) )
        {
            const name    = Bits.getPartialNameFromFileName( file );
            const content = await FS.readFile( Path.join( fullTemplatesPath, file ), { encoding: "utf8" } );

            partials[ name ] = content;
        }
    }

    Handlebars.registerPartial( partials );

    console.info( "[generateHTML] Compiling views..." );

    const data          = dataFile ? JSON.parse( await FS.readFile( fullDataFilePath, { encoding: "utf8" } ) ) : {};
    const templateData  = { data, configuration };
    const viewFiles     = await FS.readdir( fullViewsPath, { recursive: true } );
    const htmlViewFiles = viewFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlViewFiles )
    {
        const content  = await FS.readFile( Path.join( fullViewsPath, file ), { encoding: "utf8" } );
        const template = Handlebars.compile( content );
        const fileName = file.endsWith( ".hbs" ) && file.replace( ".hbs", "" ) || file;

        await Bits.writeFile( Path.join( fullBuildPath, fileName ), template( templateData ) );
    }

    console.info( "[generateHTML] Done." );
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
    console.info( "[watchLoop] Starting the loop..." );

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
                console.info( "[watchLoop]", event, path );
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