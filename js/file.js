var folders = []; //array
var reports = {}; //map
var retrievedFolders = []; //array of IDs

var pendingChanges = {};

function disableMainUI() {
	$('.action-btn').prop('disabled', true);
}

function enableMainUI() {
	$('.action-btn').prop('disabled', false);
}

function createChangeID(scope, type, updatedObj) {
	var objectKeyword;

	switch (scope) {
		case EditScopeEnum.navfit:
			objectKeyword = 'navfit';
			break;
		case EditScopeEnum.folder:
			objectKeyword = 'folder' + updatedObj[folderIDKey];
			break;
		case EditScopeEnum.report:
			objectKeyword = 'report' + updatedObj[reportIDKey];
			break;
		default:
			console.log('Unknown scope' + scope);
	}

	//return 'scope' + scope + 'type' + type + 'object' + objectKeyword;
	//Type does not matter because operations of different types should overwrite each other. Latest operation for an ID takes precedence
	return 'scope' + scope + 'object' + objectKeyword;
}

function reloadUIForFolderOrReport(object) {
	if (object[folderIDKey] != null) { //update for Folder
		loadFoldersFromServer();
		loadReportsForFolderFromServer(object[folderIDKey], null);
	} else if (object[reportIDKey] != null) {
		var parentFolderID = parseInt(object[reportParentIDKey].split(" ")[1]);
		loadReportsForFolderFromServer(parentFolderID, null);
		console.log(reports[object[reportIDKey]]);
		showReportDetail(object[reportIDKey]);
	} else {
		loadFoldersFromServer();
	}
}

function logPendingChange(scope, type, updatedObj) {
	var changeID = createChangeID(scope, type, updatedObj);

	if (!pendingChanges[changeID])		
		$('#save-counter').text(parseInt($('#save-counter').text()) + 1);

	pendingChanges[changeID] = {
		'editScope': scope,
		'editOp': type,
		'navfitNewData': JSON.stringify(updatedObj)
	};

	$('#save-btn').prop('disabled', false);
	$('#save-counter').show();
	
	reloadUIForFolderOrReport(updatedObj);
}

function createNewFolderMap(parentID) {
	//find the highest folderID existing
	var highestFolderID = 0;
	for (var i = 0; i < folders.length; i++) {
		if (folders[i][folderIDKey] > highestFolderID)
			highestFolderID = folders[i][folderIDKey];
	}

	var newFolderMap = JSON.parse(blankFolderString);
	newFolderMap[folderParentKey] = parentID;
	newFolderMap[folderIDKey] = highestFolderID + 1;
	newFolderMap[folderNameKey] = "new folder";

	return newFolderMap;	
}

function retrieveAllFolders(callback) {
	//Get all folders' reports that have not been already retrieved. Need all reports to determine new reportID
	var allFolderRetrieved = true;
	for (var i = 0; i < folders.length; i++) {
		var folderRetrieved = false;
		for (var j = 0; j < retrievedFolders.length; j++) {
			if (folders[i][folderIDKey] == retrievedFolders[j]) {
				folderRetrieved = true;
				break;
			}
		}

		if (folderRetrieved == false) {
			allFolderRetrieved = false;
			loadReportsForFolderFromServer(folders[i][folderIDKey], callback);
		}
	}

	if (allFolderRetrieved)
		callback();
}

function createNewReportMap(parentID) {

	var computeNewReportMap = function() {
		console.log('callback');
		//create new report once all folder reports have been downloaded
		if (folders.length == retrievedFolders.length) {

			//find the highest folderID existing
			var highestReportID = 0;

			for (var j in reports) {
				console.log(reports[j][reportIDKey]);
				if (reports[j][reportIDKey] > highestReportID)
					highestReportID = reports[j][reportIDKey];
			}

			console.log(highestReportID);

			var newReportMap = JSON.parse(blankReportString);
			newReportMap[reportParentIDKey] = 'a ' + parentID;
			newReportMap[reportIDKey] = highestReportID + 1;
			newReportMap[folderNameKey] = 'new report ' + newReportMap[reportIDKey];


			reports[newReportMap[reportIDKey]] = newReportMap;

    	var singleReportElement = createReportElement(newReportMap);

			var containingInterior = $('#reports-container');
			containingInterior.append(singleReportElement);

    	logPendingChange(EditScopeEnum.report, EditOpEnum.new, newReportMap);

    	if ($('.folder-selected').length > 0)
    		$('.folder-selected').removeClass('folder-selected');
    	$('folderTitle' + parentID).addClass('folder-selected');
    	$('#reports-container').empty();
    	loadReportsForFolderFromServer(parentID, null);
		}
	}

	retrieveAllFolders(computeNewReportMap);
}

