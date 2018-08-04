# Express Plugable Routes
Load ExpressJS routes dynamic at runtime by placing them into a specified folder.

<ul>
    <li><a href="#install">Install</a></li>
    <li><a href="#usage">How to use</a></li>
    <li><a href="#dependencies">Dependencies</a></li>
    <li><a href="#license">License</a></li>
</ul>

<a name="install"></a>
# Install
`npm install express-plugable-routes`

`yarn add express-plugable-routes`

<a name="usage"></a>
# How to use

#### How to initialise the module

In your project, first declare the module
```javascript 1.8
const express = require('express');
const ExpressPlugableRoutes = require('express-plugable-routes');

const app = express();

// add your regular ExpressJS middleware and other logic such as:

/*
 * Add your 404 error logic here
 */
function error404(req, res, next){
    //...
}
app.use(error404);

/*
 * Add your other error logic here
 */
function errorHandler(req, res, next){
    //...
}
app.use(errorHandler);
```

Next, gather the required parameters and create a new instance
```javascript
const addonFolder = `${__dirname}/addons`; // This is the folder where you drop your runtime plugable routes in
const watchFor = `${addonFolder}/**/config.json`; // The file to watch which contains all the required information about the new route. See Chokidar for more info on this
const chokidarOpts = {ignored: /^\./, persistent: true}; // The options for Chokidar

new ExpressPlugableRoutes(app, addonFolder, watchFor, chokidarOpts, error404, errorHandler);

// That's it!

module.exports = app;
```

#### How to list the added routes
To prevent running and requiring an external database, an 'in-memory' database (LokiJS) is used.

So getting a list of installed routes is easily achieved:
```javascript
const Loki = require('lokijs');

const db = new Loki('ExpressPlugableRoutes');
db.loadDatabase({}, function() {
    console.log(db.getCollection("plugins").data);
});
```

#### Required in the 'config.json'
The bare minimum should contain:
```javascript
{
    "name": "myCustomRoutes",               // name of the module
    "main": "index.js",                     // incoming js file to use 
    "path": "/base-url-of-the-routes",      // base url the module is mounted on
    "rootFolder": "myCustomRoutesFolder"    // folder path relative to the addon folder up to the main file
}
```

<a name="dependencies"></a>
# Dependencies

* Chokidar https://github.com/paulmillr/chokidar
* LokiJS https://github.com/techfort/LokiJS

<a name="license"></a>
# License
GNU AGPL v3

Copyright (&copy;) 2018 Max van de Laar 
https://www.maxvandelaar.com