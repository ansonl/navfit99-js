$(window).on("load", function(){

});

function editFormSubmitted() {
	$('.action-btn:not(#edit-btn)').removeClass('btn-primary btn-warning');

	$('#edit-close-btn').hide();
	$('#edit-uuid-text').prop('readonly', true);
	$('#edit-submit-btn').prop('disabled', true);
}

function loginButtonClicked() {
  disableMainUI();
  $('#login-loader-aspect').show();
  document.location.assign(authBaseURL + authVerifyHandler);
}

function setupLoginLogoutUI() {
  $('#login-btn').click(loginButtonClicked);
  if (setupLogoutButton(function() {
    document.location.reload();
  })) {
    $('#login-btn').css('display', 'none');
    setupUserNavfitListButton();
  } else {
    $('#user-btn').css('display', 'none');
    $('#login-btn').css('display', 'inline');
  }
}

function checkForAuthError() {
  var authError = getUrlParameter(authErrorKey);
  switch(parseInt(authError, 10)) {
    case 1:
      showErrorAlertWithText('No client certificate provided. Did you select a certificate? Restart browser to try again.');
      break;
    case 2: 
      showErrorAlertWithText('Your certificate could not be verified. Select your DoD ID certificate. Restart browser to try again.');
      break;
    default:
      console.log('Unknown autherror ' + autherror);
  }
}

$(document).ready(function() {
  checkAuthStruct(getAuthStruct(true), function(valid) {
    if (!valid) {
      sessionStorage.clear();
      setupLoginLogoutUI();
    }
  });

  setupDisclaimer(true);

  $('#import-form').prop('action', backendBaseURL + backendUploadHandler);
  $('#edit-form').prop('action', frontendFileHandler);
  //$('#edit-form').on('submit', editFormSubmitted);

  $('#import-btn').click(importButtonClicked);

  $('#file-input').change( function() {
    uploadFile();
  });

  $('#new-file-btn').click(newFileButtonClicked);
  $('#edit-btn').click(editButtonClicked);

  $('#edit-submit-btn').click(editSubmitButtonClicked);
  $('#edit-close-btn').click(editCloseButtonClicked);

  

  disableMainUI();

  setupLoginLogoutUI();
});
