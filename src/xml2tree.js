/**
 * Main function. Specifies transformations that are needed for creating a JSON out of XML.
 * @constructor
 * @param {string} divClass - id of element that will contain a tree.
 * @param {string} file - Path to XML/JSON file.
 * @param {array} impNodes - Important nodes that should be shown on the second level of the tree.
 * @param {boolean} isAttributes - Whether to show or not all additional attributes.
 * @param {boolean} isJSON - Specifies type of the input (JSON/XML).
 */
function xml2tree(divClass, file, impNodes, isAttributes, isJSON) {
	if (isJSON) {
		var newText = readTextFile(file);
		var newObj = JSON.parse(newText);
		var mapArray = JSONToArray(newObj);
		var JSONText = arrayToJSON(mapArray);  // converts array into a JSON file
		if (newObj.results.bindings.length > 4) {
			drawTree(divClass, JSONText, newObj.results.bindings.length * 2, 5);
		} else {
			drawTree(divClass, JSONText, 6, 5);
		}
	} else {
		var XMLText = readTextFile(file);
		var tagArray = XMLToArray(XMLText);  // returns an array of all nodes with related info
		var mapArray = arrayMapping(tagArray, impNodes, isAttributes)
		var JSONText = arrayToJSON(mapArray);  // converts array into a JSON file
		var maxDepth = 0;  // we evaluate the maxDepth of the tree in order to draw a frame for it
		var maxWidth = 0;  // we evaluate the maxWidth of the tree in order to draw a frame for it
		var depthArray = [];
		for (var i = 0; i <= tagArray.length; i++) {
				depthArray.push(0);
		}
		for (var i = 0; i < tagArray.length; i++) {
			if (tagArray[i].depth > maxWidth) {
				maxWidth = tagArray[i].depth;
			}
			depthArray[tagArray[i].depth] += 1;
		}
		maxWidth += 1;
		maxDepth = Math.max.apply(null, depthArray);
		divClass = '.' + divClass;
		drawTree(divClass, JSONText, maxDepth, maxWidth);
	}
}

/**
 * Reads and returns content of the input file.
 * @constructor
 * @param {string} file - Path to XML/JSON file.
 */
function readTextFile(file){
	var allText = '';
	var rawFile = new XMLHttpRequest();
	rawFile.open('GET', file, false);
	rawFile.onreadystatechange = function () {
		if(rawFile.readyState === 4) {
			if(rawFile.status === 200 || rawFile.status == 0) {
				allText = rawFile.responseText;
			}
		}
	}
	rawFile.send(null);
	return allText;
}

/**
 * Creates an object out of information about the node
 * @constructor
 * @param {number} id - id of the node.
 * @param {number} parent - id of node's parent.
 * @param {array} children - ids of node's children.
 * @param {number} depth - Depth at which the node is aligned.
 * @param {string} name - Node name.
 * @param {string} tag - Node tag.
 * @param {string} type - Node type.
 * @param {string} value - Node value.
 * @param {string} extra - Extra information about the node.
 */
function objInit(id, parent, children, depth, name, tag, type, value, extra) {  // object initializing
	var obj = new Object();
	obj.id = id;
	obj.parent = parent;
	obj.children = children;
	obj.depth = depth;	
	obj.name = name;
	obj.tag = tag;
	obj.type = type;
	obj.value = value;
	obj.extra = extra;
	return obj;
}

/**
 * Creates an array out of JSON object.
 * @constructor
 * @param {object} newObj - JSON Object with input contents.
 */
function JSONToArray(newObj) {  // creating an array of all objects that needed to be visualized
	var totalIdNum = 1;
	var mapArray = [];
	var rootObj = new Object();
	rootObj = objInit(totalIdNum, 0, [], 0, 'results', '', '', '', '');
	mapArray.push(rootObj);
	for (var i = 0; i < newObj.results.bindings.length; i++) {
		var depth = 1;
		if (newObj.results.bindings[i].s) {  //subject
			totalIdNum += 1;
			rootObj.children.push(totalIdNum);
			var subjectObj = new Object();
			subjectObj = objInit(totalIdNum, 1, [], depth, 'subject', '', newObj.results.bindings[i].s.type, newObj.results.bindings[i].s.value, '');
			mapArray.push(subjectObj);
			depth += 1;
		}
		if (newObj.results.bindings[i].p) {  // predicate
			totalIdNum += 1;
			subjectObj.children.push(totalIdNum);
			var predicatObj = new Object();
			predicatObj = objInit(totalIdNum, totalIdNum - 1, [], depth, 'predicate', '', newObj.results.bindings[i].p.type, newObj.results.bindings[i].p.value, '');
			mapArray.push(predicatObj);
			depth += 1;
		}
		if (newObj.results.bindings[i].o) {  // object
			totalIdNum += 1;
			predicatObj.children.push(totalIdNum);
			var objectObj = new Object();
			objectObj = objInit(totalIdNum, totalIdNum - 1, [], depth, 'object', '', newObj.results.bindings[i].o.type, newObj.results.bindings[i].o.value, '');
			mapArray.push(objectObj);
			depth += 1;
		}
	}
	return mapArray
}

