import PostCSS from "postcss";

/* Extracts "styles/file.css" from "url( "styles/file.css" )" */
function getKey ( value )
{
    const matches = value.matchAll(/^url\(\s+["|'](.+)["|']\s+\)$/g);

    for ( const match of matches )
    {
        return match[ 1 ];
    }
}

const exportObject = ( options = {} ) =>
{
    return {
        postcssPlugin : "IMPORT-MAPPER-PLUGIN",
        AtRule:
        {
            import : rule =>
            {
                const key = getKey( rule.params );

                if ( !( key in options.fileMappings ) )
                {
                    return;
                }

                rule.params = `url("${ options.fileMappings[ key ] }")`;
            }
        }
    }
}

exportObject.postcss = true;

export default exportObject;
