function newFileButtonClicked() {
	disableMainUI();
	$('#new-file-loader-aspect').show();

  var editorID;
  var authToken;
  var authStruct = getAuthStruct(true);
  if (authStruct) {
    editorID = authStruct.editorID;
    authToken = authStruct.authToken;
  }

  $.ajax({
    url: backendBaseURL + backendNewFileHandler,
    type: 'POST',
    data: {
      'editorID': editorID,
      'authToken': authToken,
    },
    cache: false,
    success: function(data, textStatus, jqXHR)
    {
      console.log(data);
    	if (data['Status'] == 0) {
    		$('.action-btn:not(#new-file-btn)').removeClass('btn-primary btn-warning');
    		$('#new-file-btn').text("Loading");
        document.location.replace('/file.html?' + fileUUIDKey + '=' + encodeURIComponent(data['StatusData']));
    	} else {
    		enableMainUI();
    		showErrorAlertWithText(data['StatusData']);
    		$('#new-file-loader-aspect').hide();
    	}
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
      enableMainUI();
      showErrorAlertWithText(textStatus);
      $('#new-file-loader-aspect').hide();
    },
    complete(jqXHR, textStatus) {
    	
    }
	});

}