/**
 * Creates an array out of XML.
 * @constructor
 * @param {string} text - XML text with input contents.
 */		
function XMLToArray(text) {
	var head = '';
	var currentString = '';
	var documentType = '';
	var ifCurrentStringIsHead = false;
	var ifCurrentStringIsComment = false;
	var ifCurrentStringIsTag = false;
	var ifCurrentStringIsDocumentType = false;
	var newTag = new Object();
	var tagArray = [];
	var tagStack = [];
	var id = 0;
	for (var i = 0; i < text.length; i++) {  // for all symbols in the text
		if (text[i] == '<' && !ifCurrentStringIsComment) {  // if we found an open tag and we are not writing a comment at the moment
			if (text[i + 1] == '?') {  // if that's a headline
				ifCurrentStringIsHead = true;
			} else if (text[i + 1] == '!' && text[i + 2] == '-' && text[i + 3] == '-') {  // if that's an end of a comment
				ifCurrentStringIsComment = true;
			} else if (text[i + 1] == '!') {
				ifCurrentStringIsDocumentType = true;
			} else {
				if (tagStack.length) { // if tagStack is not empty
					while (currentString[currentString.length - 1] == ' ') {
						currentString = currentString.substring(0, currentString.length - 1);
					}
					tagArray[tagStack[tagStack.length - 1].id - 1].value = currentString;  // add the information that's outside tags
					currentString = '';
				}
				ifCurrentStringIsTag = true;  // start the next tag
			}
		} else if (text[i] == '>') {  // if we found a close tag
			if (ifCurrentStringIsHead) {  // if we are writing a headline
				if (text[i - 1] == '?') {
					ifCurrentStringIsHead = false;
				} else {
					//
				}
			} else if (ifCurrentStringIsComment) {  // if we are writing a comment
				if (text[i - 1] == '-' && text[i - 2] == '-') {  // and that's the end of the comment
					ifCurrentStringIsComment = false;
				}
			} else if (ifCurrentStringIsDocumentType) {  // if we are writing the document type
				ifCurrentStringIsDocumentType = false;
			} else if (ifCurrentStringIsTag) {  // if we are writing the information that's inside tags
				if (text[i - 1] == '/') {  // if the tag is closed inside itself
					newTag.tag = currentString.substring(0, currentString.length - 1);  // isolating the information inside the tag
					currentString = '';
					id += 1;
					newTag.id = id;
					newTag.children = [];
					newTag.depth = tagStack.length;  // adding the depth level of the tag
					if (tagStack.length) {  // if there is smth in the stack
						newTag.parent = tagStack[tagStack.length - 1].id;  // we save the last element of stack as current tag's parent
						tagArray[tagStack[tagStack.length - 1].id - 1].children.push(newTag.id);  // we add a current tag as a child to the last element
					} else {
						newTag.parent = 0;
					}
					tagArray.push(newTag);
				} else {
					if (currentString[0] == '/') {  // if it is a closing tag
						currentString = '';
						tagStack.pop();  // delete this tag from the stack
					} else {
						newTag.tag = currentString; 
						currentString = '';
						id += 1;
						newTag.id = id;
						newTag.children = [];
						newTag.depth = tagStack.length;  // adding the depth level of the tag
						if (tagStack.length) {  // if there is smth in the stack
							newTag.parent = tagStack[tagStack.length - 1].id;  // we save the last element of stack as current tag's parent
							tagArray[tagStack[tagStack.length - 1].id - 1].children.push(newTag.id);  // we add a current tag as a child to the last element
						} else {
							newTag.parent = 0;
						}
						tagArray.push(newTag);
						tagStack.push(newTag);
					}
				}
				ifCurrentStringIsTag = false;
				newTag={};
			}
		} else if (ifCurrentStringIsHead) {
			if (text[i] !== '?' && !(text[i] == '?' && text[i+1] == '>') && !(text[i] == '?' && text[i-1] == '<')) {
				head += text[i];
			} else {
				//
			}
		} else if (ifCurrentStringIsComment) {
			//
		} else if (ifCurrentStringIsTag) {
			currentString += text[i];
		} else if (ifCurrentStringIsDocumentType) {
			documentType += text[i];
		} else {  // avoid all the irrelevant symbols inside and outside the tags
			if (text[i] !== '\n' && text[i] != '\r' && text[i] != '\t' && !(text[i] == ' ' && !currentString.length)) {
				currentString += text[i];
			} else {
				//
			}
		}
	}
	if (tagStack.length) {  // if after the end of the process, the stack is not empty - means number of opening tags is bigger than closing
		console.error('XML file is not correct!');
	}
	return tagArray;
}

