var PATH_VALIDATION_REGEX = /^((\.\w+)|(\[(('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")|(\d+))\]))+$/;

/**
 * jsocrud module
 * @constructor
 */
function jsocrud() {}

/**
 * Validates the given path. Adds a leading "." if necessary.
 * @param {String} path Path in an object - Example: ["foo"][2].bar
 * @returns {String} Validated path string
 */
jsocrud.validatePath = function(path) {
    if (typeof path !== 'string' || !path) {
        throw new Error('Argument "path" must be a non-empty string.')
    }
    var firstCharacter = path[0];
    if (firstCharacter !== '[' && firstCharacter !== '.') {
        if (firstCharacter !== '\'' && firstCharacter !== '"') {
            path = '.' + path;
        }
    }
    if (!PATH_VALIDATION_REGEX.test(path)) {
        throw new Error(path + ' is not a valid path');
    }
    return path;
};

/**
 * Attempts to insert the given value into the given object at the given path.
 * If attempting insert a deep value, all layers to that path must already exist in the object.
 * @param {Object} object Object in which to insert the value
 * @param {String} path Path in the object to set the value - Example: ["foo"][2].bar
 * @param {Object|Array|String|Boolean|Number} value Value to insert into the object
 * @returns {Object} Object after insertion
 */
jsocrud.insert = function(object, path, value) {
    path = this.validatePath(path);
    try {
        var exists = (typeof this.get(object, path) !== 'undefined');
    }
    catch (e) {
        exists = false;
    }
    if (exists) {
        throw new Error('An entity already exists at path: ' + path);
    }
    return this.set(object, path, value);
};

/**
 * Gets the value from the given object at the given path
 * @param {Object} object Object from which data is to be retrieved
 * @param {String} path Path in the object where the desired data exists - Example: ["foo"][2].bar
 * @param {Object|Array|String|Boolean|Number} defaultReturnValue *Optional* default return value if this.get() retrieves
 * undefined or an error occurs. User beware: if undefined is passed as this argument,
 * this function will act as if no default return value was set.
 * @returns {Object|Array|String|Boolean|Number} Value in the object at the specified path
 */
jsocrud.get = function(object, path, defaultReturnValue) {
    var splitPath = _splitPath(this.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < splitPath.length; ++i) {
            currentObject = currentObject[splitPath[i]];
        }
        var result = currentObject;
        if (typeof result === 'undefined') {
            throw new Error('Not found');
        }
        return result;
    }
    catch (e) {
        if (typeof defaultReturnValue === 'undefined') {
            throw new Error('No entity exists in the given object at path: ' + path);
        }
        return defaultReturnValue;
    }
};

/**
 * Sets the given value in the given object at the given path
 * @param {Object} object Object in which value will be set
 * @param {String} path Path in the object to set the value - Example: ["foo"][2].bar
 * @param {Object|Array|String|Boolean|Number} value Value to set in the object
 * @returns {Object} Object after setting value
 */
jsocrud.set = function(object, path, value) {
    var splitPath = _splitPath(this.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < splitPath.length-1; ++i) {
            currentObject = currentObject[splitPath[i]];
        }
        currentObject[splitPath[i]] = value;
        return object;
    }
    catch (e) {
        throw new Error('There was an error setting the given value at the path: ' + path);
    }
};

/**
 * Deletes data from an object at the specified path
 * @param {Object} object Object from which data is to be deleted
 * @param {String} path Path in the object to delete - Example: ["foo"][2].bar
 * @returns {Object} Object after removal
 */
jsocrud.remove = function(object, path) {
    var splitPath = _splitPath(this.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < splitPath.length-1; ++i) {
            currentObject = currentObject[splitPath[i]];
        }
        delete currentObject[splitPath[i]];
        return object;
    }
    catch (e) {
        throw new Error('There was an error deleting from the given object at path: ' + path);
    }
};

/**
 * *This function is not included in exports*
 * Split a validated path into components
 * @param {String} validatedPath Validated path - Example: ["foo"][2].bar
 * @returns {Array} Path components
 * @private
 */
function _splitPath(validatedPath) {
    var pathSplitRegex = /(\.\w+)|(\[(('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")|(\d+))\])/g;
    var splitPath = [];
    var match;
    while (match = pathSplitRegex.exec(validatedPath)) {
        match = match[0];
        if (match.indexOf('.') === 0) {
            match = match.substring(1, match.length);
        }
        else if (match.indexOf('["') === 0 || match.indexOf('[\'') === 0) {
            match = match.substring(2, match.length - 2);
        }
        else if (match.indexOf('[') === 0) {
            match = parseInt(match.substring(1, match.length - 1));
        }
        else {
            throw new Error('Malformed path match: "' + match + '".')
        }
        splitPath.push(match);
    }
    return splitPath;
}

// Exports ---------------------------------------------------------------------
module.exports = {
    validatePath: jsocrud.validatePath,
    insert: jsocrud.insert,
    get: jsocrud.get,
    set: jsocrud.set,
    remove: jsocrud.remove
};
