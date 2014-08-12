nodejs-mysql-query-generator
============================

- parses optional get parameters of a nodejs get request url and generates a mysql query
- usage e.g. in REST API with extensive optional parameters for filtering

Constructor:
------------
```js
new QueryGenerator(defaultLimit);
```
For security reasons the construtor allows for providing a default limit value.
So if don't ever want to return more than x values, just put it in the constructor. If not, just leave it empty.

provides:
---------
function generateQueryAddition(url)
- takes req.url object and generates a mysql addition query that can be added to a base query

req.url query format
--------------------
/someUrl?column.modifier=value

column: column to be filtered
modifier: type of filtering action
value: value to be filtered for

###currently supported query modifiers:
modifier => mysql code => example

###general:
is => "=" => where column = value
siNot => "!=" => where column != value

###strings only
contains => "like" => where column like '%value%'
containsNot => "not like" => where column not like '%value%'
startsWith => "like value%" => where columne like 'value%'
endsWith => "like %value" => where columne like '%value'

###numbers only:
less => "<" => where column < value
lessOrEqual => "<=" => where column <= value
greater => ">" => where column > value
greaterOrEqual => ">=" => where column >= value

illegal (those that are not supported) modifiers will be ignored

###exception
?limit=value
limits the returned results to a certain number of entries and doesn't require any modifier

query example:
--------------
?name.rocks=7&email.contains=@gmail&id.greater=10&id.lessOrEqual=100&limit=8

would return
where email like '%@gmail%' and id > 10 and id <= 100 limit 8;

note: name.rocks is an illegal modifier and therefore ignored

usage example:
--------------
```js
app.get('/someUrl', function(req, res){
    var QueryGenerator = require('mysql-query-generator');
    var handler = new QueryGenerator(100);
    var queryAddition = handler.generateQueryAddition(req.url);
    var completeQuery = 'select id, username, email from users ' + queryAddition;
});

// assuming a req.url querystring like so: ?username.is=john&email.contains=john.doe&id.greaterOrEqual=10&limit=5
// the complete query would be
var completeQuery = 'select id, username, email from users where name = \'john\' and email like \'%john.doe%\' and id >= 10 limit 5;
```

Security as of v0.3.0
------------------------
### Injections
To prevent sql injections certain characters and keywords are not allowed like:
- quotes
- whitespaces

### Limit number of returned entries
You can provide a default limit in the constructor to make sure no more than that number of entries is returned.

NPM
---
[Check it out at NPM!](https://www.npmjs.org/package/mysql-query-generator).
npm install mysql-query-generator

### Originally intended as an addition to [query-sql](https://www.npmjs.org/package/query-sql).
Easily generate simple queries using query-sql. Then automatically parse url get string and add the result as where clause for more extensive filtering.

License
-------
[MIT](http://cheeaun.mit-license.org/)

