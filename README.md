# model2owl-boilerplate
Boilerplate for running model2owl on new projects

# Getting started
This project will use model2owl to transform a UML model into a formal OWL ontology, a SHACL shape, a conventions report
and glossary  based on established UML conventions.

Main steps:
* Fork this repository or make a new branch from main
* Put your UML model/models export (XML file) in the implementation folder
* Configure model2owl using config folder
* Change GitHub action script available to include your ontologies

> **Note:**  
> If the branching option is used, the branch will not be merged into `master`. 
> It is recommended to delete the branch once the desired output is generated and the work is complete.
# Usage
## Naming conventions
* The name of the created folders should not contain spaces. It can contain underscores or hyphen if it's strictly necessary 
* The name of the UML model export file should have _CM suffix in the name (i.e mymodel_CM.xml)
## Folder structure conventions
To add a new UML model follow this folder structure
```
implementation
        |___firstModel
                |___model2owl-config
                |___xmi_conceptual_model
```
## Adding a UML model
* Create a folder under implementation with the name of the UML model following the naming conventions. 
* Create xmi_conceptual_model folder inside the folder created at the previous step
* Put the UML export in the xmi_conceptual_model folder following the naming conventions
## Adding model2owl config
* Copy model2owl-config folder into UML model implementation folder created at the previous step
* Configure model2owl using the files inside model2owl-config folder
### Configuration Files

As presented above, this validator will use a maximum of three configuration files, depending on the UML model validation option you have selected (check the **Validator Options** section).

#### Config Parameters File (config-parameters.xsl)

