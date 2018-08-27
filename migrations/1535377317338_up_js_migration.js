module.exports = function(ctx) {

	// this example doesn't use context (ctx) so that examples
	// work from command line (if run with "migrate.js" script)

	console.log("up ...");

	// this is example with Promise but you don't have to return Promise from your migration
	// you don't have to return anything
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve('response from javascript');
		}, 1000);
	});
};