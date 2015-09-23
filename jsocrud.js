var helpers = require('./helpers');

/**
 * jsocrud module
 * @constructor
 */
function jsocrud() {}

/**
 * Attempts to insert the given value into the given object at the given path.
 * If attempting insert a deep value, all layers to that path must already exist in the object.
 * @param {Object} object Object in which to insert the value
 * @param {String} path Path in the object to set the value - Example: ["foo"][2].bar
 * @param {Object|Array|String|Boolean|Number} value Value to insert into the object
 * @returns {Object} Object after insertion
 */
jsocrud.insert = function(object, path, value) {
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
 * @param {String} path Path in the object where the desired data exists (e.g. ["foo"][2].bar)
 * @param {Object|Array|String|Boolean|Number} defaultReturnValue *Optional* default return value if this.get() retrieves
 * undefined or an error occurs. User beware: if undefined is passed as this argument,
 * this function will act as if no default return value was set.
 * @returns {Object|Array|String|Boolean|Number} Value in the object at the specified path
 */
jsocrud.get = function(object, path, defaultReturnValue) {
    var parsedPath = helpers.parsePath(helpers.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < parsedPath.length; ++i) {
            currentObject = currentObject[parsedPath[i]];
        }
        if (typeof currentObject === 'undefined') {
            throw new Error('Not found');
        }
        return currentObject;
    }
    catch (e) {
        if (typeof defaultReturnValue === 'undefined') {
            throw new Error('No entity exists in the given object at the given path');
        }
        return defaultReturnValue;
    }
};

/**
 * Sets the given value in the given object at the given path
 * @param {Object} object Object in which value will be set
 * @param {String} path Path in the object to set the value (e.g. ["foo"][2].bar)
 * @param {Object|Array|String|Boolean|Number} value Value to set in the object
 * @returns {Object} Object after setting value
 */
jsocrud.set = function(object, path, value) {
    var parsedPath = helpers.parsePath(helpers.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < parsedPath.length-1; ++i) {
            currentObject = currentObject[parsedPath[i]];
        }
        currentObject[parsedPath[i]] = value;
        return object;
    }
    catch (e) {
        throw new Error('There was an error setting the given value at the given path');
    }
};

/**
 * Deletes data from an object at the specified path
 * @param {Object} object Object from which data is to be deleted
 * @param {String} path Path in the object to delete (e.g. ["foo"][2].bar)
 * @returns {Object} Object after removal
 */
jsocrud.remove = function(object, path) {
    var parsedPath = helpers.parsePath(helpers.validatePath(path));
    try {
        var i;
        var currentObject = object;
        for (i=0; i < parsedPath.length-1; ++i) {
            currentObject = currentObject[parsedPath[i]];
        }
        delete currentObject[parsedPath[i]];
        return object;
    }
    catch (e) {
        throw new Error('There was an error deleting from the given object at the given path');
    }
};

// Exports ---------------------------------------------------------------------
module.exports = {
    insert: jsocrud.insert,
    get: jsocrud.get,
    set: jsocrud.set,
    remove: jsocrud.remove,
    create: jsocrud.insert,
    read: jsocrud.get,
    update: jsocrud.set,
    del: jsocrud.remove,
};
