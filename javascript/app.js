( function( $ ) {
	'use strict';

	var app = window.QuickNavigationInterface = {
		Models      : {},
		Collections : {},
		Views       : {},

		/**
		 * Initialization that runs as soon as this file has loaded
		 */
		start : function() {
			try {
				app.options       = window.qniOptions;
				app.mainContainer = $( '#qni-container'      );
				app.searchField   = $( '#qni-search-field'   );
				app.searchResults = $( '#qni-search-results' );
				app.instructions  = $( '#qni-instructions'   );
				window.qniOptions = null;

				app.allLinks                = new app.Collections.Links( app.getAllLinks() );
					// todo rename it to reflect new contents
				app.searchResultsCollection = new app.Collections.Links( [] );
				app.searchResultsView       = new app.Views.Links( { el : app.searchResults, collection : app.searchResultsCollection } );

				$( window ).keyup(       app.toggleInterface   );
				app.mainContainer.click( app.toggleInterface   );
				app.searchField.keyup(   app.showRelevantLinks );
			} catch ( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Collect all the links for the interface
		 *
		 * @returns {Array}
		 */
		getAllLinks : function() {
			// todo rename it to reflect new contents

			var allLinks = [];

			allLinks = allLinks.concat( app.getCurrentPageLinks(), app.getContentItems() );

			return allLinks;
		},

		/**
		 * Get all links on the current page
		 *
		 * @returns {Array}
		 */
		getCurrentPageLinks : function() {
			var links = [];

			$( 'a' ).each( function() {
				var parentTitle = '',
					title       = $( this ).text(),
					url         = $( this ).attr( 'href' );

				if ( $( this ).parent().parent().hasClass( 'wp-submenu' ) ) {
					parentTitle = $( this ).parent().parent().parent().find( '.wp-menu-name' ).text();
				} else if ( 'wp-admin-bar-new-content-default' === $( this ).parent().parent().attr( 'id' ) ) {
					title = $( '#wp-admin-bar-new-content' ).find( '.ab-label' ).text() + ' ' + title;
				}

				links.push( new app.Models.Link( {
					type        : 'link',
					title       : title,
					parentTitle : parentTitle,
					url         : url
				} ) );
			} );

			return links;
		},

		/**
		 * Get content items
		 *
		 * @returns {Array}
		 */
		getContentItems : function() {
			var items = [];

			_.each( window.qniContentIndex, function( item ) {
				items.push( new app.Models.Link( {
					type  : 'content',
					title : item.title,
					url   : item.url
				} ) );
			} );

			window.qniContentIndex = null;    // there's no need to keep this in memory anymore, now that the data is stored in the Links collection

			return items;
		},

		/**
		 * Reveal the interface when the user presses the shortcut
		 *
		 * @param {object} event
		 */
		toggleInterface : function( event ) {
			try {
				if ( 'keyup' === event.type ) {
					if ( event.which === app.options.shortcuts['open-interface'].code ) {
						// todo this conflicts with gutenberg, which uses ctrl+` to navigate
							// is it enough to just return if ctrl (or any other modifier) is active? how do you tell that?

						// Don't prevent the open shortcut from being used in input fields
							// should ^ include "dont"? don't you want it to be prevented? isn't that what's actually happening?
						if ( 'input' === event.target.tagName.toLowerCase() || 'textarea' === event.target.tagName.toLowerCase() ) {
							// maybe restrict ^ to input[type=text] ?
							return;
						}

						app.openInterface();
					} else if ( event.which === app.options.shortcuts['close-interface'].code ) {
						app.closeInterface();
					}
				} else if ( 'click' === event.type ) {
					if ( 'notification-dialog-background' === event.target.className || 'button-link media-modal-close' === event.target.className ) {
						app.closeInterface();
					}
				}
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Open the interface
		 */
		openInterface : function() {
			app.searchField.val( '' );
			app.mainContainer.addClass( 'qni-active' );
			app.searchField.focus();
		},

		/**
		 * Close the interface
		 */
		closeInterface : function() {
			app.mainContainer.removeClass( 'qni-active' );
			app.instructions.removeClass(  'qni-active' );
			app.searchResultsCollection.reset();
			app.searchField.blur();    // because toggleInterface() will return early if we're focused on an input field
		},

		/**
		 * Show relevant links based on the user's query
		 *
		 * @param {object} event
		 */
		showRelevantLinks : function( event ) {
			try {
				if ( event.which === app.options.shortcuts['open-link'].code ) {
					app.openLink();
				} else if ( event.which === app.options.shortcuts['next-link'].code ) {
					app.searchResultsCollection.moveActiveLink( 'forwards' );
				} else if ( event.which === app.options.shortcuts['previous-link'].code ) {
					app.searchResultsCollection.moveActiveLink( 'backwards' );
				} else {
					app.updateSearchResults();
				}
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Open the active link
		 */
		openLink : function() {
			var link = app.searchResults.find( 'li.qni-active' ).find( 'a' );

			if ( undefined !== link.attr( 'href' ) ) {
				link.get( 0 ).click();
				app.closeInterface();
			}
		},

		/**
		 * Update the search results with based on new input
		 */
		updateSearchResults : function() {
			var query = app.searchField.val();

			app.allLinks.invoke( 'set', { state : 'inactive' } );
			app.searchResultsCollection.reset( app.allLinks.search( query, app.options['search-results-limit'] ) );

			if ( app.searchResultsCollection.length > 0 ) {
				app.instructions.addClass( 'qni-active' );
				app.searchResults.addClass( 'qni-active' );
			} else {
				app.instructions.removeClass( 'qni-active' );
				app.searchResults.removeClass( 'qni-active' );
			}
		},

		/**
		 * Log a message to the console
		 *
		 * @param {*} error
		 */
		log : function( error ) {
			if ( ! window.console ) {
				return;
			}

			if ( 'string' === typeof error ) {
				console.log( 'Quick Navigation Interface: ' + error );
			} else {
				console.log( 'Quick Navigation Interface: ', error );
			}
		}
	};

} )( jQuery );
