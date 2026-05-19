function getReportFormatForReportID(reportID) {
	console.log(reports[reportID]['ReportType']);

	if (reports[reportID]['ReportType'] == 'FitRep') {
		return JSON.parse(fitrepFormat);
	} else if (reports[reportID]['ReportType']  == 'Eval') {
		return JSON.parse(evalFormat);
	} else if (reports[reportID]['ReportType']  == 'Chief') {
		return JSON.parse(chiefFormat);
	}
}

function appendRadioToElement(radioText, value, checked, enabled, element) {
	var input = jQuery('<input/>', {
		class: 'report-input-element',
		'name': element.attr('id'),
		type: 'radio',
		value: value
	});

	if (checked)
		input.prop('checked', true);

	if (!enabled) {
		input.prop('disabled', true);
	}

	var inputLabel = jQuery('<label/>', {
		text: radioText
	});

	inputLabel.append(input);
	element.append(inputLabel);
}

function appendRadiosToElement(radioTextArray, checkedValue, enabled, element) {

	//values for radio buttons are 0 indexed in JS
	for (var i = 0; i < radioTextArray.length; i++) {
		appendRadioToElement(radioTextArray[i], i, checkedValue != null && checkedValue == i ? true : false, enabled, element);
	}
}

function appendSelectionOptionToElement(optionText, selected, element) {
	var option = jQuery('<option/>', {
		value: optionText,
		text: optionText
	});
	element.append(option);

	if (selected)
		option.prop('selected', true);
}

function appendSelectionOptionsToElement(optionTextArray, selectedOption, element) {
	var selectInput = jQuery('<select/>', {
		class: 'report-input-element',
		'name': element.attr('id'),
	});

	appendSelectionOptionToElement(null, false, selectInput);

	for (var i = 0; i < optionTextArray.length; i++) {
		appendSelectionOptionToElement(optionTextArray[i], optionTextArray[i] == selectedOption ? true : false, selectInput);
	}

	element.append(selectInput);
}

function appendTextInputToElement(value, placeholder, enabled, element) {
	var textInput = jQuery('<input/>', {
		class: 'report-input-element',
		'name': element.attr('id'),
		type: 'text',
		'placeholder': placeholder,
		value: value
	});

	if (!enabled) {
		textInput.prop('disabled', true);
	}

	element.append(textInput);

	return textInput;
}

function appendTextAreaToElement(value, placeholder, enabled, element) {
	var textarea = jQuery('<textarea/>', {
		class: 'report-input-element',
		'name': element.attr('id'),
		'placeholder': placeholder,
	});

	textarea.val(value);

	textarea.css('width','100%');

	if (!enabled) {
		textarea.prop('disabled', true);
	}

	element.append(textarea);
}

function appendCheckboxToElement(checkboxText, checked, element) {
	var input = jQuery('<input/>', {
		class: 'report-input-element',
		'name': element.attr('id'),
		type: 'checkbox',
	});

	if (checked)
		input.prop('checked', true);

	var inputLabel = jQuery('<label/>', {
		text: checkboxText
	});

	inputLabel.append(input);
	element.append(inputLabel);
}

