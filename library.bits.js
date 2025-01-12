import Autoprefixer   from "autoprefixer";
import Babel          from "@babel/core";
import CSSNano        from "cssnano";
import { createHash } from "crypto";
import FS             from "fs/promises";
import FSSync         from "fs";
import Path           from "path";
import PostCSS        from "postcss";
import { cwd }        from "node:process";
import URL            from "url";

import LibraryPostCSS from "./library.postcss.js";

const _INTERNALS = JSON.parse( FSSync.readFileSync( ".internals.json", { encoding: "utf8" } ) );

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
    const babelOptions =
    {
        compact    : !dev,
        presets    : [ "@babel/preset-env" ],
        sourceMaps : true
    };

    if ( buildType === "native" )
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

export async function readTemplates ()
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

    return partials;
}

export async function writeFile ( path, content )
{
    console.info( `Writing '...${ path.replace( process.cwd(), "" ) }' ...` );

    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path, content );
}

export async function writeViews ( Handlebars, configuration, fileMappings, dev )
{
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
        const template = Handlebars.compile( content );
        const fileName = file.endsWith( ".hbs" ) && file.replace( ".hbs", "" ) || file;

        await writeFile( Path.join( fullBuildPath, fileName ), template( templateData ) );
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
