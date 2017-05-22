function xmltotree(divClass, file, impNodes, impAttr, ifJSON) {
	if (ifJSON) {
		var newText = readTextFile(file);
		var newObj = JSON.parse(newText);
		var mapArray = JSONToArray(newObj);
		var JSONText = arrayToJSON(mapArray);  // converts array into a JSON file
		if (newObj.results.bindings.length > 4) {
			drawTree(divClass, JSONText, newObj.results.bindings.length*2, 5);
			//return "good";
		} else {
			drawTree(divClass, JSONText, 6, 5);
			//return "good";
		}
	} else {
		var XMLText = readTextFile(file);
		var tagArray = XMLToArray(XMLText);  // returns an array of all nodes with related info
		var mapArray = arrayMapping(tagArray, impNodes, impAttr)
		var JSONText = arrayToJSON(mapArray);  // converts array into a JSON file
		var maxDepth = 0;  // we evaluate the maxDepth of the tree in order to draw a frame for it
		var maxWidth = 0;  // we evaluate the maxWidth of the tree in order to draw a frame for it
		var depthArray = [];
		for(var i=0; i<=tagArray.length; i++) {
				depthArray.push(0);
		}
		for (var i=0; i<tagArray.length; i++) {
			if (tagArray[i].depth > maxWidth) {
				maxWidth = tagArray[i].depth;
			}
			depthArray[tagArray[i].depth] += 1;
		}
		maxWidth += 1;
		maxDepth = Math.max.apply(null, depthArray);
		divClass = "."+divClass;
		drawTree(divClass, JSONText, maxDepth, maxWidth);
		//return "good";
	}
}

