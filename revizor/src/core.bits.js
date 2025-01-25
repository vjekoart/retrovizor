import Autoprefixer   from "autoprefixer";
import Babel          from "@babel/core";
import CSSNano        from "cssnano";
import { createHash } from "crypto";
import ESBuild        from "esbuild";
import FS             from "fs/promises";
import FSSync         from "fs";
import Path           from "path";
import PostCSS        from "postcss";
import { cwd }        from "node:process";
import URL            from "url";

import LibraryPostCSS          from "./plugins.postcss.js";
import TransformApplyImportMap from "./plugins.babel.js";

const _INTERNALS = JSON.parse( FSSync.readFileSync( Path.join( import.meta.dirname, "../internals.json" ), { encoding: "utf8" } ) );

export async function buildBundleLibrary ( configuration, dev = false )
{
    console.info( "Building bundle library..." );

    const { buildPath                 } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const outputBundlePath  = Path.join( getRootPath(), buildPath  , libraryBuild );
    const libraryScriptPath = Path.join( getRootPath(), libraryPath, "index.js"   );
    const libraryStylePath  = Path.join( getRootPath(), libraryPath, "index.css"  );

    const scriptName        = dev ? `index.js`  : `index.[hash].js`;
    const styleName         = dev ? `index.css` : `index.[hash].css`;

    const outputScript      = await compileBundle( libraryScriptPath, `${ libraryBuild }/${ scriptName }`, outputBundlePath, libraryPath, dev );
    const outputStyle       = await compileBundle( libraryStylePath , `${ libraryBuild }/${ styleName }` , outputBundlePath, libraryPath, dev );

    const fileMappings =
    {
        scripts :
        {
            "Library" : outputScript?.replace( buildPath, "" )
        },
        styles  :
        {
            "Library/index.css" : outputStyle?.replace( buildPath, "" )
        }
    }

    return fileMappings;
}

export async function buildBundleWorkers ( configuration, dev = false )
{
    console.info( "Building bundle workers..." );

    const { buildPath                 } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const outputPath = Path.join( getRootPath(), buildPath, libraryBuild );
    const dirPath    = Path.join( getRootPath(), libraryPath );
    const content    = await readDirectoryContent( dirPath, isWorkerFile );

    const fileMappings = {}

    for ( const file in content )
    {
        const fileName = (() =>
        {
            const units = file.split( "." );
            units.pop();
            return units.join( "." );
        })();

        const scriptName = dev ? `${ fileName }.js` : `${ fileName }.[hash].js`;
        const filePath   = Path.join( getRootPath(), libraryPath, file );
        const bundlePath = await compileBundle( filePath, `${ libraryBuild }/${ scriptName }`, outputPath, libraryPath, dev );

        fileMappings[ `Library${ file }` ] = bundlePath?.replace( buildPath, "" );
    }

    return fileMappings;
}

export async function buildNativeLibrary ( configuration, dev = false )
{
    console.info( "Building native library..." );

    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const dirPath = Path.join( getRootPath(), libraryPath );
    const content = await readDirectoryContent( dirPath );

    const toLibraryNameSpace = x => Path.normalize( `Library/${ x }` );

    const fileMappings =
    {
        scripts : {},
        styles  : {}
    }

    for ( const file in content )
    {
        const relativePath = Path.join( "/", libraryBuild, getCompiledPath( file, content[ file ], dev ) );

        isScriptFile( file ) && ( fileMappings.scripts[ toLibraryNameSpace( file ) ] = relativePath );
        isStyleFile ( file ) && ( fileMappings.styles [ toLibraryNameSpace( file ) ] = relativePath );
    }

    const outputBase = Path.join( getRootPath(), buildPath );

    for ( const file in content )
    {
        const param = { name : file, content : content[ file ] }

        let compiled;

        isScriptFile( file ) && ( compiled = await compileScript( param, null               , buildType, dev ) );
        isStyleFile ( file ) && ( compiled = await compileStyle ( param, fileMappings.styles, buildType, dev ) );

        let output;

        isScriptFile( file ) && ( output = fileMappings.scripts[ toLibraryNameSpace( file ) ] );
        isStyleFile ( file ) && ( output = fileMappings.styles [ toLibraryNameSpace( file ) ] );

        compiled?.code && await writeFile( Path.join( outputBase, output            ), compiled.code );
        compiled?.map  && await writeFile( Path.join( outputBase, `${ output }.map` ), compiled.map  );
    }

    if ( "Library/index.js" in fileMappings.scripts )
    {
        fileMappings.scripts[ "Library" ] = fileMappings.scripts[ "Library/index.js" ];
        delete fileMappings.scripts[ "Library/index.js" ];
    }

    return fileMappings;
}

