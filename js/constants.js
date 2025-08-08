//js GET params
var fileUUIDKey = 'uuid';
var authErrorKey = 'authError';

//auth parameter names for auth server
var urlEditorIDKey = 'user';
var urlAuthTokenKey = 'token';

//auth parameter names for navfit data server and js code
var editorIDKey = 'editorID';
var authTokenKey = 'authToken';

var authBaseURL = 'https://runs.io';
var authVerifyHandler = '/verify';
var authLogoutHandler = '/logout';

var backendBaseURL = 'https://navfit99.onrender.com';
var backendFileHandler = '/file';
var backendFileUUIDKey = 'fileUUID';

var backendEditHandler = '/edit';
var editScopeKey = 'editScope';
var editOpKey = 'editOp';
var newDataKey = 'navfitNewData';

var backendEditorHandler = '/editor';
var backendUploadHandler = '/upload';
var backendNewFileHandler = '/newFile';
var backendDownloadHandler = '/download';


var frontendUserNavfitListHandler = '/user.html';
var frontendFileHandler = '/file.html';

//UI storage var
var disclaimerKey = 'disclaimer';


var folderNameKey = 'FolderName';
var folderIDKey = 'FolderID';
var folderParentKey = 'Parent';

var reportIDKey = 'ReportID';
var reportParentIDKey = "Parent";
var reportNameKey = 'Name';
var reportRateKey = "Rate";
var reportDesigKey = "Desig";
var reportSSNKey = "SSN";





var blankFolderString = '{"TAR":false,"SummaryMP":"","Regular":false,"Concurrent":false,"Periodic":false,"SeniorRaterDate":null,"StatementNo":false,"ShipStation":"","Name":null,"RaterDate":null,"OpsCdr":false,"AutoSummary":true,"BilletSubcat":"","StatementYes":false,"Special":false,"SummaryEP":"","NOB":false,"RSDesig":"","DetInd":false,"Duties":"","RSTitle":"","Rate":"","RSSSN":null,"EO":null,"PromotionRecom":null,"UIC":"","RSInfo":"","RetentionNo":false,"MIL":null,"Active":false,"Achievements":"","MIS":null,"RecommendA":"","FromDate":null,"RecommendB":"","Qualifications":"","Rater":"","ReportingSenior":"","Parent":0,"DateReported":null,"SummaryProm":"","FolderID":null,"FolderName":"new folder", "SummarySP":"","SummaryProg":"","RSAddress":"","SeniorRater":"","ATADSW":false,"PhysicalReadiness":"","DateCounseled":"","PromotionStatus":"","Inactive":false,"UserComments":null,"RSUIC":"","Comments":"","RSGrade":"","QUAL":null,"CommentsPitch":"","SSN":null,"Frocking":false,"RetentionYes":false,"PA":null,"PrimaryDuty":"","TAC":null,"ToDate":null,"TEAM":null,"PROF":null,"Desig":"","Counseler":"","LEAD":null}';

var blankReportString = '{"TAR": false,"SummaryMP": "1","Regular": false,"Concurrent": false,"ReportID": null,"Periodic": false,"SeniorRaterDate": null,"StatementNo": false,"ShipStation": "","Name": null,"RaterDate": null,"OpsCdr": false,"BilletSubcat": "","StatementYes": false,"Special": false,"SummaryEP": "0","NOB": false,"RSDesig": "","DetInd": false,"Duties": "","RSTitle": "","Rate": null,"RSSSN": null,"EO": null,"PromotionRecom": 0,"UIC": "","RSInfo": "","RetentionNo": false,"MIL": null,"Active": false,"Achievements": "","MIS": null,"RecommendA": "","FromDate": null,"RecommendB": "","Qualifications": null,"Rater": null,"ReportingSenior": "","Parent": null,"DateReported": null,"SummaryProm": "0","SummarySP": "0","SummaryProg": "0","RSAddress": "","SeniorRater": null,"ATADSW": false,"PhysicalReadiness": "","DateCounseled": "","PromotionStatus": "","Inactive": false,"ReportType": "FitRep","Password": null,"UserComments": null,"RSUIC": "","Comments": "","RSGrade": "","QUAL": null,"CommentsPitch": "10 POINT","SSN": null,"Frocking": false,"RetentionYes": false,"PA": null,"PrimaryDuty": "","TAC": null,"ToDate": null,"TEAM": null,"PROF": null,"Desig": "","Counseler": "","LEAD": null}';

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//EditScopeEnum constant values are offset by 1, minus 1 when using them
var EditScopeEnum = {
	navfit : 1,
	folder : 2,
	report : 3
}

var EditOpEnum = {
	new : 1,
	update : 2,
	delete : 3
}

function getAuthStruct(silent) {
	var storedEditorID = getUrlParameter(urlEditorIDKey);
	var storedAuthToken = getUrlParameter(urlAuthTokenKey);

	if (storedEditorID === undefined || storedAuthToken === undefined) {
		storedEditorID = sessionStorage.getItem(urlEditorIDKey);
		storedAuthToken = sessionStorage.getItem(urlAuthTokenKey);
		if (storedEditorID == null || storedAuthToken == null) {
			if (silent == false)
				showErrorAlertWithText('You are not logged in. Any NAVFITS you edit will be public.');
			return null;
		}
	} else {
		sessionStorage.setItem(urlEditorIDKey, storedEditorID);
		sessionStorage.setItem(urlAuthTokenKey, storedAuthToken);
		document.location.replace(document.location.protocol + '//' + document.location.host + document.location.pathname);
	}

	return {editorID: storedEditorID, authToken: storedAuthToken};
}

function checkAuthStruct(authStruct, callback) {
	if (authStruct) {
			$.ajax({
	    url: backendBaseURL + backendEditorHandler,
	    type: 'POST',
	    data: {
	    	'editorID': authStruct.editorID,
	    	'authToken': authStruct.authToken
	    },
	    cache: false,
	    success: function(data, textStatus, jqXHR)
	    {
	    	console.log(data);
	    	if (data['Status'] == 0) {
	    		if (callback)
	      		callback(true);
	    	} else {
	    		if (callback)
	      		callback(false);
	    	}
	    },
	    error: function(jqXHR, textStatus, errorThrown)
	    {
	      if (callback)
	      	callback(false);
	    },
	    complete(jqXHR, textStatus) {
	    }
		});
		} else {
			if (callback)
				callback(false);
		}
}


//https://stackoverflow.com/a/21903119/761902
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};