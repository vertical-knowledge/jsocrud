var PATH_VALIDATION_REGEX = /^((\.[_a-zA-Z$][_a-zA-Z0-9$]*)|(\[(('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")|(\d+))\]))+$/;

/**
 * Storage for a validated path
 * @param {String} path - Full validated path
 * @param {String|Null} firstPathPart - "Converted" first path if necessary (see helpers::convertFirstPathPart)
 * @param {String|Null} pathRemainder - "Converted" remainder of the path if necessary (see helpers::convertFirstPathPart)
 * @constructor
 */
function ValidatedPath(path, firstPathPart, pathRemainder) {
    this.path = path;
    this.firstPathPart = firstPathPart;
    this.pathRemainder = pathRemainder;
}

/**
 * helpers for jsocrud
 * @constructor
 */
function helpers() {}

/**
 * Look backwards from a position in a string to discern whether or not the character
 * at the given position is escaped.
 * Note: This does not look forward in the string from the given position, so be
 * mindful of cases where that will bite you in the ass (e.g. "\\\" character at index 1)
 * @param {Number} characterIndex Index of the character to check
 * @param {String} inputString Entire string to check
 * @returns {Boolean} True if the character is escaped else False
 */
helpers.isEscaped = function(characterIndex, inputString) {
    var escapeCharactersEncountered = 0;
    while (characterIndex) {
        characterIndex -= 1;
        if (inputString[characterIndex] == '\\') {
            ++escapeCharactersEncountered;
        } else {
            break;
        }
    }
    return Boolean(escapeCharactersEncountered % 2);
};

/**
 * Format a pathPart, returning it in bracket notation with previously unescaped
 * double-quotes now escaped
 * @param {String} pathPart Component of a jsocrud path to format in bracket notation
 * @returns {String} Formatted first path part (in bracket notation)
 */
helpers.formatFirstPathPart = function(pathPart) {
    var quoteRegex = /\"/g;
    if (pathPart.search(/^\d+$/) !== -1) {
        return '[' + pathPart + ']';
    }
    while (match = quoteRegex.exec(pathPart)) {
        if (!this.isEscaped(quoteRegex.lastIndex-1, pathPart)) {
            pathPart = pathPart.substring(0, quoteRegex.lastIndex-1) + '\\' +
                pathPart.substring(quoteRegex.lastIndex-1, pathPart.length);
            quoteRegex.lastIndex += 1;
        }
    }
    return '["' + pathPart + '"]';
};

/**
 * Convert the first path 'part' of a path into bracket notation
 * @param {String} path Path (e.g. foo[2].bar)
 * @returns {ValidatedPath} ValidatedPath containing the correct path, firstPathPart
 * and pathRemainder
 */
helpers.convertFirstPathPart = function(path) {
    var pathPartRegex = /([^.[]*)(?:\.|\[)?/g;
    var pathPart = '';
    var firstPathPart, formattedPathPart;
    var previousIndex = -1;
    var pathRemainder = '';

    while (match = pathPartRegex.exec(path)) {
        var fullMatch = match[0];
        var delimiterIndex =  match[0].length - 1;
        var delimiter = match[0][delimiterIndex];

        pathPart += match[1]; // Add the entire non-delimited section to the pathPart

        if (delimiter && delimiter == '.' || delimiter == '[') {

            if (!this.isEscaped(pathPartRegex.lastIndex-1, path)) {
                firstPathPart = pathPart;
                formattedPathPart = this.formatFirstPathPart(pathPart);
                pathRemainder += delimiter;
                break;  // Break out of the loop when we find an unescaped delimiter
            }

            pathPart += delimiter;  // The delimiter should be included in the path part if it's escaped
        }

        // If our previousIndex is our currentIndex, we are stuck in an endless loop
        if (previousIndex == pathPartRegex.lastIndex) {
            break;
        }
        previousIndex = pathPartRegex.lastIndex;

    }

    // If the regex never did any processing on the path, just set the path part
    // to be the full path in bracket notation
    if (!formattedPathPart) {
        firstPathPart = path;
        formattedPathPart = this.formatFirstPathPart(path);
        pathPartRegex.lastIndex = path.length + 1;
    }

    pathRemainder = pathRemainder + path.substr(pathPartRegex.lastIndex, path.length);
    return new ValidatedPath(formattedPathPart + pathRemainder, firstPathPart, pathRemainder)
};

/**
 * Validates the given path and converts the first path part to bracket notation if necessary
 * @param {String} path Path in an object (e.g. ["foo"][2].bar)
 * @returns {ValidatedPath} Validated path data
 */
helpers.validatePath = function(path) {
    if (typeof path !== 'string' || !path) {
        throw new Error('Argument "path" must be a non-empty string.')
    }

    try {
        var firstCharacter = path[0];
        var validatedPath;
        if (firstCharacter !== '[' && firstCharacter !== '.') {
            validatedPath = this.convertFirstPathPart(path);
            path = validatedPath.path;
        }
        if (!PATH_VALIDATION_REGEX.test(path)) {
            throw new Error('The given path is not valid');
        }
        if (validatedPath) {
            return validatedPath;
        }
        return new ValidatedPath(path, '', '');
    } catch (e) {
        throw new Error('The given path is not valid');
    }
};

/**
 * Parse a validated path into components
 * @param {ValidatedPath} validatedPath Validated path data
 * @returns {Array} Path components
 */
helpers.parsePath = function(validatedPath) {
    var pathSplitRegex = /(\.[[_a-zA-Z$][_a-zA-Z0-9$]+)|(\[(('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")|(\d+))\])/g;
    var parsedPath = [];
    var match;

    var path = validatedPath.path;
    if (validatedPath.firstPathPart) {
        path = validatedPath.pathRemainder;
        parsedPath.push(validatedPath.firstPathPart);
    }

    while (match = pathSplitRegex.exec(path)) {
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
        parsedPath.push(match);
    }
    return parsedPath;
};

// Exports ---------------------------------------------------------------------
module.exports = {
    ValidatedPath: ValidatedPath,
    isEscaped: helpers.isEscaped,
    formatFirstPathPart: helpers.formatFirstPathPart,
    convertFirstPathPart: helpers.convertFirstPathPart,
    validatePath: helpers.validatePath,
    parsePath: helpers.parsePath,
};