//Helper for getFolderChildIndicesFromArray()
function directChildIndicesOfFolder(folderID) {
	var directChildIndices = [];
	for (var i = 0; i < folders.length; i++) {
		if (folders[i][folderParentKey] == folderID) 
			directChildIndices.push(i);
	}
	return directChildIndices;
}

//Helper for folder struct deletion
function getFolderChildIndicesFromArray(folderID) {
	var allChildIndices = [];

	var directChildIndices = directChildIndicesOfFolder(folderID);
	if (directChildIndices.length > 0) {
		for (var i = 0; i < directChildIndices.length; i++) {
			allChildIndices.push(directChildIndices[i]);
		}
		
		for (var i = 0; i < directChildIndices.length; i++) {
			var childChildIndices = getFolderChildIndicesFromArray(directChildIndices[i][folderIDKey]);
			if (childChildIndices.length > 0)
				for (var j = 0; j < childChildIndices.length; j++) {
					allChildIndices.push(childChildIndices[j]);
				}
		}
	}

	console.log(allChildIndices);

	return allChildIndices;
}

function createFolderElement(folderMap) {
	//Folder main div container
		var singleFolderElement = jQuery('<div/>', {
			class: 'folder-row',
			id: 'folder' + folderMap[folderIDKey],
		});

		var folderTopBar = jQuery('<div/>', {
			class: 'folder-top-bar',
			id: 'folderTopBar' + folderMap[folderIDKey],
		});

		//Folder collapse button
		var collapseButton = jQuery('<button/>', {
			class: 'btn btn-info folder-collapse-button',
			'data-toggle': 'collapse',
			'data-target': '#folder' + folderMap[folderIDKey] + 'interior',
			'aria-expanded': 'true',
			'aria-controls': '#folder' + folderMap[folderIDKey] + 'interior',
			text: String.fromCharCode(9660),
			click: function(e) {
				if ($(this).html() == String.fromCharCode(9660))
					$(this).html(String.fromCharCode(9654));
				else if ($(this).html() == String.fromCharCode(9654))
					$(this).html(String.fromCharCode(9660));	
			}
		});

		//Folder title span
		var title = jQuery('<span/>', {
			class: 'folder-title',
			id: 'folderTitle' + folderMap[folderIDKey],
			text: folderMap[folderNameKey],
		});

		if (title.text().length == 0)
			title.text('[blank]');

		//Folder comment span
		var comment = jQuery('<span/>', {
			class: 'folder-comment',
			text: ' - ' 
		});

		//Folder actions container
		var floatRightElement = jQuery('<span/>', {
			class: 'folder-float-right-element'
		});

		var actionsDropdownGroup = jQuery('<div/>', {
			class: 'btn-group folder-actions-group',
		});

		var actionsDropdownBtn = jQuery('<button/>', {
			class: 'btn btn-default dropdown-toggle hierarchy-actions-button',
			'data-toggle': 'dropdown',
			'aria-haspopup': 'true',
			'aria-expanded': 'false',
		});
		actionsDropdownBtn.html('<span class="glyphicon glyphicon-option-horizontal" aria-hidden="false">&nbsp;<span class="caret"></span>');

		var actionList = jQuery('<ul/>', {
			class: 'dropdown-menu file-drop-menu'
		});

		//Add folder icon
		var elementAdd = jQuery('<li/>', {
			class: 'btn-primary'
		});
		elementAdd.html('<span class="glyphicon glyphicon-plus" aria-hidden="false"></span><span class="glyphicon glyphicon-folder-close" aria-hidden="false"></span> SubFolder');

		//Add report to folder icon
		var elementReportAdd = jQuery('<li/>', {
			class: 'btn-primary'
		});
		elementReportAdd.html('<span class="glyphicon glyphicon-plus" aria-hidden="false"></span><span class="glyphicon glyphicon-list-alt" aria-hidden="false"></span> Report');

		//Delete folder icon
		var elementDelete = jQuery('<li/>', {
			class: 'btn-danger'
		});
		elementDelete.html('<span class="glyphicon glyphicon-trash" aria-hidden="false"></span> Delete');

		var elementHandle = jQuery('<span/>', {
			class: 'elementHandle' + 'folder' + folderMap[folderIDKey] + 'handle'
		});
		elementHandle.html('<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>')

		//Folder interior
		var interior = jQuery('<div/>', {
			class: 'collapse in folder-interior',
			id: 'folder' + folderMap[folderIDKey] + 'interior'
		});

		//create folder title click element
  	(function(folderID, element){
      element.click(function(e) {
      	e.stopPropagation();

      	if ($('.folder-selected').length > 0)
      		$('.folder-selected').removeClass('folder-selected');
      	$('#folderTitle' + folderID).addClass('folder-selected');

      	loadReportsForFolderFromServer(folderID, null);
  		});
    })(folderMap[folderIDKey], title);
    

    //create add report element handler
  	(function(parentID, element){
      element.click(function(e) {

      	e.stopPropagation();

      	//create new report struct and add in callback
      	createNewReportMap(parentID);
      	
      });
  	})(folderMap[folderIDKey], elementReportAdd);


		//create add sub folder element handler
  	(function(parentID, element){
      element.click(function(e) {
      	e.stopPropagation();

      	//create new folder struct and add
      	var newFolderMap = createNewFolderMap(parentID);

      	folders.push(newFolderMap);

      	$('#folder' + folderMap[folderIDKey] + 'interior').append(createFolderElement(newFolderMap))

      	logPendingChange(EditScopeEnum.folder, EditOpEnum.new, newFolderMap);

      });
  	})(folderMap[folderIDKey], elementAdd);

  	//create delete element handler
  	(function(folderID, element, containingDivToRemove){
      element.click(function(e) {
      	e.stopPropagation();

      	//Delete child folders from view
      	var sortedChildIndices = getFolderChildIndicesFromArray(folderID).sort(function(a, b) {
      		return a - b;
      	});

      	console.log(sortedChildIndices);

      	for (var i = sortedChildIndices.length - 1; i >= 0; i--)
      		folders.remove(sortedChildIndices[i]);

      	//Delete the folder in question
      	for (var i = 0; i < folders.length; i++) {
      		if (folders[i][folderIDKey] == folderID) {

      			logPendingChange(EditScopeEnum.folder, EditOpEnum.delete, folders[i]);

      			folders.remove(i, i);
      			break;
      		}
      	}

      	//Delete div for folder in question
      	containingDivToRemove.remove();

      	console.log(folderID);
      });
  	})(folderMap[folderIDKey], elementDelete, singleFolderElement);

		folderTopBar.append(collapseButton);
		folderTopBar.append(title);

		actionList.append(elementReportAdd, elementAdd, elementDelete);
		actionsDropdownGroup.append(actionsDropdownBtn);
		actionsDropdownGroup.append(actionList);

		floatRightElement.append(actionsDropdownGroup, elementHandle);
		folderTopBar.append(floatRightElement);
		singleFolderElement.append(folderTopBar);
		singleFolderElement.append(interior);

		return singleFolderElement;
}