This is an XSLT file that contains a set of variables used by the system during model validation. Some variables can be modified, while others should remain unchanged as they are preconfigured. A boilerplate for the config parameters can be found [here](#). The boilerplate includes comments to guide what can and cannot be changed.

**Sample:**

```xml
<!-- Types of elements and names for attribute types that are acceptable to produce object properties -->
<xsl:variable name="acceptableTypesForObjectProperties" select="('epo:Identifier', 'rdfs:Literal')"/>

<!-- Acceptable stereotypes -->
<xsl:variable name="stereotypeValidOnAttributes" select="()"/>
<!-- ... other variables ... -->

<!-- Allowed characters for a normalized string (characters allowed in a QName) -->
<xsl:variable name="allowedStrings" select="'^[\w\d-_:]+$'"/>
```
There are three types of data you can pass into the variables: lists, strings, or booleans.  
- For **lists**, the variable value should be enclosed in double quotes (`""`), with individual values wrapped in single quotes (`''`) and separated by commas.  
- For **strings** and **booleans**, the value should always be enclosed in double quotes (`""`).

**Example:**
```xml
String variable 
<xsl:variable name="my-variable" select="'my string value'"/>
List variable
<xsl:variable name="stereotypeValidOnDependencies" select="('Disjoint', 'disjoint', 'join')"/>
Boolean variable
<xsl:variable name="enableGenerationOfSkosConcept" select="fn:false()"/>
```
**Notes:**
- **Do not delete variables**: Each variable serves a purpose in the generation process.
- **Maintain variable types**: Do not change the type of a variable (e.g., from a list to a string). If a variable is originally set as a list, it must remain a list.
- If a variable is unnecessary or if you prefer not to impose restrictions, leave the variable with an empty list or string. See the examples below:
  - **Empty string variable**:
  
    ```xml
    <xsl:variable name="my-variable" select="''"/>
    ```

  - **Empty list variable**:

    ```xml
    <xsl:variable name="stereotypeValidOnAttributes" select="()"/>
    ```
    
#### Namespaces File (namespaces.xml)

This file holds the namespace values and names used in the model being processed.
Sample:

```xml

<?xml version="1.0" encoding="UTF-8"?>
<prefixes xmlns="http://publications.europa.eu/ns/">
   <prefix name="" value="http://data.europa.eu/a4g/ontology#"/>
    <prefix name="foaf" value="http://xmlns.com/foaf/0.1/" importURI="http://xmlns.com/foaf/0.1/"/>
   <!-- ... other prefixes ... -->
</prefixes>
```
**Notes:**
- If you want any URI from this list to be imported as statements (`owl:imports`) in the generated OWL and SHACL artefacts
use the `importURI` attribute like in the example above.

#### XSD and RDF Datatypes File (xsdAndRdfDataTypes.xml)

This file contains declarations of XSD and RDF datatypes. 

**Sample:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<datatypes xmlns="http://publications.europa.eu/ns/">
   <datatype namespace="xsd" qname="xsd:anyURI"/>
   <datatype namespace="xsd" qname="xsd:base64Binary"/>
   <datatype namespace="xsd" qname="xsd:boolean"/>
   <datatype namespace="xsd" qname="xsd:byte"/>
   <datatype namespace="xsd" qname="xsd:date"/>
   <datatype namespace="xsd" qname="xsd:dateTime"/>
   <datatype namespace="rdfs" qname="rdfs:Literal"/>
</datatypes>
```
#### UML to XSD DataTypes File (umlToXsdDataTypes.xml)

This file defines the mappings between UML datatypes and XSD datatypes.
If this in not necessary leave the default file.
### Sample:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mappings xmlns="http://publications.europa.eu/ns/">

    <!-- epo prefixed datatypes -->
    <mapping>
        <from qname="epo:Indicator"/>
        <to qname="xsd:boolean"/>
    </mapping>
    <mapping>
        <from qname="epo:Date"/>
        <to qname="xsd:date"/>
    </mapping>
    <mapping>
        <from qname="epo:DateTime"/>
        <to qname="xsd:dateTime"/>
    </mapping>
</mappings>
```
## Adjust GitHub actions
In the folder .GitHub from this repository there is one action script that will transform the UML model/models.
### Transform with model2owl

**File name:** transform_with_model2owl.yml

Configure the trigger for this action changing the following lines
```yaml
    paths:
      - "implementation/demo_ontology/xmi_conceptual_model/demo_ontology_CM.xml"
      - "implementation/demo_ontology/xmi_conceptual_model/demo_ontology_module_CM.xml"
```
If any change is detected in the files that are included in the paths config will trigger this GitHub action.
The paths should be to the UML model export file.

Configure which of the implementation should be included by changing the AVAILABLE_IMPLEMENTATIONS variable
inside the action script.
```shell
AVAILABLE_IMPLEMENTATIONS=(demo_ontology demo_ontology_module)
```
Search in the script for this variable declaration as it has multiple usage and change the value accordingly.
The values in the list should be the folder names created for the UML model under the implementation folder.

```
Example:

implementation
        |___modelOne
        |___modelTwo
        
To include both models for generating the convention report and glossary the variable should be
AVAILABLE_IMPLEMENTATIONS=(modelOne modelTwo)
```

## Output
The output is automatically generated by the GitHub action scripts described previously. Each of the scripts will 
do an automatic commit on the branch that was executed from. To see the output executing a git pull after the GitHub 
action ran successfully is mandatory.
The scripts will generate automatically folders and transformation files under a specific structure that is presented
below.

### Output folders structure and content

Glossaries will be stored at the top level of this project outside the implementation folder, and it will 
contain the individual glossaries for the UML model and a unified glossary if there are more than one UML model to
be processed by GitHub action scripts

```
     /
    .github
    glossary
        |__static  -> folder to hold css and js neccesary for the glossary
        |__modelOne_CM_glossary.html
        |__modelTwo_CM_glossary.html
        |__ontologies_combined_glossary.html   -> combined glossary
    implementation
    model2owl-config
```
The formal OWL ontology and a SHACL shape will be inside each UML model folder under specific folders as described 
below.
```
    implementation
        |___modelOne
                |__conventions_report
                |       |__static -> folder to hold css and js neccesary for the convention report
                |       |__modelOne_CM-convention-report.html
                |__owl_ontology
                |       |__modelOne_CM_core.rdf
                |       |__modelOne_CM_core.ttl
                |       |__modelOne_CM_restrictions.rdf
                |       |__modelOne_CM_restrictions.ttl
                |__shacl_shapes
                |       |__modelOne_CM_shapes.rdf
                |       |__modelOne_CM_shapes.rdf
                |___model2owl-config
                |___xmi_conceptual_model
        |___modelTwo
```
