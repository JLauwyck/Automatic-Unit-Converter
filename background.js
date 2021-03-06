/*
 * This file is responsible for performing the logic of replacing
 * all occurrences of each number written in lbs with its kg counterpart.
 */

var regexpGewicht = /\d+(,|\.)?\d*\s?((l|L)(b|B)(s|S)?|((P|p)ound(s|)))/g;
var regexpTemp = /(((-|-|−)\s|(-|-|−))?\d+(,|\.)?\d*\s?(°?(F|f)(ahrenheit)?)\W)/g;

var regexpGetal = /((-|-|−)\s|(-|-|−))?\d+(,|\.)?\d*/i;

var LBS = true;
var FAHRENHEIT = true;


	//Converts weight measured in lbs to weight in kg
	//Only floating point numbers are working
	//Commaseperated values (as is common in Europe) are not recognized and will result in NaN
function convertGewicht(number){
	var kilo = number * 0.45359237;
	return Math.round(kilo * 100) / 100;
}

	//Converts temperature measured in fahrenheit to temperature in celsius
	//Only floating point numbers are working
	//Commaseperated values (as is common in Europe) are not recognized and will result in NaN
function convertTemp(number){
	var test = number.valueOf();
	var deel1 = (test - 32);
	var deel2 = (deel1 / 9);
	var deel3 = (deel2 * 5);
	return Math.round(deel3 * 100) / 100;
}





 function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
  LBS = item.lbs;
  FAHRENHEIT = item.fahrenheit;

  replaceText(document.body);
}

var getItems = browser.storage.local.get();
getItems.then(onGot, onError);






/**
 * Substitute.
 * If the node contains more than just text (ex: it has child nodes),
 * call replaceText() on each of its children.
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the emoji substitution is done inline.
 */
function replaceText (node) {
  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode &&
        (node.parentNode.nodeName === 'TEXTAREA' || node.parentNode.nodeName === 'INPUT' || node.parentNode.isContentEditable)){ 
		//Input fields shouldn't change.
      return;
    }
	if(node.isContentEditable){ //editable fields should stay untouched.
		return;
	}

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    let content = node.textContent;
	//boolean to check whether there needs to be an update to the node.
	var edited = false;
	
	if(LBS){
		//Detect a weight in lbs and convert every instance of it in 'content' to
		//corresponding weight in kg.
		var match = regexpGewicht.exec(content);
		while (match != null) {
			var getal = regexpGetal.exec(match[0]);
			var gewicht = getal[0];
			//Weights above 1,000 are often epicted with a comma. 
			//As described above, this results in NaN
			//Here we delete every comma (shouldn't be a problem for other notations
			//where a comma is used to indicate float, because this is usually done 
			//in combination with KG)
			gewicht = gewicht.replace(/,/g, "");
			var kg = convertGewicht(gewicht);
			if(!isNaN(kg)){
					/*<div class="couponcode">Second Link
						<span class="coupontooltip"> Content 2</span>
					</div>*/
				//Endless loop => match[0] is itself also a match, so it keeps repeating itself.
				//var nieuw = "<div class=\"toolAUC\">" + kg + " kg " + "<span class=\"tooltipAUC\">"+ match[0]+" </span> </div>";
				//console.log(nieuw);
				var nieuw = kg+" kg";
				content = content.replace(match[0], nieuw);
				edited = true;
			}
			
			//Search for next instance of weight in same sentence/content.
			match = regexpGewicht.exec(content);
		}
	}
	
	
	if(FAHRENHEIT){
		var match = regexpTemp.exec(content);
		while (match != null) {
			var getal = regexpGetal.exec(match[0]);
			var temp = getal[0];
			var last = match[0].slice(-1);
			temp = temp.replace(/,/g, ".");
			temp = temp.replace(/(-|-|−)\s/g, "-");
			
			var celsius = convertTemp(temp);
			if(!isNaN(celsius)){
				var nieuw = celsius + " °Celsius" + last;
				content = content.replace(match[0], nieuw);
				edited = true;
			}
			
			//Search for next instance of weight in same sentence/content.
			match = regexpTemp.exec(content);
		}
	}

	if(edited){
		// Now that all the replacements are done, perform the DOM manipulation.
		// But only if there is something to replace.
		node.textContent = content;
	}
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
		if(!node.childNodes[i].isContentEditable){
			// If parent node is editable, skip the children. They will likely also be editable (see Gmail for example).
			replaceText(node.childNodes[i]);
	  }
    }    
  }
}

// Start the recursion from the body tag.
//replaceText(document.body);

// Now monitor the DOM for additions and substitute emoji into new nodes.
// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // This DOM change was new nodes being added. Run our substitution
      // algorithm on each newly added node.
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        replaceText(newNode);
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