export async function buildNativeWorkers ( configuration, scriptMappings, dev = false )
{
    console.info( "Building native workers..." );

    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const dirPath    = Path.join( getRootPath(), libraryPath );
    const outputBase = Path.join( getRootPath(), buildPath   );
    const content    = await readDirectoryContent( dirPath, isWorkerFile );

    const fileMappings = {}

    for ( const file in content )
    {
        const fileOutputPath = Path.join( "/", libraryBuild, getCompiledPath( file, content[ file ], dev ) );

        fileMappings[ `Library${ file }` ] = fileOutputPath;

        const param    = { name : file, content : content[ file ] }
        const compiled = await compileScript( param, scriptMappings, buildType, dev );

        compiled?.code && await writeFile( Path.join( outputBase, fileOutputPath            ), compiled.code );
        compiled?.map  && await writeFile( Path.join( outputBase, `${ fileOutputPath }.map` ), compiled.map  );
    }

    return fileMappings;
}

export function checkPath ( path, isDirectory = false )
{
    return new Promise( ( resolve, reject ) =>
    {
        FS.stat( path )
            .then( stat =>
            {
                if ( isDirectory && !stat.isDirectory() )
                {
                    reject( `[checkPath] Path '${ path }' is not a directory!` );
                    return;
                }

                resolve();
            })
            .catch( error => reject( error ) );
    });
}

/**
 * Creates an ESBuild bundle on desired location. Returns an output path of the compiled bundle.
 */
export async function compileBundle ( entryPoint, entryName, outputPath, libraryPath, dev = false )
{
    console.info( `Compiling bundle '${ Path.normalize( entryName ) }'...` );

    const config =
    {
        entryPoints : [ entryPoint ],
        entryNames  : entryName,
        bundle      : true,
        minify      : !dev,
        sourcemap   : true,
        outfile     : outputPath,
        metafile    : true,
        alias       :
        {
            "Library": Path.join( getRootPath(), libraryPath )
        }
    }

    if ( isScriptFile( entryName ) || isWorkerFile( entryName ) || isTestFile( entryName ) )
    {
        config.target = [ "es2020" ];
        config.format = "esm";
    }

    try
    {
        const build = await ESBuild.build( config );

        return Object.keys( build.metafile.outputs ).find( el => !el.endsWith( ".map" ) );
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ entryName }` );
        console.error( error.message, "\n" );
    }
}

/**
 * Compile a provided JavaScript code. Returns compiled code and source map.
 *
 * @param { name : string, content : string } file      - Object representing file that should be compiled.
 * @param { object                          } importMap - Object containing import maps.
 * @param { "native|native-library-bundle"  } buildType - One of the supported build types.
 * @param { boolean                         } dev       - Whether to create a development or a production build.
 *
 * @return { code : string, map : string }    Object containing compiled code and a source map.
 */
export async function compileScript ( file = {}, importMap = null, buildType = "native", dev = false )
{
    console.info( `Compiling script '${ file.name }'...` );

    const plugins = [];

    if ( importMap )
    {
        plugins.push( [ TransformApplyImportMap, { importMap } ] );
    }

    const babelOptions =
    {
        comments   : dev,
        minified   : !dev,
        presets    : [ "@babel/preset-env" ],
        sourceMaps : true,
        plugins
    }

    if ( buildType === "native" || buildType === "native-library-bundle" )
    {
        babelOptions.caller =
        {
            name              : "Library",
            supportsStaticESM : true
        }
    }

    let results;
    let code;

    try
    {
        results = await Babel.transformAsync( file.content, babelOptions );
        code    = results.code;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ file.name }` );
        console.error( error.message, "\n" );
        return;
    }

    const map = JSON.stringify( results.map ?? {} );

    return { code, map }
}

