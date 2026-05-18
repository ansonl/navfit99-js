function disableMainUI() {
	$('.action-btn').prop('disabled', true);
}

function enableMainUI() {
	$('.action-btn').prop('disabled', false);
}

function editButtonClicked() {
	disableMainUI();
	$('#edit-alert').show();
}

function editFormSubmitted() {
	$('.action-btn:not(#edit-btn)').removeClass('btn-primary btn-warning');

	$('#edit-close-btn').hide();
	$('#edit-uuid-text').prop('disabled', true);
	$('#edit-submit-btn').prop('disabled', true);
}

function editSubmitButtonClicked() {
	editFormSubmitted();
	$('#edit-form').submit();
}

function editCloseButtonClicked() {
	enableMainUI();
	$('#edit-alert').hide();
}


function logout(successCallback) {
	$('#logout-loader-aspect').show();
	$('#logout-btn').prop('disabled', true);

	var editorID;
	var authToken;
	var authStruct = getAuthStruct();
	if (authStruct) {
		editorID = authStruct.editorID;
		authToken = authStruct.authToken;
	}

	$.ajax({
    url: authBaseURL + authLogoutHandler,
    type: 'POST',
    data: {
    	'user': editorID,
    	'token': authToken
    },
    cache: false,
    success: function(data, textStatus, jqXHR)
    {
    	console.log(data);

    	sessionStorage.clear();
    	
    	if (successCallback)
    		successCallback();
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
      showErrorAlertWithText(textStatus);
      $('#logout-btn').prop('disabled', false);
    },
    complete(jqXHR, textStatus) {
    	$('#logout-loader-aspect').hide();
    }
	});
}

function setupLogoutButton(successCallback) {
	var authStruct = getAuthStruct(true);
	if (authStruct == null) {
		$('#logout-btn').css('display', 'none');
		return false;
	} else {
		$('#logout-btn').css('display', 'inline');
	}

	$('#logout-btn').html($('#logout-btn').html() + ' ' + authStruct.editorID);

	$('#logout-btn').prop('disabled', false);

	$('#logout-btn').click(function(e) {
		logout(successCallback);
	});

	return true;
}

/*
 * Make user navfit list button visible and set correct title and click handler link.
 */
function setupUserNavfitListButton() {
	$('#user-btn').prop('disabled', false);
	$('#user-btn').css('display', 'inline');

	if (getAuthStruct(true) == null) {
		$('#user-btn').empty();
		$('#user-btn').html('<span class="glyphicon glyphicon glyphicon-home" aria-hidden="false"></span> NAVFIT99');

	}

	$('#user-btn').click(function(e) {
		var editorID;
		var authToken;
		var authStruct = getAuthStruct(true);
		if (authStruct) {
			document.location.replace(frontendUserNavfitListHandler);
		} else {
			document.location.replace('/');
		}
		
	});
}

function setupNavFitJSONButton() {
	$('#navfit-json-btn').prop('disabled', false);

	$('#navfit-json-btn').click(function(e) {
		$('#navfit-json-loader-aspect').show();
		showCurrentLocalNavFitJSON();
		$('#navfit-json-loader-aspect').hide();
	});
}

function createParamString(object) {
	var paramString = '?';
	for (var key in object) {
		paramString += key + '=' + object[key] + '&';
	}

	paramString = paramString.substring(0, paramString.length - 1);

	return paramString;
}

function setupExportButton() {
	$('#export-btn').prop('disabled', false);

	$('#export-btn').click(function(e) {
		$('#export-loader-aspect').show();

		var editorID;
		var authToken;
		var authStruct = getAuthStruct(false);
		if (authStruct) {
			editorID = authStruct.editorID;
			authToken = authStruct.authToken;

			document.location.assign(backendBaseURL + backendDownloadHandler + createParamString({'fileUUID' : getFileUUID(), 'editorID' : editorID, 'authToken' : authToken}));
		} else {
			document.location.assign(backendBaseURL + backendDownloadHandler + createParamString({'fileUUID' : getFileUUID()}));
		}

		$('#export-loader-aspect').hide();
	});
}

function setupShareButton() {
	$('#send-link-btn').prop('disabled', false);

	$('#send-link-btn').click(function(e) {
		showWarnAlertWithTextWithLink('NAVFIT access link', document.location.protocol + '//' + document.location.host + frontendFileHandler + '?' + fileUUIDKey + '=' + encodeURIComponent(getFileUUID()));
	});
}

function setupDeleteNavFitButton() {
	$('#delete-btn').prop('disabled', false);

	$('#delete-btn').click(function(e) {
		executeDeleteNavFit();
	});
}
