function xmltotree(divClass, file, JSONRaw) {
	if (JSONText) {
		var JSONText = readTextFile(file);
		drawTree(divClass, JSONText, 100, 100);
	} else {
		var XMLText = readTextFile(file);
		var tagArray = XMLToArray(XMLText);  // returns an array of all nodes with related info
		var JSONText = ArrayToJSON(tagArray);  // converts an array into a JSON file
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

function ArrayToJSON(tagArray) {
	var JSONText = [];
	var root = new Object();				
	root = ObjToJSON(tagArray, 0, false);
	JSONText.push(root);
	return JSONText
}
			
function ObjToJSON(tagArray, id, parent) {
	var node = new Object();  // we create an empty object and save there all the relevant information about the node
	node.name = tagArray[id].tag;
	node.value = tagArray[id].value;
	if (parent == false) {
		node.parent = "null"
	} else {
		node.parent = parent.name;
	}
	node.children = [];
	for (var i=0; i<tagArray[id].children.length; i++) {  // for all children of the node we do the same
		node.children.push(ObjToJSON(tagArray, tagArray[id].children[i]-1, node));
	}
	return node
}