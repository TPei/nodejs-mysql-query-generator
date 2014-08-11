/**
 * @author Thomas Peikert
 * created: 11/08/14.
 */

/**
 * create QueryGenerator object with or without default return entry count limit
 * @param optional defaultLimit
 * @constructor
 */
function QueryGenerator(defaultLimit) {
    this.limit = defaultLimit;
}

/**
 * handles optional query parameters from given request url
 *
 * format ?columnName.queryType=value
 *
 * @param url nodejs req.url object
 * @returns {string} mysql query addition
 * e.g. WHERE name = 'value' and country like '%{ger}%' and year <= 2011 and year >= 2008
 * that can then be added to the base query e.g. select * from 'table'
 */
QueryGenerator.prototype.generateQueryAddition = function(url) {
    var queryObject = getQueryObject(url);

    // dictionary of allowed queries
    var queryDictionary = {};
    // general
    queryDictionary['is'] = '=';
    queryDictionary['limit'] = 'limit';

    // string only
    queryDictionary['contains'] = 'like';

    // number only
    queryDictionary['less'] = '<';
    queryDictionary['lessOrEqual'] = '<=';
    queryDictionary['greater'] = '>';
    queryDictionary['greaterOrEqual'] = '>=';

    if(this.limit)
    // number of returned entries is limited to a set number of entries
        if(!queryObject['limit'] || queryObject['limit'] > this.limit)
        // must be string like all arguments that are pulled from query string
            queryObject['limit'] = '' + this.limit;

    var queryString = ' where ';
    for(var property in queryObject){

        var column = property.split('.')[0];
        var query = queryDictionary[property.split('.')[1]];
        var value = queryObject[property];

        // escape string detection to protect against mysql injections
        if(value.match(/[_\W]/)) {
            continue;
        }

        // mysql like queries look like this:
        // where name like %nameColumnStringContainsThisSubstring%
        if(query == 'like')
            value = '%'+value+'%';
        else if((query == undefined || query == null) && column != 'limit')
            continue;

        // non-number values must be encased by apostrophes like so:
        // where name = 'bla'
        if(isNaN(value))
            value = '\''+value+'\'';

        // limit must be last argument
        if(column == 'limit'){
            if(queryString == ' where ')
                queryString = ' ' + column + ' ' + value + ' and ';
            else if(queryString.substring(queryString.length-4, queryString.length) == 'and '){
                queryString =  queryString.substring(0, queryString.length-4) + column + ' ' + value + ' and ';
            }
            else
                queryString += column + ' ' + value + ' and ';
        }
        else
            queryString += column + ' ' + query + ' ' + value + ' and ';
    }

    queryString = queryString.substring(0, queryString.length-5) + ';';

    return queryString;
};

/**
 * generate complete mysql query
 *
 * @param selector
 * @param table
 * @param url
 * @returns {string}
 */
QueryGenerator.prototype.generateCompleteQuery = function(selector, table, url) {
    var queryAddition = module.exports.generateQueryAddition(url);
    return 'select ' + selector + ' from ' + table + queryAddition;
}

/**
 * parses queryobject from url
 * @param url
 * @returns {*}
 */
function getQueryObject(url) {
    var urlParser = require('url');
    var querystringParser = require('querystring');


    var querystring = urlParser.parse(url);
    return querystringParser.parse(querystring['query']);
}

module.exports = QueryGenerator;