/**
 * Parses and processes all the information inside the array with input contents.
 * @constructor
 * @param {array} tagArray - Array of nodes' tags.
 * @param {array} impNodes - List of nodes that should be shown on the second level.
 * @param {boolean} isAttributes - Whether to show or not all additional attributes.
 */	
function arrayMapping(tagArray, impNodes, isAttributes) {
	var mapArray = attrTrans(tagArray, isAttributes);
	if (impNodes.length) {
		var extra = new Object();
		extra.children = [];
		extra.depth = 1;
		extra.id = tagArray.length+1;
		extra.parent = 1;
		extra.type = 'Extra';
		tagArray.push(extra);
		noMoreChildren = [];
		var ifChild = false;
		for (var i = 0; i < tagArray.length - 1; i++) {  // length - 1 because we want to exclude newly added tag 'Extra'
			if (tagArray[i].depth == 1) {
				ifChild = false;
				for (var j = 0; j < impNodes.length; j++) {
					if (tagArray[i].type == impNodes[j]) {
						ifChild = true;
						break;
					}
				}
				if (!ifChild) {
					tagArray[i].parent = extra.id;
					tagArray[tagArray.length - 1].children.push(tagArray[i].id);
					noMoreChildren.push(tagArray[i].id);
				}
			}
		}
		newRootChildren = [];
		for (var i = 0; i < tagArray[0].children.length; i++) {
			var ifEqual = false;
			for (var j = 0; j < noMoreChildren.length; j++) {
				if (tagArray[0].children[i] == noMoreChildren[j]) {
					ifEqual = true;
					break;
				}
			}
			if (!ifEqual) {
				newRootChildren.push(tagArray[0].children[i]);
			}
		}
		tagArray[0].children = newRootChildren;
		tagArray[0].children.push(extra.id);
	}
	return mapArray;
}

/**
 * Creates a final structure of an object to draw.
 * @constructor
 * @param {array} tagArray - Array of nodes' tags.
 * @param {boolean} isAttributes - Whether to show or not all additional attributes.
 */	
function attrTrans(tagArray, isAttributes) {  // dealing with attributes of the objects
	for (var i = 0; i < tagArray.length; i++) {
		var tagString = tagArray[i].tag;
		var nodeAttributes = tagString.split(" ");
		tagArray[i].type = '';
		tagArray[i].attr = [];
		for (var j = 0; j < nodeAttributes.length; j++) {
			if (j === 0) {
				tagArray[i].type = nodeAttributes[j];
			} else if (isAttributes) {
				tagArray[i].attr.push(nodeAttributes[j]);
			}
		}
	}
	return tagArray;
}

/**
 * Converts an array to JSON.
 * @constructor
 * @param {array} tagArray - Array of nodes' tags.
 */	
function arrayToJSON(tagArray) {  // converting array to json type
	var JSONText = [];
	var root = new Object();				
	root = objToJSON(tagArray, 0, false);
	JSONText.push(root);
	return JSONText
}

/**
 * Converts an object to JSON.
 * @constructor
 * @param {array} tagArray - Array of nodes' tags.
 * @param {array} id - id of the node.
 * @param {array} parent - id of node's parent.
 */			
function objToJSON(tagArray, id, parent) {
	var node = new Object();  // we create an empty object and save there all the relevant information about the node
	node.value = tagArray[id].value;
	node.name = tagArray[id].name;
	node.extra = tagArray[id].extra;
	node.type = tagArray[id].type;
	node.attr = tagArray[id].attr;
	if (parent == false) {
		node.parent = 'null'
	} else {
		node.parent = parent.name;
	}
	node.children = [];
	for (var i = 0; i < tagArray[id].children.length; i++) {  // for all children of the node we do the same
		node.children.push(objToJSON(tagArray, tagArray[id].children[i] - 1, node));
	}
	return node
}

