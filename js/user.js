function processNavfitList(navfitList) {
	var filelistHeader = jQuery('<h2/>', {
		text: 'NAVFITs for ' + getAuthStruct().editorID
	});

	if (navfitList.length == 0) {
		filelistHeader = jQuery('<h2/>', {
			text: 'No NAVFITs for your user.'
		});
	}


$('#filelist').empty();
		$('#filelist').append(filelistHeader);

	for (var i = 0; i < navfitList.length; i++) {
		var fileIcon = jQuery('<span/>', {
			class: 'glyphicon glyphicon-file',
			html: '&nbsp;'
		});
		var barcodeIcon = jQuery('<span/>', {
			class: 'glyphicon glyphicon-barcode',
			html: '&nbsp;'
		});
		var filenameSpan = jQuery('<span/>', {
			class: 'filename'
		});
		filenameSpan.text(navfitList[i])

		var filenameElement = jQuery('<button/>', {
			class: 'btn btn-primary filelist-btn'
		});

  	(function(navfitUUID, element){
      element.click(function(e) {
        document.location.replace('/file.html?' + fileUUIDKey + '=' + encodeURIComponent(navfitUUID));
  		});
    })(navfitList[i], filenameElement);

		filenameElement.append(fileIcon, barcodeIcon, filenameSpan);
		$('#filelist').append(filenameElement);
	}
}

function replaceFileListWithLogin() {
	/*
	$('#filelist').empty();
	var filenameSpan = jQuery('<span/>', {
		id: 'login-btn'
	});
	filenameSpan.text('Click to login with CAC / private key certificate.')

	var loaderAspect = jQuery('<div/>', {
		id: "login-loader-aspect"
	});
	var loader = jQuery('<div/>', {
		id: "loader"
	});
	loaderAspect.append(loader);
	filenameSpan.append(loaderAspect);

	var filenameElement = jQuery('<button/>', {
		class: 'btn btn-primary filelist-btn'
	});

	(function(element){
    element.click(function(e) {
    	$('#login-btn').prop('disabled', true)
			$('#login-loader-aspect').show();
    	document.location.replace(authBaseURL + authVerifyHandler);
		});
  })(filenameElement);
  */

  $('#filelist').empty();
	var filenameSpan = jQuery('<span/>', {
		id: 'login-button-link'
	});
	filenameSpan.text('Click to return to homepage.');

	var loaderAspect = jQuery('<div/>', {
		id: "login-loader-aspect"
	});
	var loader = jQuery('<div/>', {
		id: "loader"
	});
	loaderAspect.append(loader);
	filenameSpan.append(loaderAspect);

	var filenameElement = jQuery('<button/>', {
		class: 'btn btn-primary filelist-btn'
	});

	(function(element){
    element.click(function(e) {
    	$('#login-btn').prop('disabled', true)
			$('#login-loader-aspect').show();
    	document.location.replace('/');
		});
  })(filenameElement);

	filenameElement.append(filenameSpan);
	$('#filelist').append(filenameElement);

	$('#logout-btn').text('Logged out');
	$('#logout-btn').prop('disabled', true);
}

function loadEditorNavfitsFromServer(editorID, authToken, callback) {
	$('#filelist-loader-aspect').show();

  $.ajax({
    url: backendBaseURL + backendEditorHandler,
    type: 'POST',
    data: {
    	'editorID': editorID,
    	'authToken': authToken
    },
    cache: false,
    success: function(data, textStatus, jqXHR)
    {
    	console.log(data);
    	if (data['Status'] == 0) {
    		processNavfitList(data['NavFitDatabase']);
    	} else {
    		showErrorAlertWithText(data['StatusData']);
    	}
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
      showErrorAlertWithText('Authentication error. Session has timed out. Please relogin.');
      replaceFileListWithLogin();
    },
    complete(jqXHR, textStatus) {
    	if (callback)
    		callback();

    	$('#filelist-loader-aspect').hide();
    }
	});
}

$(document).ready(function() {
	var editorID;
	var authToken;
	var authStruct = getAuthStruct(false);
	if (authStruct) {
		editorID = authStruct.editorID;
		authToken = authStruct.authToken;
		setupLogoutButton(function() {
			disableMainUI();
			replaceFileListWithLogin();
		});
		loadEditorNavfitsFromServer(editorID, authToken);
		enableMainUI();
	} else {
		enableMainUI();
		replaceFileListWithLogin();
	}

	$('#edit-form').prop('action', frontendFileHandler);
  //$('#edit-submit-btn').on('click', editSubmitButtonClicked);

	$('#import-form').prop('action', backendBaseURL + backendUploadHandler);
	$('#import-btn').click(importButtonClicked);

  $('#file-input').change( function() {
    uploadFile();
  });

  $('#new-file-btn').click(newFileButtonClicked);
  $('#edit-btn').click(editButtonClicked);

  $('#edit-close-btn').click(editCloseButtonClicked);
	
});
