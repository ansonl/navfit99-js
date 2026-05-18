function uploadFile() {
	disableMainUI();
	$('#import-loader-aspect').show();

  

	// Create a formdata object and add the files
  var data = new FormData();

  $.each($('#file-input')[0].files, function(key, value)
  {
      data.append(key, value);
      console.log(key);
  });

  var editorID;
  var authToken;
  var authStruct = getAuthStruct(true);
  if (authStruct) {
    editorID = authStruct.editorID;
    authToken = authStruct.authToken;
    data.append('editorID', editorID);
    data.append('authToken', authToken);
  }

  



  $.ajax({
    url: backendBaseURL + backendUploadHandler,
    type: 'POST',
    data: data,
    cache: false,
    dataType: 'text',
    processData: false, // Don't process the files
    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
    success: function(data, textStatus, jqXHR)
    {
    	data = JSON.parse(data);
    	if (data['Status'] == 0) {
    		$('.action-btn:not(#import-btn)').removeClass('btn-primary btn-warning');
    		$('#import-btn').text("Loading");
        document.location.replace('/file.html?' + fileUUIDKey + '=' + encodeURIComponent(data['StatusData']));
    	} else {
    		enableMainUI();
    		showErrorAlertWithText(data['StatusData']);
    		$('#import-loader-aspect').hide();
    	}
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
    	enableMainUI();
      showErrorAlertWithText(textStatus);
      $('#import-loader-aspect').hide();
    },
    complete(jqXHR, textStatus) {
    	
    }
	});

}

function importButtonClicked() {
  $('#file-input').trigger('click');
}
