/*
 * This file is responsible for performing the logic of replacing
 * all occurrences of each number written in lbs with its kg counterpart.
 */

var regexpGewicht = /\d+(,|\.)?\d*\s?((l|L)(b|B)(s|S)?|((P|p)ound(s|)))/g;
var regexpTemp = /((-\s|-)?\d+(,|\.)?\d*\s?(°?(F|f)(ahrenheit)?))/g;

var regexpGetal = /(-\s|-)?\d+(,|\.)?\d*/i;


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
	var celsius = (((number - 32) / 9) * 5);
	return Math.round(celsius * 100) / 100;
}

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
        (node.parentNode.nodeName === 'TEXTAREA' || node.parentNode.nodeName === 'INPUT')){ 
		//Input fields shouldn't change.
      return;
    }

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    let content = node.textContent;

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
		var nieuw = kg + " kg";
		content = content.replace(match[0], nieuw);
		//Search for next instance of weight in same sentence/content.
		match = regexpGewicht.exec(content);
	}
	
	
	
	var match = regexpTemp.exec(content);
	while (match != null) {
		var getal = regexpGetal.exec(match[0]);
		var temp = getal[0];
		temp = temp.replace(/,/g, ".");
		temp = temp.replace(/-\s/g, "-");
		console.log(getal[0]);
		console.log(temp);
		var celsius = convertTemp(temp);
		var nieuw = celsius + " °Celsius ";
		content = content.replace(match[0], nieuw);
		
		//Search for next instance of weight in same sentence/content.
		match = regexpTemp.exec(content);
	}

    // Now that all the replacements are done, perform the DOM manipulation.
    node.textContent = content;
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i]);
    }    
  }
}

// Start the recursion from the body tag.
replaceText(document.body);

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