function readTextFile(file){
	var allText = "";
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
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

function JSONToArray(newObj) {  // creating an array of all objects that needed to be visualized
	var totalIdNum = 1;
	var mapArray = [];
	var rootObj = new Object();
	rootObj = objInit(totalIdNum, 0, [], 0, 'results', '', '', '', '');
	mapArray.push(rootObj);
	for (var i=0; i<newObj.results.bindings.length; i++) {
		var depth = 1;
		if (newObj.results.bindings[i].s) {  //subject
			totalIdNum += 1;
			rootObj.children.push(totalIdNum);
			var subjectObj = new Object();
			subjectObj = objInit(totalIdNum, 1, [], depth, "subject", '', newObj.results.bindings[i].s.type, newObj.results.bindings[i].s.value, '');
			mapArray.push(subjectObj);
			depth += 1;
		}
		if (newObj.results.bindings[i].p) {  // predicate
			totalIdNum += 1;
			subjectObj.children.push(totalIdNum);
			var predicatObj = new Object();
			predicatObj = objInit(totalIdNum, totalIdNum-1, [], depth, "predicate", '', newObj.results.bindings[i].p.type, newObj.results.bindings[i].p.value, '');
			mapArray.push(predicatObj);
			depth += 1;
		}
		if (newObj.results.bindings[i].o) {  // object
			totalIdNum += 1;
			predicatObj.children.push(totalIdNum);
			var objectObj = new Object();
			objectObj = objInit(totalIdNum, totalIdNum-1, [], depth, "object", '', newObj.results.bindings[i].o.type, newObj.results.bindings[i].o.value, '');
			mapArray.push(objectObj);
			depth += 1;
		}
	}
	return mapArray
}
			
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
	for (var i=0; i<text.length; i++) {  // for all symbols in the text
		if (text[i] == '<' && !ifCurrentStringIsComment) {  // if we found an open tag and we are not writing a comment at the moment
			if (text[i+1] == '?') {  // if that's a headline
				ifCurrentStringIsHead = true;
			} else if (text[i+1] == '!' && text[i+2] == '-' && text[i+3] == '-') {  // if that's an end of a comment
				ifCurrentStringIsComment = true;
			} else if (text[i+1] == '!') {
				ifCurrentStringIsDocumentType = true;
			} else {
				if (tagStack.length) { // if tagStack is not empty
					while (currentString[currentString.length-1] == ' ') {
						currentString = currentString.substring(0, currentString.length-1);
					}
					tagArray[tagStack[tagStack.length-1].id-1].value = currentString;  // add the information that's outside tags
					currentString = '';
				}
				ifCurrentStringIsTag = true;  // start the next tag
			}
		} else if (text[i] == '>') {  // if we found a close tag
			if (ifCurrentStringIsHead) {  // if we are writing a headline
				if (text[i-1] == '?') {
					ifCurrentStringIsHead = false;
				} else {
					//
				}
			} else if (ifCurrentStringIsComment) {  // if we are writing a comment
				if (text[i-1] == '-' && text[i-2] == '-') {  // and that's the end of the comment
					ifCurrentStringIsComment = false;
				}
			} else if (ifCurrentStringIsDocumentType) {  // if we are writing the document type
				ifCurrentStringIsDocumentType = false;
			} else if (ifCurrentStringIsTag) {  // if we are writing the information that's inside tags
				if (text[i-1] == '/') {  // if the tag is closed inside itself
					newTag.tag = currentString.substring(0, currentString.length-1);  // isolating the information inside the tag
					currentString = '';
					id += 1;
					newTag.id = id;
					newTag.children = [];
					newTag.depth = tagStack.length;  // adding the depth level of the tag
					if (tagStack.length) {  // if there is smth in the stack
						newTag.parent = tagStack[tagStack.length-1].id;  // we save the last element of stack as current tag's parent
						tagArray[tagStack[tagStack.length-1].id-1].children.push(newTag.id);  // we add a current tag as a child to the last element
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
							newTag.parent = tagStack[tagStack.length-1].id;  // we save the last element of stack as current tag's parent
							tagArray[tagStack[tagStack.length-1].id-1].children.push(newTag.id);  // we add a current tag as a child to the last element
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
		alert("XML file is not correct!");
	}
	return tagArray;
}

function arrayMapping(tagArray, impNodes, impAttr) {  // parsing all the information inside the array
	var mapArray = attrTrans(tagArray, impAttr);
	if (impNodes.length) {
		var extra = new Object();
		extra.children = [];
		extra.depth = 1;
		extra.id = tagArray.length+1;
		extra.parent = 1;
		extra.type = "Extra";
		tagArray.push(extra);
		noMoreChildren = [];
		var ifChild = false;
		for (var i=0; i<tagArray.length-1; i++) {  // length - 1 because we want to exclude newly added tag 'Extra'
			if (tagArray[i].depth == 1) {
				ifChild = false;
				for (var j=0; j<impNodes.length; j++) {
					if (tagArray[i].type == impNodes[j]) {
						ifChild = true;
						break;
					}
				}
				if (!ifChild) {
					tagArray[i].parent = extra.id;
					tagArray[tagArray.length-1].children.push(tagArray[i].id);
					noMoreChildren.push(tagArray[i].id);
				}
			}
		}
		newRootChildren = [];
		for (var i=0; i<tagArray[0].children.length; i++) {
			var ifEqual = false;
			for (var j=0; j<noMoreChildren.length; j++) {
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

function attrTrans(tagArray, impAttr) {  // dealing with attributes of the objects
	for (var i=0; i<tagArray.length; i++) {
		var tagString = tagArray[i].tag;
		var type = '';
		var name = '';
		var extra = '';
		for (var j=0; j<tagString.length; j++) {
			if (tagString[j] == ' ') {
				break;
			}
			type += tagString[j];
		}
		var index = tagString.search('="') + 2;
		if (index > 1) {
			for (var j=index; j<tagString.length; j++) {
				if (tagString[j] == '"') {
					break;
				}
				name += tagString[j];
			}
			tagArray[i].name = name;
			if (impAttr.length) {
				if (tagString.search(impAttr) != -1) {
					for (var j=tagString.search(impAttr[0]) + impAttr[0].length + 2; tagString[j] != '"'; j++) {
						extra += tagString[j];
					}
				}
			}
			tagArray[i].extra = extra;
		}
		tagArray[i].type = type;
	}
	return tagArray;
}

function arrayToJSON(tagArray) {  // converting array to json type
	var JSONText = [];
	var root = new Object();				
	root = objToJSON(tagArray, 0, false);
	JSONText.push(root);
	return JSONText
}
			
function objToJSON(tagArray, id, parent) {
	var node = new Object();  // we create an empty object and save there all the relevant information about the node
	node.value = tagArray[id].value;
	node.name = tagArray[id].name;
	node.extra = tagArray[id].extra;
	node.type = tagArray[id].type;
	if (parent == false) {
		node.parent = "null"
	} else {
		node.parent = parent.name;
	}
	node.children = [];
	for (var i=0; i<tagArray[id].children.length; i++) {  // for all children of the node we do the same
		node.children.push(objToJSON(tagArray, tagArray[id].children[i]-1, node));
	}
	return node
}