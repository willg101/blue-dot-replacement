function init() {

				var items = {}
		  		document.querySelectorAll( '[data-savable-name]' ).forEach( el =>
				{
					items[ el.getAttribute( 'data-savable-name' ) ] = el.value;
					el.addEventListener( 'change', e =>
					{
						var data = {};
						data[ el.getAttribute( 'data-savable-name' ) ] = e.target.value;
						chrome.storage.sync.set( data );
					} );
				} );
				chrome.storage.sync.get( items, function(items) {
					for ( let key in items )
					{
						document.querySelector(`[data-savable-name=${key}]`).value = items[ key ];
					}
				} );
		}
		window.onload = init;