/**
 * Compile a provided CSS code. Returns compiled code and source map.
 *
 * @param { name : string, content : string } file      - Object representing file that should be compiled.
 * @param { object                          } importMap - Object containing import maps.
 * @param { "native|native-library-bundle"  } buildType - One of the supported build types.
 * @param { boolean                         } dev       - Whether to create a development or a production build.
 *
 * @return { code : string, map : string }    Object containing compiled code and a source map.
 */
export async function compileStyle ( file = {}, importMap = null, buildType = "native", dev = false )
{
    console.info( `Compiling style file '${ file.name }'...` );

    const postPlugins = [ Autoprefixer, LibraryPostCSS({ importMap }) ];

    if ( !dev )
    {
        postPlugins.push( CSSNano );
    }

    const options =
    {
        from : file.name,
        to   : file.name,
        map  : true
    }

    let results;
    let code;

    try
    {
        results = await PostCSS( postPlugins ).process( file.content, options );
        code    = results.css;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ file.name }` );
        console.error( error.message, "\n" );
        return;
    }

    const map = JSON.stringify( results.map ?? {} );

    return { code, map }
}

export async function ensureFolder ( path, clear = false )
{
    const createFolder = () => FS.mkdir( path, { recursive : true               } );
    const deleteFolder = () => FS.rm   ( path, { recursive : true, force : true } );

    try
    {
        await checkPath( path, true );

        if ( clear )
        {
            await deleteFolder();
            await createFolder();
        }
    }
    catch ( error )
    {
        if ( error.code === "ENOENT" )
        {
            await createFolder();
            return;
        }

        throw error;
    }
}

export function getCompiledPath ( path, content, dev )
{
    const pathUnits = Path.normalize( path ).split( "/" );
    let fileName    = pathUnits.pop();

    if ( !dev )
    {
        const units = fileName.split( "." );
        const ext   = units.pop();
        const hash  = createHash( "sha1" );

        hash.setEncoding( "hex" );
        hash.write( content );
        hash.end();

        fileName = units.concat( [ hash.read().slice( 0, 8 ), ext ] ).join( "." );
    }

    return pathUnits.concat( [ fileName ] ).join( "/" );
}

export function getE2ELocation ()
{
    return `http://${ _INTERNALS.tests.e2eHostname }:${ _INTERNALS.tests.e2ePort }/`;
}

/** "layout.homepage.html.hbs" to "layout.homepage" */
export function getPartialNameFromFileName ( file )
{
    const fileSplit  = file.split( "." );
    const extensions = [ "html", "hbs" ];

    extensions.forEach( x => fileSplit.splice( fileSplit.indexOf( x ), 1 ) );

    return fileSplit.join( "." );
}

export function getRootPath ()
{
    return process.cwd();
}

export async function getTestFiles ( path, includes )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files.filter( x => x.includes( includes ) );
}

