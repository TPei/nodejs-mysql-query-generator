nodejs-mysql-query-generator
============================

parses optional get parameters of a nodejs get request url and generates a mysql query

provides two functions:
function generateCompleteQuery(selector, table, url)
- takes mysql query selector, targeted table and nodejs req.url object and returns complete mysql query
e.g. generateCompleteQuery('id, name, description', 'users', req.url)

function generateQueryAddition(url)
- takes only req url and generates a mysql addition query that can be added to a base query

req.url query format
/someUrl?column.modifier=value

column: column to be filtered
modifier: type of filtering action
value: value to be filtered for

currently supported query modifiers:
modifier => mysql code => example

general:
is => "=" => where column = value

strings only
contains => "like" => where column like '%value%'

numbers only:
less => "<" => where column < value
lessOrEqual => "<=" => where column <= value
greater => ">" => where column > value
greaterOrEqual => ">=" => where column >= value

illegal (those that are not supported) modifiers will be ignored

exception
?limit=value
limits the returned results to a certain number of entries and doesn't require any modifier

query example:
?name.rocks=7&email.contains=@gmail&id.greater=10&id.lessOrEqual=100&limit=8

would return
where email like '%@gmail%' and id > 10 and id <= 100 limit 8;

note: name.rocks is an illegal modifier and therefore ignored

usage example:
app.get('/someUrl', function(req, res){
    var queryGenerator = require('mysql-query-generator');
    var completeQuery = queryGenerator.generateCompleteQuery('id, username, email', 'users', req.url);
});

// or:
var queryAddition = queryGenerator.generateQueryAddition(req.url);
var completeQuery = 'select id, username, email from users ' + queryAddition;

// assuming a req.url querystring like so: ?username.is=john&email.contains=john.doe&id.greaterOrEqual=10&limit=5
// the complete query in both cases would be
var completeQuery = 'select id, username, email from users where name = \'john\' and email like \'%john.doe%\' and id >= 10 limit 5;

