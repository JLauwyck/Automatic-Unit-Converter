function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    lbs: document.querySelector("#lbs").checked,
	fahrenheit: document.querySelector("#fahrenheit").checked
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#lbs").checked = result.lbs;// || true;
	document.querySelector("#fahrenheit").checked = result.fahrenheit;// || true;
  }
  
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get();
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);