export async function getTestLibraryMappings ( path, libraryPath )
{
    const files    = await FS.readdir( Path.join( path, libraryPath ), { recursive: true, withFileTypes: true } );
    const mappings = {}

    for ( const dirent of files )
    {
        if ( dirent.isDirectory() || !( isScriptFile( dirent.name ) || isWorkerFile( dirent.name ) ) )
        {
            continue;
        }

        const file = `${ dirent.path.replace( path, "" ).replace( `${ libraryPath }`, "" ) }/${ dirent.name }`;

        mappings[ Path.normalize( `Library/${ file }` ) ] = `${ dirent.path.replace( `${ path }/`, "" ) }/${ dirent.name }`;
    }

    if ( "Library/index.js" in mappings )
    {
        mappings[ "Library" ] = mappings[ "Library/index.js" ];
        delete mappings[ "Library/index.js" ];
    }

    return mappings;
}

export function isScriptFile ( file )
{
    if ( !file.endsWith( ".js" ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.testUtilityIncludes ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.browserTestIncludes ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.e2eTestIncludes ) )
    {
        return false;
    }
    if ( file.endsWith( ".worker.js" ) )
    {
        return false;
    }

    return true;
}

export function isStyleFile ( file )
{
    return file.endsWith( ".css" );
}

export function isTestFile ( file )
{
    if ( !file.endsWith( ".js" ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.browserTestIncludes ) )
    {
        return true;
    }
    if ( file.includes( _INTERNALS.tests.e2eTestIncludes ) )
    {
        return true;
    }

    return false;
}

export function isWorkerFile ( file )
{
    return file.endsWith( ".worker.js" );
}

/**
 * Reads a directory recursively and returns an object with file content in textual format.
 *
 * @param { string   } path   - Full path of the directory
 * @param { Function } filter - Optional filter function that filters file by name. 
 *
 * @return { [relativeFilePath] : "File content in text format" }
 */
export async function readDirectoryContent ( path, filter = null )
{
    const files   = await FS.readdir( path, { recursive: true, withFileTypes: true } );
    const content = {}

    for ( const dirent of files )
    {
        if ( dirent.isDirectory() )
        {
            continue;
        }

        const file = `${ dirent.path.replace( path, "" ) }/${ dirent.name }`;

        if ( filter instanceof Function && !filter( file ) )
        {
            continue;
        }

        content[ file ] = await FS.readFile( `${ dirent.path }/${ dirent.name }`, { encoding: "utf8" } );
    }

    return content;
}

export function registerHelpers ( Handlebars, configuration, loopState )
{
    const { buildType } = configuration;

    Handlebars.registerHelper( "ifBuildType", function ( buildType, options )
    {
        return configuration.buildType === buildType ? options.fn( this ) : options.inverse( this );
    });

    Handlebars.registerHelper( "getFilePath", ( ...args ) =>
    {
        args.pop();

        const path = args.join( "" );

        if ( loopState.library.scripts[ path ] ) return loopState.library.scripts[ path ];
        if ( loopState.library.styles [ path ] ) return loopState.library.styles [ path ];
        if ( loopState.scripts        [ path ] ) return loopState.scripts        [ path ];
        if ( loopState.styles         [ path ] ) return loopState.styles         [ path ];

        throw new Error( `Could not find path for ${ path }!` );
    });
}

export async function registerPartials ( Handlebars )
{
    const
    {
        indexTemplate,
        layoutPrefix,
        templatesPath
    } = _INTERNALS;

    const fullIndexPath     = Path.join( getRootPath(), indexTemplate );
    const fullTemplatesPath = Path.join( getRootPath(), templatesPath );

    const partials =
    {
        index : await FS.readFile( fullIndexPath, { encoding : "utf8" } )
    }

    const templateFiles     = await FS.readdir( fullTemplatesPath );
    const htmlTemplateFiles = templateFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlTemplateFiles )
    {
        if ( file.startsWith( layoutPrefix ) )
        {
            const name    = getPartialNameFromFileName( file );
            const content = await FS.readFile( Path.join( fullTemplatesPath, file ), { encoding : "utf8" } );

            partials[ name ] = content;
        }
    }

    Handlebars.registerPartial( partials );
}