function createReportElement(reportMap) {
	//report main div container
		var singleReportElement = jQuery('<div/>', {
			class: 'report-row',
			id: "report" + reportMap[reportIDKey],
		});

		var reportTopBar = jQuery('<div/>', {
			class: 'report-top-bar',
			id: reportMap[reportIDKey],
		});

		var maskedSSN;
		if (reportMap[reportSSNKey])
			maskedSSN = 'XXX-XX-' + reportMap[reportSSNKey].substr(reportMap[reportSSNKey].length - 4);
		else
			maskedSSN = "No SSN";

		//report title span
		var title = jQuery('<span/>', {
			class: 'report-title',
			text: reportMap[reportRateKey] + ' ' + reportMap[reportNameKey],
		});

		//report comment span
		var comment = jQuery('<span/>', {
			class: 'report-comment',
			text: maskedSSN 
		});

		//report actions container
		var floatRightElement = jQuery('<span/>', {
			class: 'report-float-right-element'
		});

		var actionsDropdownGroup = jQuery('<div/>', {
			class: 'btn-group report-actions-group',
		});

		var actionsDropdownBtn = jQuery('<button/>', {
			class: 'btn btn-default dropdown-toggle hierarchy-actions-button',
			'data-toggle': 'dropdown',
			'aria-haspopup': 'true',
			'aria-expanded': 'false',
		});
		actionsDropdownBtn.html('<span class="glyphicon glyphicon-option-horizontal" aria-hidden="false">&nbsp;<span class="caret"></span>');

		var actionList = jQuery('<ul/>', {
			class: 'dropdown-menu'
		});

		//Edit raw JSON
		var elementRaw = jQuery('<li/>', {
			class: 'btn-warning'
		});
		elementRaw.html('<span class="glyphicon glyphicon-pencil" aria-hidden="false"></span> Edit Raw JSON Data');

		//Delete report icon
		var elementDelete = jQuery('<li/>', {
			class: 'btn-danger'
		});
		elementDelete.html('<span class="glyphicon glyphicon-trash" aria-hidden="false"></span> Delete');

		//create report title click element
  	(function(reportID, element){
      element.click(function(e) {
      	e.stopPropagation();

      	if ($('.report-selected').length > 0)
      		$('.report-selected').removeClass('report-selected');
      	element.addClass('report-selected');

      	//load report in detail view

      	
      	showReportDetail(reportID);


  		});
    })(reportMap[reportIDKey], title);

    //create 'edit raw json' element handler
  	(function(reportID, element){
      element.click(function(e) {
      	e.stopPropagation();

      	showTextAreaAlertWithTextWithData(reports[reportID][reportNameKey] + ' JSON data: ', JSON.stringify(reports[reportID], null, 2));

      	$('#textarea-save-btn').click(function(e) {
      		try {
      			var updatedReport = JSON.parse($('#textarea-data').val());
      			reports[reportID] = updatedReport;
      			textAreaCloseButtonClicked();

      			logPendingChange(EditScopeEnum.report, EditOpEnum.update, reports[reportID]);
      			reloadUIForFolderOrReport(reports[reportID]);
      		} catch(e) {
      			alert(e);
      		}
      	});

      });
  	})(reportMap[reportIDKey], elementRaw);

  	//create delete element handler
  	(function(reportID, element, containingDivToRemove){
      element.click(function(e) {
      	e.stopPropagation();

      	var blankReportMap = JSON.parse(blankReportString);
      	blankReportMap[reportIDKey] = reportID;

      	logPendingChange(EditScopeEnum.report, EditOpEnum.delete, blankReportMap);

      	delete reports[reportID];

      	//Delete div for report in question
      	containingDivToRemove.remove();
      });
  	})(reportMap[reportIDKey], elementDelete, singleReportElement);

		reportTopBar.append(title, jQuery('<br/>'), comment);

		actionList.append(elementRaw, elementDelete);
		actionsDropdownGroup.append(actionsDropdownBtn);
		actionsDropdownGroup.append(actionList);

		floatRightElement.append(actionsDropdownGroup);
		reportTopBar.append(floatRightElement);
		singleReportElement.append(reportTopBar);

		return singleReportElement;
}

