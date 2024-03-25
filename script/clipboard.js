let $body = document.getElementsByTagName("body")[0]

function copyToClipboard(text) {
	var $tempInput = document.createElement('INPUT');
	$body.appendChild($tempInput);
	$tempInput.setAttribute('value', text)
	$tempInput.select();
	document.execCommand('copy');
	$body.removeChild($tempInput);
}