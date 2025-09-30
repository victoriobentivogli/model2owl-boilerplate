function example_structure(exampleid){
	structure=`
	<div id="` + exampleid + `-tabs" exampleid="` + exampleid + `"  class="tabs tabsstyle">
		<ul>
			<li><a href="#` + exampleid + `-tabs-1">Turtle</a></li>
			<li><a href="#` + exampleid + `-tabs-2">JSON-LD</a></li>
		</ul>
		<div id="` + exampleid + `-tabs-1">
			<textarea class="validationquery" id="` + exampleid + `-tab1validationquery" name="query" cols="80" rows="16"></textarea>
			<button class="buttonsample copyturtletoclipboard" id="` + exampleid + `-tabs-1-button-1">Copy</button>
			<button class="buttonsample validateturtle" id="` + exampleid + `-tabs-1-button-2">Validate</button>
		</div>
		<div id="` + exampleid + `-tabs-2">
			<textarea class="validationquery" id="` + exampleid + `-tab2validationquery" name="query" cols="80" rows="16"></textarea>
			<button class="buttonsample copyjsonldtoclipboard" id="` + exampleid + `-tabs-2-button-1">Copy</button>
			<button class="buttonsample validatejsonld" id="` + exampleid + `-tabs-2-button-2">Validate</button>
			<button class="buttonsample openinplayground" id="` + exampleid + `-tabs-2-button-3">Open in Playground</button>
		</div>
	</div>`;
	return structure;
}


/**
 * auxiliary function to get around the issue that indexOf() is not working with jquery.
 */

function myIndexOf(list, val) {
	var myindex  = -1;
	var i = 0;

	var elem = list[0];
        
	while ( i < list.length ) {
		if ( elem == val ) return i;
		i = i+1;
		elem = list[i];

	}
	
	return -1;

}


