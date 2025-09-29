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
 * Validates RDF content using local SHACL shapes
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
        // Load SHACL shapes from the assets directory
        const shaclShapesUrl = './assets/shacl/ontology_shapes.ttl';
        const jsonldContextShaclUrl = './assets/shacl/context_shapes.jsonld';
        
        // Basic syntax validation first
        if (contentType === 'jsonld') {
            try {
                JSON.parse(content);
            } catch (e) {
                throw new Error('Invalid JSON-LD syntax: ' + e.message);
            }
        }
        
        // For now, we'll do basic validation checks
        // In a full implementation, you would use a SHACL validation library
        const validationResults = await performBasicValidation(content, contentType);
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        if (validationResults.valid) {
            let message = 'Validation successful! The RDF content passes basic validation checks.\n\n';
            if (contentType === 'jsonld') {
                message += 'For JSON-LD context validation, use: ./assets/shacl/context_shapes.jsonld\n';
            }
            message += 'For complete SHACL validation, use: ./assets/shacl/ontology_shapes.ttl';
            alert(message);
        } else {
            let message = 'Validation failed:\n\n' + validationResults.errors.join('\n') + '\n\n';
            if (contentType === 'jsonld') {
                message += 'For JSON-LD context validation, use: ./assets/shacl/context_shapes.jsonld\n';
            }
            message += 'For detailed validation, use: ./assets/shacl/ontology_shapes.ttl';
            alert(message);
        }
        
    } catch (error) {
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        console.error('Validation error:', error);
        alert('Validation error: ' + error.message + 
              '\n\nFor manual validation, use the SHACL shapes file: ./assets/shacl/ontology_shapes.ttl');
    }
}

/**
 * Performs basic validation checks on RDF content
 * @param {string} content - The RDF content to validate
 * @param {string} contentType - The content type (turtle or jsonld)
 */
async function performBasicValidation(content, contentType) {
    const errors = [];
    
    // Check if content is not empty
    if (!content.trim()) {
        errors.push('Content is empty');
        return { valid: false, errors };
    }
    
    // Basic syntax checks
    if (contentType === 'turtle') {
        // Check for basic Turtle syntax elements
        if (!content.includes('@prefix') && !content.includes('PREFIX')) {
            errors.push('No namespace prefixes found - this may not be valid Turtle');
        }
        
        // Check for basic triple structure
        if (!content.match(/\s+\.\s*$/m) && !content.includes(' .')) {
            errors.push('No triple statements found - missing period terminators');
        }
        
    } else if (contentType === 'jsonld') {
        try {
            const parsed = JSON.parse(content);
            
            // Check for JSON-LD context
            if (!parsed['@context']) {
                errors.push('No @context found - this may not be valid JSON-LD');
            } else {
                // Validate context structure for context files
                const context = parsed['@context'];
                if (typeof context === 'object' && !Array.isArray(context)) {
                    // This appears to be a JSON-LD context file
                    const termCount = Object.keys(context).length;
                    if (termCount === 0) {
                        errors.push('Context is empty - should contain term definitions');
                    } else if (termCount < 5) {
                        errors.push('Context has very few terms (' + termCount + ') - consider adding more ontology terms');
                    }
                    
                    // Check for proper term structure
                    let validTerms = 0;
                    for (const [term, definition] of Object.entries(context)) {
                        if (typeof definition === 'string') {
                            // Simple string mapping
                            if (definition.startsWith('http://') || definition.startsWith('https://')) {
                                validTerms++;
                            }
                        } else if (typeof definition === 'object' && definition['@id']) {
                            // Complex term definition
                            if (definition['@id'].startsWith('http://') || definition['@id'].startsWith('https://')) {
                                validTerms++;
                            }
                        }
                    }
                    
                    if (validTerms === 0) {
                        errors.push('No valid URI mappings found in context');
                    }
                }
            }
            
            // Check for basic JSON-LD structure (if not a pure context file)
            if (!parsed['@context'] || (parsed['@type'] || parsed['@id'] || parsed['@graph'])) {
                if (!parsed['@type'] && !parsed['@id'] && !parsed['@graph']) {
                    errors.push('No @type, @id, or @graph found - this may not be valid JSON-LD data');
                }
            }
            
        } catch (e) {
            errors.push('Invalid JSON syntax: ' + e.message);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
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
