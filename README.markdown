This is the IndecentDynamo test repository. To install it, clone this repository into your web server's document root, i.e. /var/www. If you have config files already, make sure to copy them into volumizer/app/config/; if you're just starting, you'll have to copy core.default.php and database.default.php to core.php and database.php respectively and modify them appropriately.

In core.php, the values you might want to modify are:
'debug': can be set to 0 for no error messages, 1 to show error messages, or 2 to show errors and MySQL queries
'Security.salt': should be modified, doesn't matter what
'Security.cipherSeed': should be modified, doesn't matter what

In database.php, you'll need to set up the values to coincide with your server's MySQL settings. For best results, make different databases for the default and test databases. Also, it's probably a Good Idea(™) to set up a user in MySQL that can only access the cake databases, rather than using the root user and password.