/**
 * Fills in the direct input area with some samples
 * @param {string} file - file containing the sample
 */
 function loadFile(editorinstance, file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            editorinstance.setValue(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

function createTurtleEditorFrom(selector) {
  return CodeMirror.fromTextArea(selector, {
    mode: "turtle",
    lineNumbers: true
  });
}

function createJSONLDEditorFrom(selector) {
  return CodeMirror.fromTextArea(selector, {
    mode: "application/ld+json",
    lineNumbers: true
  });
}

/**
 * Validates RDF content using SHACL shapes and returns a detailed validation report
 * @param {string} content - The RDF content to validate
 * @param {string} contentType - The content type (turtle or jsonld)
 */
async function validateRDF(content, contentType) {
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Validating...';
    button.disabled = true;
    
    try {
        // Determine which SHACL shapes to use
        const shaclShapesUrl = contentType === 'jsonld' 
            ? './assets/shacl/context_shapes.jsonld'
            : './assets/shacl/ontology_shapes.ttl';
        
        // Load SHACL shapes
        const shaclShapes = await loadFileContent(null, shaclShapesUrl);
        
        // Perform SHACL validation
        const validationReport = await performSHACLValidation(content, shaclShapes, contentType);
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        // Display validation report
        displayValidationReport(validationReport, contentType);
        
    } catch (error) {
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        console.error('Validation error:', error);
        
        // Show error with fallback to ITB validation service
        const errorMessage = `Validation error: ${error.message}\n\n` +
            `Alternative validation options:\n` +
            `• Use ITB Validation Service: https://www.itb.ec.europa.eu/shacl/any/upload\n` +
            `• Manual validation with SHACL shapes: ./assets/shacl/ontology_shapes.ttl`;
        
        alert(errorMessage);
    }
}

/**
 * Performs SHACL validation using ITB validation service
 * @param {string} dataContent - The RDF data to validate
 * @param {string} shaclShapes - The SHACL shapes content
 * @param {string} contentType - The content type (turtle or jsonld)
 */
async function performSHACLValidation(dataContent, shaclShapes, contentType) {
    return await validateWithITB(dataContent, shaclShapes, contentType);
}

/**
 * Validates using the Interoperability Testbed (ITB) validation service
 * Similar to what DCAT-AP uses for their validation
 */
async function validateWithITB(dataContent, shaclShapes, contentType) {
    const itbEndpoint = 'https://www.itb.ec.europa.eu/shacl/any/api/validate';
    
    const formData = new FormData();
    formData.append('contentToValidate', dataContent);
    formData.append('validationType', 'string');
    formData.append('embeddingMethod', 'string');
    formData.append('shaclFile', new Blob([shaclShapes], { type: 'text/plain' }), 'shapes.ttl');
    
    const response = await fetch(itbEndpoint, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`ITB validation service error: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
        valid: result.result === 'SUCCESS',
        report: result.report,
        violations: result.items || [],
        service: 'ITB',
        timestamp: new Date().toISOString()
    };
}



$(document).ready(function () {

	
	
	var examples = [];
	var editors = [];

        var examples_id = ".examples";
	var examples_class = ".h3";
	var folder = "./assets/examples/";
	var $examples = $(examples_id);

//	$examples.children(examples_class).each(function(index){
	$examples.each(function(index){
		exampleid = this.id;
		examples.push(exampleid); 
		var text = example_structure(exampleid);
		$(this).after(text);

		var obj = {CM0: createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery")), CM1: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery"))};
		editors[index] = obj;
		//editors[index].push({CM: createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery")}, CM2: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery")});
		//editors[index].push({CM: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery")});
		//editors[index][0] = createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery"));
		//editors[index][1] = createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery"));

		$("#" + exampleid + "-tabs").tabs();

		$("#" + exampleid + "-tabs a").on('click', function(e) {
			$('.CodeMirror').each(function(i, el){
				el.CodeMirror.refresh();
			});
		});

                path_to_file = folder + exampleid;
		loadFile(editors[index].CM0, path_to_file + ".ttl");
		loadFile(editors[index].CM1, path_to_file + ".jsonld");
		
	});

	$("button.copyturtletoclipboard").on({
		"click": function() {
			var exampleid = $(this).parent().parent().attr("exampleid");
			var indexValues = $examples.map(function() { return this.id; }) ;
			var index = myIndexOf(indexValues, exampleid);
			texttocopy = editors[index].CM0.getValue()
			navigator.clipboard.writeText(texttocopy);
			$(this).tooltip({ items: "#" + this.id, content: "Copied !"});
			$(this).tooltip("open");
		},
		"mouseout": function() {
			$(this).tooltip("disable");
		}
	});
	
	$("button.copyjsonldtoclipboard").on({
		"click": function() {
			var exampleid = $(this).parent().parent().attr("exampleid");
			var indexValues = $examples.map(function() { return this.id; }) ;
			var index = myIndexOf(indexValues, exampleid);
			texttocopy = editors[index].CM1.getValue();
			navigator.clipboard.writeText(texttocopy);
			$(this).tooltip({ items: "#" + this.id, content: "Copied !"});
			$(this).tooltip("open");
		},
		"mouseout": function() {
			$(this).tooltip("disable");
		}
	});
	
	// Validation button handlers
	$("button.validateturtle").on('click', function(e) {
		var exampleid = $(this).parent().parent().attr("exampleid");
		var indexValues = $examples.map(function() { return this.id; }) ;
		var index = myIndexOf(indexValues, exampleid);
		var content = editors[index].CM0.getValue();
		
		if (!content.trim()) {
			alert('No content to validate. Please ensure the Turtle content is loaded.');
			return;
		}
		
		validateRDF(content, 'turtle');
	});
	
	$("button.validatejsonld").on('click', function(e) {
		var exampleid = $(this).parent().parent().attr("exampleid");
		var indexValues = $examples.map(function() { return this.id; }) ;
		var index = myIndexOf(indexValues, exampleid);
		var content = editors[index].CM1.getValue();
		
		if (!content.trim()) {
			alert('No content to validate. Please ensure the JSON-LD content is loaded.');
			return;
		}
		
		validateRDF(content, 'jsonld');
	});
	
	$("button.openinplayground").on('click', function(e) {
		var exampleid = $(this).parent().parent().attr("exampleid");
		var indexValues = $examples.map(function() { return this.id; }) ;
		var index = myIndexOf(indexValues, exampleid);

		newUrl = "https://json-ld.org/playground/#startTab=tab-expand&json-ld=" + editors[index].CM1.getValue(); 
		window.open(encodeURI(newUrl), '_blank');
		return false;
	});
	
	$("div.CodeMirror pre").on('click', function(e) {
		var et = $(e.target);
		if(et.hasClass('cm-url'))  {
			newUrl = $(this).text();
			window.open(encodeURI(newUrl), '_blank');
			return false;
		}
	});
});

/**
 * Displays a detailed validation report in a modal or alert
 * @param {Object} report - The validation report object
 * @param {string} contentType - The content type that was validated
 */
function displayValidationReport(report, contentType) {
    const timestamp = new Date(report.timestamp).toLocaleString();
    
    if (report.valid) {
        // Success report
        let message = `VALIDATION SUCCESSFUL\n\n`;
        message += `Service: ${report.service}\n`;
        message += `Content Type: ${contentType.toUpperCase()}\n`;
        message += `Timestamp: ${timestamp}\n\n`;
        
        if (report.warnings && report.warnings.length > 0) {
            message += `WARNINGS (${report.warnings.length}):\n`;
            report.warnings.forEach((warning, index) => {
                message += `${index + 1}. ${warning.message}\n`;
                if (warning.focusNode) message += `   Focus: ${warning.focusNode}\n`;
            });
            message += '\n';
        }
        
        message += `The RDF content is valid according to the SHACL shapes.\n`;
        message += `SHACL shapes used: ./assets/shacl/${contentType === 'jsonld' ? 'context_shapes.jsonld' : 'ontology_shapes.ttl'}`;
        
        alert(message);
    } else {
        // Failure report
        let message = `VALIDATION FAILED\n\n`;
        message += `Service: ${report.service}\n`;
        message += `Content Type: ${contentType.toUpperCase()}\n`;
        message += `Timestamp: ${timestamp}\n\n`;
        
        if (report.summary) {
            message += `SUMMARY:\n`;
            message += `- Violations: ${report.summary.totalViolations}\n`;
            message += `- Warnings: ${report.summary.totalWarnings}\n\n`;
        }
        
        if (report.violations && report.violations.length > 0) {
            message += `VIOLATIONS:\n`;
            report.violations.forEach((violation, index) => {
                message += `${index + 1}. ${violation.message}\n`;
                if (violation.focusNode) message += `   Focus: ${violation.focusNode}\n`;
                if (violation.resultPath) message += `   Path: ${violation.resultPath}\n`;
            });
            message += '\n';
        }
        
        if (report.warnings && report.warnings.length > 0) {
            message += `WARNINGS:\n`;
            report.warnings.forEach((warning, index) => {
                message += `${index + 1}. ${warning.message}\n`;
                if (warning.focusNode) message += `   Focus: ${warning.focusNode}\n`;
            });
            message += '\n';
        }
        
        message += `SHACL shapes used: ./assets/shacl/${contentType === 'jsonld' ? 'context_shapes.jsonld' : 'ontology_shapes.ttl'}\n\n`;
        message += `For external validation, use: https://www.itb.ec.europa.eu/shacl/any/upload`;
        
        alert(message);
    }
}

/**
 * Enhanced loadFile function that can load SHACL shapes or return content as string
 * @param {Object} editor - CodeMirror editor (null if loading for validation)
 * @param {string} path - Path to the file
 * @returns {Promise<string>} - File content as string when editor is null
 */
async function loadFileContent(editor, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        
        if (editor) {
            // Set content in editor (existing functionality)
            editor.setValue(content);
        } else {
            // Return content as string (for SHACL validation)
            return content;
        }
    } catch (error) {
        console.error('Error loading file:', error);
        if (editor) {
            editor.setValue(`# Error loading file: ${path}\n# ${error.message}`);
        } else {
            throw error;
        }
    }
}