function processFolders(data) {
	folders = data;

	console.log(data);

	if (folders.length == 0) {
		showWarnAlertWithTextWithLink('No folders in NAVFIT database, click \'</>\' to see your NAVFIT database data. ', null);
		setTimeout(warnCloseButtonClicked, 5000);
	}

	$('#folders-container').empty();

	for (var i = 0; i < data.length; i++) {
		var folderMap = data[i];

		var singleFolderElement = createFolderElement(folderMap);

		var containingFolderInterior;
		if (folderMap[folderParentKey] == 0)
			containingFolderInterior = $('#folders-container');
		else
			containingFolderInterior = $('#folder' + folderMap[folderParentKey] + 'interior');

		containingFolderInterior.append(singleFolderElement);
	}
}

function processReports(data) {
	var retrievedReports = data;

	console.log(retrievedReports);

	if (retrievedReports.length == 0) {
		showWarnAlertWithTextWithLink('No reports in folder.', null);
		setTimeout(warnCloseButtonClicked, 5000);
	}

	for (var i = 0; i < retrievedReports.length; i++) {
		var reportMap = retrievedReports[i];

		reports[reportMap[reportIDKey]] = reportMap;

		var singleReportElement = createReportElement(reportMap);

		var containingInterior = $('#reports-container');
		containingInterior.append(singleReportElement);
	}	

}

