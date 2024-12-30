### 1.0

#### Cleanup / launch

* write post announcing new version - mention react convert but focus on features
	https://iandunn.name/wordpress/wp-admin/post.php?post=2437&action=edit
* write another blog post on how to build react app in wp that isn't a block, but uses G's components and abstraction layer
	https://iandunn.name/wordpress/wp-admin/post.php?post=2393&action=edit
* then consider doing a seattle wp dev meetup presentation
	* compassionate comments would be better example since it's a normal admin screen rather than a modal that appears on all screens
* then consider doing a seattle wordcamp talk

update youtube video - have nicer mic now too. maybe do a quick "hi i'm ian, built this because..." but 5 seconds max, then get to the point.
set video poster to be the interface not your face.

* fetchContentIndex() :: await cacheIndix
	"Note that an HTTP error response (e.g., 404) will not trigger an exception. It will return a normal response object that has the appropriate error code."
	but it does trigger an exception... ?

* fetchContentIndex() :: return await
	test updates to cache on server side get pulled in immediately. need to have a version of the db for each user, and add that as url cachebuster?
	or etags?
	" The caching API doesn't honor HTTP caching headers."
	if use cachebuster, would want to remove the other version from cache

* cacheIndex() qniCache.put()
	cache.add() does't store non-200 responses, but cache.put does, so have to validate
	don't wanna store a 500 error
	also wanna make sure that the json body is valid b/c don't wanna store an application-level error message
	caller has a try/catch and some error handling, should probably move that down here and then avoid caching errors

### Next minor version

* http://wp.test/wordpress/wp-admin/options-discussion.php and probably all pages
	Posts cannot be searched because an error occured; only links from the current page will be available. Details: The operation is insecure.
	it's not consistent, though.

    happens b/c something in fetchContentIndex() throws exception
        probably apifetch, but maybe cache.put
        maybe URL was wrong, and so it was a cross origin error?

    how to reproduce reliably, though?
        maybe it only happens the first time you open the interface after installing the update?
            clearing browser data for the site doesn't reproduce it. is there something that actually changes the data structure of the content index or something that isn't back-compat?
        what about if delete the content index
        or if new user logs in after update
        maybe only happens w/ built version?

    happened again on wp.test - maybe happens every time the content index expires?
        it doesn't expire based on time, though, but when posts change, and have tested that a lot
        so what changed between now and a few days ago when you first saw it?

	maybe just leave the debugging code in place locally -- but don't commit -- and hopefully you'll catch it again sometime in the future
	but move on to stuff you can fix for now

	still can't reproduce, maybe fixed by some of the 1.0.1 fixes?

	happened again, maybe when plugin installed for first time, before first refresh
		or maybe only when updating to .7 -> 1.x on first load, before first refresh
	also happened on updated site when opening customizer, but only 1 out of 50 times, not sure what's different. it was re-opening browser after closing, so auto opened new tab.
		maybe sometimes the code is loading too soon, and it needs to wait until

"33 plugin links" when 3 plugins need updating
	probably throw out the text in `ab-label`
	or maybe shouldn't be searching for .ab-label above?
	related https://github.com/iandunn/quick-navigation-interface/issues/2
		fix ^ too if not same thing

* search for user display name / username results in them being combined
	its the menu item link to wp-admin/network/profile.php

* entities in post title displaying encoded
	e.g., `Accessing Post Meta and More Via $post-&gt;meta_key` instead of the `>` character 
	https://iandunn.name/wordpress/wp-admin/post.php?post=2098&action=edit

* wtf aren't source maps working?
	* work for comcom, and package.json/webpack configs are identical in all the relevant places

* switch <Fragment> to <>
	* looks like it works fine in 5.0, so don't need to bump required version

* fix i18n crap?
	https://github.com/WordPress/gutenberg/issues/9846#issuecomment-555583946

* look at using https://reactjs.org/docs/hooks-state.html ?


### next minor features

______most of these don't seem very important, maybe convert to the eisenhower matrix like comcon's todo________

* Listen for new links added to DOM after initial page render, like in the News dashboard widget

* reduce build size
	9k for `npm run build`, not horrible but still seems pretty high for something so small as thing
		backbone version was 2k
	why is it so big? maybe need to set some things as webpack externals, or need tree-shaking? but dependencies is empty.
	look in the buld file and see what's in there
	make sure you're loooking at build not watch

should load the script sooner.
	on slow connections have to wait until after images have loaded etc, but may want to skip all that and go to another page

* feels like there's a slight delay in up/down keys, maybe look into how to troubleshoot react performance issues
	* maybe things are unneccessarily re-rendering or some other common mistake?
	* actually, that may just be firefox vs chrome, since the backbone version feels a bit slow in ff too
	* might still be some optimizations you can make though

* maybe use https://reactjs.org/docs/react-api.html#reactmemo and https://reactjs.org/docs/react-api.html#reactpurecomponent ?
	* it might improve performance, but that might be a premature optimization, but might help w/ slight delay above?
	* be careful b/c it's only a shallow compare

