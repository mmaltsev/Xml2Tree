# [Xml2Tree](https://github.com/mmaltsev/Xml2Tre)

This peace of code was created in order to serve The Light Side of the Force.

## Install
#### Upload 
all the following files "xmltojson.js", "jsontotree.js" and "style.css" to the server.

#### Add 
```html
<script src="xmltojson.js"></script>
<script src="jsontotree.js"></script>
```
to your html file.

#### Introduce 
a new div:
```html
<div class="chart1"></div>
```

#### Call
`xmltotree` function with div class name you just introduced and a path to the XML file:
```html
<script>
  xmltotree("chart1", "ExampleTopology.xml", [], [])
</script>
```

## Options
First [ ] in `xmltotree` is responsible for nodes that should be shown on the second level of the tree, for example:

	["firstScrewDriver", "secondScrewDriver"]

in this case, only those two elements will be shown on the second level, other nodes will be inserted into the node, marked "Extra".

The second [ ] is responsible for showing the attributes that are written under the name of the node. 

If you want to add any additional attributes besides "name", "type" and "value", you can write down their names there, for example:

	["licenseVersion"]

In order to see the example, upload "example.html" along with "ExampleTopology.xml" to the web server.

## License.
MIT License. Copyright (c) 2016-2017 Maxim Maltsev.