function loadFoldersFromServer() {
	if (folders.length > 0) {
		console.log('folders already loaded from server');
		processFolders(folders);
		return;
	}

	loadData(getUrlParameter(fileUUIDKey), 1, null, null);
}

function loadReportsForFolderFromServer(folderID, callback) {
	$('#reports-container').empty();

	for (var i = 0; i < retrievedFolders.length; i++) {
		if (retrievedFolders[i] == folderID) {
			console.log(folderID + ' already retrieved');
			for (var j in reports) {
				if (parseInt(reports[j][reportParentIDKey].split(" ")[1]) == folderID) {
					var singleReportElement = createReportElement(reports[j]);

					var containingInterior = $('#reports-container');
					containingInterior.append(singleReportElement);
				}
			}
			return;
		}
	}

	loadData(getUrlParameter(fileUUIDKey), 3, folderID, callback);
}

/*
 * Request navift, folder, report data from backend
 */
function loadData(fileUUID, type, typeData, callback) {
	/*
	disableMainUI();
	*/
	$('#content-loader-overlay').show();

	var editorID;
	var authToken;
	var authStruct = getAuthStruct(false);
	if (authStruct) {
		editorID = authStruct.editorID;
		authToken = authStruct.authToken;
	}

  $.ajax({
    url: backendBaseURL + backendFileHandler,
    type: 'POST',
    data: {
    	'editorID': editorID,
    	'authToken': authToken,
    	'fileUUID': fileUUID,
    	'type': type,
    	'typeData': typeData
    },
    cache: false,
    success: function(data, textStatus, jqXHR)
    {
    	console.log(data);
    	if (data['Status'] == 0) {
    		switch(type) {
    			case 1:
    				processFolders(data['NavFitDatabase']);
    				break;
    			case 3:
    				processReports(data['NavFitDatabase']);
    				retrievedFolders.push(typeData);
    				break;
    			default:
    				console.log('Unknown type '+ type);
    		}

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
    	if (callback)
    		callback();

    	console.log(callback);

    	$('#content-loader-overlay').hide();
    }
	});

}

function executeNextChange(changeKeyArray) {
	var currentKey = changeKeyArray.pop();

	//If no more keys left, all changes have been processed
	if (!currentKey) {
		var keyCount = 0;
		for (var key in pendingChanges) {
			keyCount += 1;
		}

		if (keyCount > 0) {
			$('#save-btn').prop('disabled', false);
			showErrorAlertWithText(keyCount + " changes were unable to sync with server. Please try saving pending changes again.");
		} else {
			$('#save-btn').prop('disabled', true);
			$('#save-counter').hide();
			$('#save-counter').text(0);
			showSuccessAlertWithText("All changes synced to server.");

			setTimeout(successCloseButtonClicked, 5000);
		}

		$('#save-loader-aspect').hide();

		return;
	}

	var editorID;
	var authToken;
	var authStruct = getAuthStruct(true);
	if (authStruct) {
		editorID = authStruct.editorID;
		authToken = authStruct.authToken;
	}

	$.ajax({
	  url: backendBaseURL + backendEditHandler,
	  type: 'POST',
	  data: {
	  	'editorID': editorID,
    	'authToken': authToken,
	  	'fileUUID': getUrlParameter(fileUUIDKey),
	  	'editScope': parseInt(pendingChanges[currentKey][editScopeKey]) - 1,
	  	'editOp': parseInt(pendingChanges[currentKey][editOpKey]),
	  	'navfitNewData': pendingChanges[currentKey][newDataKey],
	  },
	  cache: false,
	  success: function(data, textStatus, jqXHR)
	  {
	  	console.log(data);
	  	if (data['Status'] == 0) {
	  		console.log('success');
	  		delete pendingChanges[currentKey];
	  		$('#save-counter').text(parseInt($('#save-counter').text()) - 1);
	  	} else {
	  		$('#save-btn').prop('disabled', false);
	  		showErrorAlertWithText(data['StatusData']);
	  		$('#save-file-loader-aspect').hide();
	  	}
	  	executeNextChange(changeKeyArray);
	  },
	  error: function(jqXHR, textStatus, errorThrown)
	  {
	  	$('#save-btn').prop('disabled', false);
	    showErrorAlertWithText(textStatus);
	    $('#save-loader-aspect').show();
	  },
	  complete(jqXHR, textStatus) {
	  	
	  }
	});
}

function executePendingChanges() {
	$('#save-btn').prop('disabled', true);
	$('#save-loader-aspect').show();

	var pendingArray = [];
	for (var key in pendingChanges) {
		pendingArray.push(key);
	}

	executeNextChange(pendingArray);
}

function executeDeleteNavFit() {
	disableMainUI();
	$('#delete-loader-aspect').show();

	var editorID;
	var authToken;
	var authStruct = getAuthStruct(true);
	if (authStruct) {
		editorID = authStruct.editorID;
		authToken = authStruct.authToken;
	}

	$.ajax({
	  url: backendBaseURL + backendEditHandler,
	  type: 'POST',
	  data: {
	  	'editorID': editorID,
    	'authToken': authToken,
	  	'fileUUID': getUrlParameter(fileUUIDKey),
	  	'editScope': EditScopeEnum.navfit - 1,
	  	'editOp': EditOpEnum.delete,
	  },
	  cache: false,
	  success: function(data, textStatus, jqXHR)
	  {
	  	console.log(data);
	  	if (data['Status'] == 0) {
	  		console.log('success');
	  		$('#delete-loader-aspect').hide();
	  		showSuccessAlertWithText(data['StatusData'] + ' Hang tight...');
	  		
	  		if (authStruct)
	  			document.location.replace(frontendUserNavfitListHandler);
	  		else
	  			document.location.replace('/');
	  	} else {
	  		enableMainUI();
	  		showErrorAlertWithText(data['StatusData']);
	  		$('#delete-loader-aspect').hide();
	  	}

	  	
	  },
	  error: function(jqXHR, textStatus, errorThrown)
	  {
	  	enableMainUI();
	    showErrorAlertWithText(textStatus);
	    $('#delete-loader-aspect').hide();
	  },
	  complete(jqXHR, textStatus) {
	  	
	  }
	});
}

function showCurrentLocalNavFitJSON() {
	$('#textarea-save-btn').prop('disabled', false);
	retrieveAllFolders(function() {
		var currentNavFit = {'folders' : folders, 'reports' : reports};

		showTextAreaAlertWithTextWithData('NAVFIT JSON data: ', JSON.stringify(currentNavFit, null, 2));

		$('#textarea-save-btn').click(function(e) {
			$('#textarea-save-btn').prop('disabled', true);

  		try {
  			var updatedNavFit = JSON.parse($('#textarea-data').val());
  			
  			if (updatedNavFit['reports'] == null || updatedNavFit['folders'] == null)
  				throw 'Updated NAVFIT data missing folders and reports keys.';

  			folders = updatedNavFit['folders'];
  			reports = updatedNavFit['reports'];

  			textAreaCloseButtonClicked();

  			var pendingChangeData = {'folders' : folders, 'reports' : []};
  			for (reportKey in reports) {
  				pendingChangeData['reports'].push(reports[reportKey]);
  			}

  			logPendingChange(EditScopeEnum.navfit, EditOpEnum.update, pendingChangeData);
  			reloadUIForFolderOrReport({});
  		} catch(e) {
  			alert(e);
  			$('#textarea-save-btn').prop('disabled', false);
  		}
  		
  	});
	});
}

$(document).ready(function() {
	console.log(getUrlParameter(fileUUIDKey));

	loadFoldersFromServer();

	setupUserNavfitListButton();

	setupNavFitJSONButton();

	setupExportButton();

	setupShareButton();

	setupDeleteNavFitButton();

	setupDisclaimer(false);

	$("#save-btn").on('click', executePendingChanges);

	$('#error-close-btn').click(errorCloseButtonClicked);
	$('#success-close-btn').click(successCloseButtonClicked);

	$('#save-counter').text('0');
});