* css no longer minified b/c not using grunt anymore and wp-scripts doesn't support it
when it does, scss files inside each component folder, and have wp-scripts build a single minified/concat'd file in `build/`
https://github.com/WordPress/gutenberg/issues/14801


### Next-next minor version

* remove page links to things that already exist in content index
	e.g., when on All Posts screen

modal window shifts positions as this list grows/shrinks, which sucks
	use CSS to set a fixed height maybe, or maybe just a fixed position

activeurlpreview - if url is relative, add host
need to test different scenarios where that might break

* usermeta is global, so what happens in multisite when you store content index there?
	index if for site A b/c that was first site to load, but then it gets used for site B b/c code isn't aware of changes?
	need to store index as qni_content_index_{blog_id} ?
* for content, add post type in parenthesis

* exclude nav_menu_item and revisions from qni_content_index_params
* maybe implement the main container as a view, even though it's not dynamic?
	* it still has behavior on it like events, even though it doesn't change visually
* think about any ally issues
	* aria active state when up/down through links
* load the plugin earlier, so can start using it even before page finishes loading?

* maybe add a "new window" icon for external links
	- probably one in dashicons


### Future iterations

* can make index bigger than 55k now that using cache api?
	// check StorageEstimates API manually just out of curiosity, and to tune and good default
	// need to be conservative b/c average user may have less disk space than you, especially on mobile
	// add todo.md note that in future, could check that API programatically, and add API param to request larger or smaller # of records based on the space available
	// But still need to store in db so consider the impact there too

* make it discoverable for users who don't already know it exists and how to use it
	* https://wordpress.org/support/topic/trigger-from-search-iconbutton/
	* integrate into core's list of keyboard shortcuts?
* Setup phpunit and jest tests
	* also e2e test to make sure cache deleted after log out
* Setup travis
* setup php codesniffer
* sourcemap xss issues? remove b/c not useful anyway?
	* users safe b/c not distributed w/ wporg repo version, but still want to look into

* when pressing down key and holding, nothing happens until release
	but if move from keyup to keypress or keydown, that might have side-effects that introduce bigger problems
	https://stackoverflow.com/questions/3396754/onkeypress-vs-onkeyup-and-onkeydown

* dont need bootstrap now that wp supports checking php version via `Requires PHP: 5.6` header in readme?
	* are there edge cases where it's still useful, though?
	* can't remove b/c that'd disbale plugin, but could make it just `require classes/quick-nav.php` unconditionally, with a note that it's only there for back-compat

* Improve search results if current method is not good enough
	* Log each title/url to console, then browse through screens to get a feel for where the biggest problems are
	* Links from admin bar New menu are duplicates and titles aren't helpful, maybe ignore them
    	* maybe ignore all of admin bar b/c it's all duplicates
    	* For menus, show parent > child if the current is a child?
	* remove duplicate urls? but how to determine which one has the best title and keep that one? assume that a longer title contains more info and use that?
		* maybe not. already removed ones with same url and title, which was worst of part. if removed ones w/ same url but diff title, would be confusing for user searching for title that isn't there
	* Disambiguate links like "New" (new what?) and "Add new"
		* Maybe loop through admin menu and add those w/ special context since those are known, then loop through rest of page and just add?
		* Maybe detect append last part of url? only if conflict, or maybe always?
	* Remove any links that are just # or javascript: b/c the handlers are setup based on ID and won't do anything here
	* Don't add links that aren't visible?
	* if url and title are identical, but type is different -- e.g. one is a post, the other is a link -- then should only keep one of them, not both. 
		* this happens when a new post shows up in the `activity` metabox, or a draft in the `quick draft` metabox.
		* might be solved by some of the above
	* maybe clarify in `type` that http://wp.test/?p=418 is a front end preview and http://wp.test/wordpress/wp-admin/post.php?post=418&action=edit is editor, b/c they have the same title
		* the former is a link in the `activity` metabox

* More sophisticated search if above tweaks don't make it good enough
	* Get list of specific examples where current isn't good enough
	* Maybe calculate a Levenshtein distance, or soundex, or something else
		* Find a good, performant implementation. Maybe https://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript

* Add a way to search for more content via AJAX if some posts were left out of local index b/c of limit?
	* if so, update faq

* Add ability to search by additional keywords that are associated w/ each link, not just the title
	* Can pull the keywords from link title tags, post excerpts, etc

* Maybe show most popular links by default, and then track what links they visit and show those as default

* Highlight exact query matches in link titles w/ bold

* showRelevantLinks -- improve performance by waiting a few milliseconds before issuing a query, to avoid wasted searches when they're going to type more characters?
	* if this is non-trivial, then might be better to rely on twitter typeahead (or something similar).
	* but wouldn't be worth adding weight just for this, unless it's a noticeable problem, which right now it isn't

* Look at twitter typeahead and it's bloodhound suggestion engine. any compelling reason to use it? what about alternatives?
