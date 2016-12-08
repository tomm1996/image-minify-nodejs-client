# image-minify-nodejs-client

Promise-based nodejs client for [image-minify-api](https://github.com/ingowalther/image-minify-api)

## Setup

`npm install image-minify-nodejs-client --save`

## Usage

````javascript
// enter your api_key/api_host 
const imageMinfier = require('image-minify-nodejs-client')({api_key: 'api_host', api_host: 'api_key'});

let promise = imageMinfier.compress('/path/to/your/img');

promise.then((res) => {
	console.log(res.image);
	// log the compressed image as buffer
}, (err) => {
    console.log(err);
    // log the error message
});
````
