'use strict';

const FLASH_INTERVAL_MS = 1000;

chrome.tabs.onUpdated.addListener( ( id, changeInfo, changedTab ) =>
{
	var alertIcon = chrome.extension.getURL( "/img/alarm.png" );

	// Don't ever apply this extension to internal settings or chrome:// tabs
	if ( !changedTab || changedTab.url.startsWith( 'chrome://' ) )
	{
		return;
	}

	chrome.tabs.getCurrent( async ( info ) =>
	{
		// Don't ever apply this extension to active tabs, or to tabs whose title has not changed
		if ( changedTab.active || !changeInfo.title )
		{
			return;
		}

		var settings = await getSettings();

		if ( settings.alternateIcon && settings.alternateIcon.trim() )
		{
			alertIcon = settings.alternateIcon;
		}

		if ( ! ( settings.applyTo == 'allTabs'
			|| ( settings.applyTo == 'pinnedOnly'   &&  changedTab.pinned  )
			|| ( settings.applyTo == 'unpinnedOnly' && !changedTab.pinned ) ) )
		{
			return;
		}

		// Check if this tab's URL matches any of the URLs given in the list
		var urlIsAMatch = false;
		settings.listEntries.trim()
			.split( /(\s*\n\s*)+/ )
			.filter( el => el )
			.some( line =>
			{
				if ( changedTab.url.startsWith( line ) )
				{
					urlIsAMatch = true;
					return true;
				}
			} );

		if ( !settings.listEntries.trim() // Ignore the value of settings.listType when the list is empty
			|| ( settings.listType == 'enable'  &&  urlIsAMatch )
			|| ( settings.listType == 'disable' && !urlIsAMatch ) )
		{

			chrome.tabs.executeScript( id, {
				code: `document.querySelectorAll( 'link[rel*="icon"]' ).forEach( el =>
					{
						if ( el.oldHref )
						{
							return;
						}
						el.oldHref = el.href;
						el.href = "${alertIcon}"
						if ("${settings.flashIcon}" != 'disable') {
							let showingOld = false;
							el.interval = setInterval( () =>
							{
								el.href = showingOld ? "${alertIcon}" : el.oldHref;
								showingOld = !showingOld;
							}, ${FLASH_INTERVAL_MS} );
						}
					} );`
				} );
		}
	} );
} );

chrome.tabs.onActivated.addListener( activeInfo =>
{
	chrome.tabs.get( activeInfo.tabId, tab =>
	{
		if ( !tab || tab.url.startsWith( 'chrome://' ) )
		{
			return;
		}

		chrome.tabs.executeScript( activeInfo.tabId, {
			code: `document.querySelectorAll( 'link[rel*="icon"]' )
					.forEach( el =>
					{
						if ( el.oldHref )
						{
							el.href = el.oldHref;
							delete el.oldHref;
							if ( el.interval ) {
								clearInterval( el.interval );
							}
						}
					} );`
		} );
	} );
} );

/**
 * @return Promise
 */
function getSettings()
{
	return new Promise( resolve => chrome.storage.sync.get( {
		listType      : 'enable',
		listEntries   : '',
		applyTo       : 'allTabs',
		alternateIcon : '',
		flashIcon     : 'enable',
	}, resolve ) );
}