function appendNewBlockToElement(blockMap, reportID, element) {
	var blockNumber = blockMap['number'] ? (blockMap['number'] + '. ') : '';
	var blockDesc = blockMap['description'] ? (blockMap['description'] == 'larr' ? String.fromCharCode(0x2190) : blockMap['description']) : ''; //If desc = "larr", substitue left arrow symbol

	var block = jQuery('<div/>', {
		class: 'field-block col-sm-' + blockMap['colWidth'],
		id: 'block' + blockMap['number'],
		text: blockNumber + blockDesc 
	});

	//$('[name=block5]:checked').val()
	if (blockMap['type'] == 'radio') {
		var selectedRadio;

		if (blockMap['keys'].length == 1) {
			selectedRadio = reports[reportID][blockMap['keys'][0]];
		} else {
			for (var i = 0; i < blockMap['keys'].length; i++) {
				if (reports[reportID][blockMap['keys'][i]] == true)
					selectedRadio = i;
			}
		}

		appendRadiosToElement(blockMap['labels'], selectedRadio, blockMap['disabled'] ? false : true, block);
	}

	//$('[name=block10]').is(':checked')
	if (blockMap['type'] == 'checkbox') {
		var existingValue = reports[reportID][blockMap['keys'][0]];
		appendCheckboxToElement(blockMap['labels'] ? blockMap['labels'][0] : null, existingValue ? true : false, block);
	}

	//$('[name=block1]').val()
	if (blockMap['type'] == 'textbox') {
		for (var i = 0; i < blockMap['keys'].length; i++) {
			var existingValue = reports[reportID][blockMap['keys'][i]];
			appendTextInputToElement(existingValue, blockMap['placeholder'], blockMap['disabled'] ? false : true, block);
		}
	}

	//$('[name=block1]').val()
	if (blockMap['type'] == 'textarea') {
		for (var i = 0; i < blockMap['keys'].length; i++) {
			var existingValue = reports[reportID][blockMap['keys'][i]];
			appendTextAreaToElement(existingValue, blockMap['placeholder'], blockMap['disabled'] ? false : true, block);
		}			
	}

	//$('[name=block8]').val()
	if (blockMap['type'] == 'selection') {
		var existingValue = reports[reportID][blockMap['keys'][0]];
		appendSelectionOptionsToElement(blockMap['labels'], existingValue, block);
	}
	
	if (blockMap['type'] == null) {
		//none
	}

	element.append(block);
}

function appendNewBlocksToElement(blockMapArray, reportID, element) {

	for (var i = 0; i < blockMapArray.length; i++) {
		appendNewBlockToElement(blockMapArray[i], reportID, element);
	}
}
/*
 * Modify global report map variable and queue edit for saving to server.
 * Called from 'change' and 'input' handlers for report input elements.
 */
function modifyReportMapAndLogPendingChange(reportID, inputElement) {
	var format = getReportFormatForReportID(reportID);

	var elementName = inputElement.attr('name');
	var blockNumber = elementName.substring(5, elementName.length);
	var blockKeys = format['blocks'][blockNumber]['keys'];

	if (blockKeys.length == 1) { //one to one block value to access key relationship
		if (inputElement.is('input[type=text]')) {
			reports[reportID][blockKeys[0]] = inputElement.val();
		} else if (inputElement.is('textarea')) {
			reports[reportID][blockKeys[0]] = inputElement.val();
		} else if (inputElement.is('input[type=checkbox]')) {
			reports[reportID][blockKeys[0]] = inputElement.is(':checked') ? true : false;
		} else if (inputElement.is('input[type=radio]')) {
			reports[reportID][blockKeys[0]] = parseInt(inputElement.val()); //ratings for perf displayed range 0-5, access values 0-5
		} else if (inputElement.is('select')) {
			reports[reportID][blockKeys[0]] = inputElement.val();
		} else {
			console.log('Unknown input element block number' + blockNumber + ' element ' + inputElement);
		}
	} else { //many to many block values to access keys relationship
		if (inputElement.is('input[type=text]')) {
			var blockInputs = $('input[name=' + inputElement.attr('name'));
			for (var i = 0; i < blockInputs.length; i++) {
				if (inputElement[0] == blockInputs[i])
					reports[reportID][blockKeys[i]] = inputElement.val();
			}
			
		} else if (inputElement.is('textarea')) {
			//unimplemented
		} else if (inputElement.is('input[type=checkbox]')) {
			//unimplemented
		} else if (inputElement.is('input[type=radio]')) { //EX: fitrep block5
			var selectedRadio = parseInt(inputElement.val(), 10);
			for (var i = 0; i < blockKeys.length; i++) {
				if (i == selectedRadio) {
					reports[reportID][blockKeys[i]] = true;
				} else {
					reports[reportID][blockKeys[i]] = false;
				}
			}
		} else {

			console.log('Unknown input element block number' + blockNumber + ' element ' + inputElement);
		}
	}

	

	logPendingChange(EditScopeEnum.report, EditOpEnum.update, reports[reportID], false);
}
