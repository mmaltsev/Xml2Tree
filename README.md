# [XML2Tree](https://github.com/mmaltsev/XML2Tree)

XML2Tree is a library for visualizing data in XML format in the browser as a tree, built with d3.js.

## Install

#### Add 
```html
<script src="xmltojson.js"></script>
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


## License.
MIT License. Copyright (c) 2016-2017 Maxim Maltsev.
