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

import LibraryPostCSS from "./library.postcss.js";

const _INTERNALS = JSON.parse( FSSync.readFileSync( ".internals.json", { encoding: "utf8" } ) );

export async function buildNativeLibrary ( configuration, dev = false )
{
    console.info( "Building a native library..." );

    const { buildPath, buildType      } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const dirPath = Path.join( getRootPath(), libraryPath );
    const content = await readDirectoryContent( dirPath );

    const toLibraryNameSpace = x => Path.normalize( `Library/${ x }` );

    const fileMappings =
    {
        scripts : {},
        styles  : {}
    };

    for ( const file in content )
    {
        const relativePath = Path.join( "/", libraryBuild, getCompiledPath( file, content[ file ], dev ) );

        isScriptFile( file ) && ( fileMappings.scripts[ toLibraryNameSpace( file ) ] = relativePath );
        isStyleFile ( file ) && ( fileMappings.styles [ toLibraryNameSpace( file ) ] = relativePath );
    }

    const outputBase = Path.join( getRootPath(), buildPath );

    for ( const file in content )
    {
        let compiled;

        isScriptFile( file ) && ( compiled = await compileScript( file, content[ file ], buildType, dev ) );
        isStyleFile ( file ) && ( compiled = await compileStyle ( file, file, content[ file ], fileMappings.styles, buildType, dev ) );

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

export async function buildBundleLibrary ( configuration, dev = false )
{
    console.info( "Building a bundle library..." );

    const { buildPath                 } = configuration;
    const { libraryBuild, libraryPath } = configuration.internals;

    const outputBundlePath  = Path.join( getRootPath(), buildPath, libraryBuild );

    const libraryScriptPath = Path.join( getRootPath(), libraryPath, "index.js"  );
    const libraryStylePath  = Path.join( getRootPath(), libraryPath, "index.css" );

    const scriptName  = dev ? `index.js`  : `index.[hash].js`;
    const styleName   = dev ? `index.css` : `index.[hash].css`;

    const scriptBuild = await ESBuild.build( {
        entryPoints : [ libraryScriptPath ],
        entryNames  : `${ libraryBuild }/${ scriptName }`,
        bundle      : true,
        minify      : !dev,
        sourcemap   : true,
        target      : [ "es2020" ],
        outfile     : outputBundlePath,
        format      : "esm",
        metafile    : true,
        alias       :
        {
            "Library": Path.join( getRootPath(), libraryPath )
        }
    } );

    const styleBuild = await ESBuild.build( {
        entryPoints : [ libraryStylePath ],
        entryNames  : `${ libraryBuild }/${ styleName }`,
        bundle      : true,
        minify      : !dev,
        sourcemap   : true,
        outfile     : outputBundlePath,
        metafile    : true,
        alias       :
        {
            "Library": Path.join( getRootPath(), libraryPath )
        }
    } );

    const getOutputFile = files => Object.keys( files ).find( el => !el.endsWith( ".map" ) );

    const outputScript  = getOutputFile( scriptBuild.metafile.outputs );
    const outputStyle   = getOutputFile( styleBuild.metafile.outputs  );

    const fileMappings  =
    {
        scripts :
        {
            "Library" : outputScript.replace( buildPath, "" )
        },
        styles  :
        {
            "Library/index.css" : outputStyle.replace( buildPath, "" )
        }
    };

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
            } )
            .catch( error => reject( error ) );
    } );
}

export async function compileScript ( from, content, buildType, dev = false )
{
    console.info( `Compiling a script '${ from }'...` );

    const babelOptions =
    {
        compact    : !dev,
        presets    : [ "@babel/preset-env" ],
        sourceMaps : true
    };

    if ( buildType === "native" || buildType === "native-library-bundle" )
    {
        babelOptions.caller =
        {
            name              : "Library",
            supportsStaticESM : true
        };
    }

    let results;
    let code;

    try
    {
        results = await Babel.transformAsync( content, babelOptions );
        code    = results.code;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ from }` );
        console.error( error.message, "\n" );
        return;
    }

    const map = results.map?.toString();

    return { code, map };
}

export async function compileStyle ( from, to, content, fileMappings, buildType, dev = false )
{
    console.info( `Compiling a style file '${ from }'...` );

    const postPlugins = [ Autoprefixer, LibraryPostCSS( { fileMappings } ) ];

    if ( !dev )
    {
        postPlugins.push( CSSNano );
    }

    const options =
    {
        from,
        to,
        map : true
    };

    let results;
    let code;

    try
    {
        results = await PostCSS( postPlugins ).process( content, options );
        code    = results.css;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ from }` );
        console.error( error.message, "\n" );
        return;
    }

    const map = results.map?.toString();

    return { code, map };
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
    return Path.dirname( URL.fileURLToPath( import.meta.url ) );
}

export async function getTestFiles ( path, includes )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files.filter( x => x.includes( includes ) );
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

    return true;
}

export function isStyleFile ( file )
{
    return file.endsWith( ".css" );
}

/**
 * Returns { [relativeFilePath] : "File content..." }
 */
export async function readDirectoryContent ( path, filter = null )
{
    const files   = await FS.readdir( path, { recursive: true, withFileTypes: true } );
    const content = {};

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
    } );

    Handlebars.registerHelper( "getFilePath", ( ...args ) =>
    {
        args.pop();

        const path = args.join( "" );

        if ( loopState.library.scripts[ path ] ) return loopState.library.scripts[ path ];
        if ( loopState.library.styles [ path ] ) return loopState.library.styles [ path ];
        if ( loopState.scripts        [ path ] ) return loopState.scripts        [ path ];
        if ( loopState.styles         [ path ] ) return loopState.styles         [ path ];

        throw new Error( `Could not find path for ${ path }!` );
    } );
}

export async function registerPartials ( Handlebars )
{
    const {
        indexTemplate,
        layoutPrefix,
        templatesPath
    } = _INTERNALS;

    const fullIndexPath     = Path.join( getRootPath(), indexTemplate );
    const fullTemplatesPath = Path.join( getRootPath(), templatesPath );

    const partials =
    {
        index : await FS.readFile( fullIndexPath, { encoding : "utf8" } )
    };

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

export async function writeFile ( path, content )
{
    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path, content );
}

export async function writeViews ( Handlebars, configuration, fileMappings, dev )
{
    console.info( `Writing views...` );

    const { buildPath, dataFile } = configuration;
    const { viewsPath }    = _INTERNALS;

    const fullBuildPath    = Path.join( getRootPath(), buildPath );
    const fullViewsPath    = Path.join( getRootPath(), viewsPath );
    const fullDataFilePath = Path.join( getRootPath(), dataFile  );

    const data             = dataFile ? JSON.parse( await FS.readFile( fullDataFilePath, { encoding: "utf8" } ) ) : {};
    const templateData     = { data, configuration, fileMappings };
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
            console.error( error.message, "\n" );
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

        this.timerId = setTimeout(
            () =>
            {
                this.publishChanges();
                this.timerId = null;
            },
            this.delayBeforePublishingChanges
        );
    }
}