export function validateConfiguration ( configuration )
{
    const requiredFields =
    [
        "buildPath",
        "buildType"
    ];

    for ( const field of requiredFields )
    {
        if ( typeof configuration[ field ] === "undefined" )
            throw new Error( `Configuration: missing '${ field }'!` );
    }

    if ( typeof configuration.buildPath !== "string" )
        throw new Error( `Configuration: 'buildPath' must be a string!` );

    const buildTypeValues = [ "native", "native-library-bundle" ];

    if ( buildTypeValues.indexOf( configuration.buildType ) === -1 )
        throw new Error( `Configuration: 'buildType' must be one of the following: ${ buildTypeValues }` );


    const optionalFields =
    [
        "dataFile",
        "nativeDependencies"
    ];

    if ( typeof configuration.dataFile !== "string" )
        throw new Error( `Configuration: 'dataFile' must be a string!` );

    if ( typeof configuration.nativeDependencies !== "object" )
        throw new Error( `Configuration: 'nativeDependencies' must be an object!` );
}

export async function writeFile ( path, content )
{
    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path, content );
}

export async function writeViews ( Handlebars, configuration, fileMappings, dev )
{
    console.info( `Writing views...` );

    const
    {
        buildPath,
        dataFile
    } = configuration;

    const { viewsPath }    = _INTERNALS;

    const fullBuildPath    = Path.join( getRootPath(), buildPath );
    const fullViewsPath    = Path.join( getRootPath(), viewsPath );
    const fullDataFilePath = Path.join( getRootPath(), dataFile  );

    const data             = dataFile ? JSON.parse( await FS.readFile( fullDataFilePath, { encoding: "utf8" } ) ) : {};
    const templateData     = { data, configuration, fileMappings }
    const viewFiles        = await FS.readdir( fullViewsPath, { recursive: true } );
    const htmlViewFiles    = viewFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlViewFiles )
    {
        const content  = await FS.readFile( Path.join( fullViewsPath, file ), { encoding: "utf8" } );
        const fileName = file.endsWith( ".hbs" ) && file.replace( ".hbs", "" ) || file;

        try
        {
            const template = Handlebars.compile( content );
            await writeFile( Path.join( fullBuildPath, fileName ), template( templateData ) );
        }
        catch ( error )
        {
            console.info ( `\n[FILE] ${ file }` );
            console.error( error.message, "\n"  );
            return;
        }
    }
}

export class WatchPool
{
    constructor ( onChange )
    {
        this.delayBeforePublishingChanges = 1000;
        this.timerId = null;
        this.changes =
        {
            buildLibrary : false,
            buildStyles  : false,
            buildScripts : false,
            copyAssets   : false,
            generateHTML : false
        }

        this.onChange = onChange;
    }

    publishChanges ()
    {
        this.onChange( this.changes );
        this.changes =
        {
            buildLibrary : false,
            buildStyles  : false,
            buildScripts : false,
            copyAssets   : false,
            generateHTML : false
        }
    }

    push ( path )
    {
        this.resetTimer();

        if ( path.includes( "/assets/" ) )
        {
            this.changes.copyAssets = true;
            return;
        }
        if ( path.includes( "/library/" ) )
        {
            this.changes.buildLibrary = true;
            return;
        }
        if ( path.endsWith( ".html" ) || path.endsWith( ".hbs" ) )
        {
            this.changes.generateHTML = true;
        }
        if ( path.endsWith( ".css" ) )
        {
            this.changes.buildStyles = true;
        }
        if ( path.endsWith( ".js" ) )
        {
            this.changes.buildScripts = true;
        }
    }

    resetTimer ()
    {
        if ( this.timerId )
        {
            clearTimeout( this.timerId );
        }

        this.timerId = setTimeout
        (
            () =>
            {
                this.publishChanges();
                this.timerId = null;
            },
            this.delayBeforePublishingChanges
        );
    }
}
