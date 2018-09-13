function init()
{
	var items = {}
	document.querySelectorAll( '[data-savable-name]' ).forEach( el =>
	{
		items[ el.getAttribute( 'data-savable-name' ) ] = el.value;
		el.addEventListener( 'change', e =>
		{
			var data = {};
			data[ el.getAttribute( 'data-savable-name' ) ] = e.target.value;
			chrome.storage.sync.set( data );
			updatePreview();
		} );
	} );

	chrome.storage.sync.get( items, function( items )
	{
		for ( let key in items )
		{
			document.querySelector(`[data-savable-name=${key}]`).value = items[ key ];
		}

		updatePreview();
	} );

	document.querySelector( '#alternateIcon' ).addEventListener( 'paste', e =>
	{
		for ( var i = 0 ; i < e.clipboardData.items.length; i++ )
		{
			var item = e.clipboardData.items[ i ];
			if ( item.type.indexOf( "image" ) !== -1 )
			{
				var img = document.createElement( 'img' );
				img.src = URL.createObjectURL( item.getAsFile() );
				img.addEventListener( 'load', function()
				{
					var canvas = document.createElement( 'canvas' );
					var MAX_WIDTH = 32;
					var MAX_HEIGHT = 32;
					var width = img.width;
					var height = img.height;

					if ( width > height )
					{
						if ( width > MAX_WIDTH )
						{
							height *= MAX_WIDTH / width;
							width = MAX_WIDTH;
						}
					}
					else
					{
						if ( height > MAX_HEIGHT )
						{
							width *= MAX_HEIGHT / height;
							height = MAX_HEIGHT;
						}
					}
					canvas.width = width;
					canvas.height = height;
					var ctx = canvas.getContext( '2d' );
					ctx.drawImage(img, 0, 0, width, height);
					e.target.value = canvas.toDataURL( "image/png" );

					var event = new Event( 'change' );
					e.target.dispatchEvent( event );
				} );
				break;
			}
		}
	} );
}

function updatePreview()
{
	var applyTo = document.querySelector( '[data-savable-name=applyTo]' ).value;
	var previewContainer = document.querySelector( '.icon-preview-container' );
	previewContainer.classList.remove( 'pinned-only', 'unpinned-only' );
	if ( applyTo == 'pinnedOnly' )
	{
		previewContainer.classList.add( 'pinned-only' );
	}
	else if ( applyTo == 'unpinnedOnly' )
	{
		previewContainer.classList.add( 'unpinned-only' );
	}

	var imgUrl = document.querySelector( '[data-savable-name=alternateIcon]' ).value || 'img/alarm.png';
	document.querySelectorAll( '.icon-preview' ).forEach( el => el.src = imgUrl );
}

window.onload = init;
