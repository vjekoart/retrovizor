function TransformApplyImportMap ( options )
{
    return {
        visitor :
        {
            ImportDeclaration : ( path, state ) =>
            {
                if ( typeof state.opts?.importMap !== "object" )
                {
                    throw new Error( "TransformApplyImportMap: missing importMap object!" );
                }

                if ( path.node?.source?.value in state.opts.importMap )
                {
                    path.node.source.value = state.opts.importMap[ path.node.source.value ];
                }
            }
        }
    }
}

export default TransformApplyImportMap;
