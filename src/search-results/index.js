//
function Result( props ) {
	const { active, link }     = props;
	const { title, type, url } = link;

	return (
		<li className={ active ? 'qni-active-result' : '' }>
			<a href={ url }>
				{ title }
			</a> {' '}

			[{type}]
		</li>
	);
}

//
function SearchResults( props ) {
	const { activeResultIndex, results } = props;

	// modal window shifts positions as this list grows/shrinks, which sucks
	// use CSS to set a fixed height maybe, or maybe just a fixed position
	//
	//console.log( activeResult );
	//console.log( results );

	return (
		<ul id="qni-search-results">
			{ results.map( ( link, index ) => {
				return (
					<Result
						link={ link }
						active={ index === activeResultIndex }
					/>
				);
			} ) }
		</ul>
	);
}

export default SearchResults;