/**
 * Draws a tree out of input using d3 library.
 * @constructor
 * @param {array} selectString - id of element that will contain a tree.
 * @param {array} treeData - Final JSON object.
 * @param {array} maxDepth - Maximum depth of the tree (for controling of drawn tree height).
 * @param {array} maxWidth - Maximum width of the tree (for controling of drawn tree width).
 */	
function drawTree(selectString, treeData, maxDepth, maxWidth) {
	var start = new Date().getTime();
	var margin = {top: 20, right: 120, bottom: 20, left: 120},
		width = maxWidth*400 - margin.right - margin.left,
		height = maxDepth*50 - margin.top - margin.bottom;
		
	var i = 0,
		duration = 750,
		root;
	
	var tree = d3.layout.tree()
		.size([height, width])
		.children(
			function(d) { 
				return d.children; 
			}
		);
	
	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });
	
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	root = treeData[0];
	root.x0 = height / 2;
	root.y0 = 0;
	
	function collapse(d) {
		if (d.children) {
			if (d.children.length) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}
	}
	
	root.children.forEach(collapse);
	update(root);
	
	
	d3.select(self.frameElement).style("height", "800px");
	
	function update(source) {
	
	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
		links = tree.links(nodes);
	
	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = d.depth * 300; });
	
	// Update the nodes
	var node = svg.selectAll("g.node")
		.data(nodes, function(d) { return d.ids || (d.ids = ++i); });
	
	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		.on("click", click);
	
	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", function(d) { 
			return d._children ? "lightsteelblue" : "#fff"; 
		}); //#fff
	
	function wordwrap2(text) {
		return text.split(" ")
	}   
	
	nodeEnter.append("text")
	.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
	.attr("dy", ".35em")
	.style("fill-opacity", 1e-6)
	.each(function (d) {
		var lines = [];
		var index = 0;
		if (d.value) {
			lines[index] = d.value;
			index += 1;
		}
		if (d.name) {
			lines[index] = d.name;
			index += 1;
		}
		if (d.extra) {
			lines[index] = d.extra;
			index += 1;
		}
		if (d.value && d.type) {
			lines[index] = d.type;
			index += 1;
			if (d.attr) {
				for (var k = 0; k < d.attr.length; k++) {
					lines[index] = d.attr[k];
					index += 1;
				}
			}
		}
		if (!d.value && d.type) {
			if (d.attr && d.attr.length) {
				lines[index] = d.attr[0];
				index += 1;
			}
			lines[index] = d.type;
			index += 1;
			if (d.attr && d.attr.length > 1) {
				for (var k = 1; k < d.attr.length; k++) {
					lines[index] = d.attr[k];
					index += 1;
				}
			}
		}
		if (!index) {
			lines[index] = "UnknownNode";
		}
		for (var i = 0; i < lines.length; i++) {
			if (i == 0) { // if that's the first line - make it bold
				d3.select(this).append("tspan")
					.attr("style", "font-weight: bold")
					.attr("dy",23)
					.attr("x",function(d) { 
						return d.children || d._children ? -10 : 10; })
					.text(lines[i])
			} else { // otherwise small font
				d3.select(this).append("tspan")
					.attr("style", "font: 8px sans-serif;")
					.attr("dy",13)
					.attr("x",function(d) { 
						return d.children || d._children ? -10 : 10; })
					.text(lines[i])
			}
		}
	}); 
	
	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
	
	nodeUpdate.select("circle")
		.attr("r", 4.5)
		.style("fill", function(d) { 
			return d._children ? "lightsteelblue" : "#fff"; 
		}); //#fff
	
	nodeUpdate.select("text")
		.style("fill-opacity", 1);
	
	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		.remove();
	
	nodeExit.select("circle")
		.attr("r", 1e-6);
	
	nodeExit.select("text")
		.style("fill-opacity", 1e-6);
	
	// Update the links…
	var link = svg.selectAll("path.link")
		.data(links, function(d) { return d.target.ids; });
	
	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};
			return diagonal({source: o, target: o});
		});
	
	// Transition links to their new position.
	link.transition()
		.duration(duration)
		.attr("d", diagonal);
	
	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
		.duration(duration)
		.attr("d", function(d) {
			var o = {x: source.x, y: source.y};
			return diagonal({source: o, target: o});
		})
		.remove();
	
	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
	}
	
	// Toggle children on click.
	function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
	update(d);
	}
	var elapsed = new Date().getTime() - start;
}
