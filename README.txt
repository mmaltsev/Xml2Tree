---- xmltotree ----
This peace of code was created in order to serve The Light Side of the Force.
Please respect the author and all what's written inside the files.
Created by Maxim Maltsev, 2016.

---- how to install ----
1. Upload all the following files "xmltojson.js", "jsontotree.js" and "style.css" into the server.
2. Add 

	<script src="xmltojson.js"></script>
	<script src="jsontotree.js"></script>

to the head part of your webpage.
3. In order to draw a tree, first - introduce a new div:

	<div class="chart1"></div>

4. Below, call the main funciton and give it the name of the div class you just introduced and a path to the XML file:
	
	<script>
		xmltotree("chart1", "ExampleTopology.xml", [], [])
	</script>

where the first [] is responsible for the nodes that should be shown at the second layer of the tree, for example:
	["firstScrewDriver", "secondScrewDriver"]
in this case, only those two elements will be shown at the second layer, ther nodes will be inserted into the node, marked "Extra".
The second [] is responsible for showing the attributes that are written under the name of the node. 
If you want to add any additional attributes besides "name", "type" and "value", you can write down their names there, for example:
	["licenseVersion"]

In order to see the example, upload "example.html" along with "ExampleTopology.xml" to the web server and launch it.