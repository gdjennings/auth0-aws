'use strict';
const aws = require('aws-sdk');
const sts = new aws.STS();
var lib = require('./auth0');

module.exports.get_credentials = (event, context, callback) => {
	console.log(`event: ${JSON.stringify(event)}`);
	console.log(`context: ${JSON.stringify(context)}`);
	var params = {
		DurationSeconds: 3600,
		// ExternalId: "123ABC", 
		// Policy: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Stmt1\",\"Effect\":\"Allow\",\"Action\":\"s3:*\",\"Resource\":\"*\"}]}", 
		RoleArn: `arn:aws:sts::${event.requestContext.accountId}:role/${event.pathParameters.role}`,
		RoleSessionName: `${event.requestContext.authorizer.principalId}`.replace(/([^A-Za-z0-9\@\+\,\.\-]+)/gi, '_')
	};

	sts.assumeRole(params, function (err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
			const response = {
				statusCode: 500,
				body: JSON.stringify(err),
			};

			callback(null, response);

		} else {
			console.log(data);           // successful response
			const response = {
				statusCode: 200,
				headers: {
					"Access-Control-Allow-Origin": "*"
				},
				body: JSON.stringify(data),
			};

			callback(null, response);
		}
		/*
		data = {
		 AssumedRoleUser: {
		  Arn: "arn:aws:sts::123456789012:assumed-role/demo/Bob", 
		  AssumedRoleId: "ARO123EXAMPLE123:Bob"
		 }, 
		 Credentials: {
		  AccessKeyId: "AKIAIOSFODNN7EXAMPLE", 
		  Expiration: <Date Representation>, 
		  SecretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY", 
		  SessionToken: "AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA=="
		 }, 
		 PackedPolicySize: 6
		}
		*/
	});



	// Use this code if you don't use the http event with the LAMBDA-PROXY integration
	// callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};


module.exports.oidc_authoriser = (event, context, callback) => {
	// convert from REQUEST type to TOKEN type for validation
	let TOKEN_PARAMS = event;
	
	if (event.type !== 'TOKEN') {
		TOKEN_PARAMS = {
			type: 'TOKEN',
			authorizationToken: event.headers.Authorization,
			methodArn: event.methodArn
		}
	}

	lib.authenticate(TOKEN_PARAMS, function (err, data) {
		// the token is valid, now check that the scope matches the request role
		if (err) {
			if (!err) context.fail("Unhandled error");
			context.fail("Unauthorized");

		}
		else {
			let expectedScope = `assume:${event.pathParameters.role}`;
			console.log(JSON.stringify(data));
			let tokenScopes = (data.context.scope || "").split(" ");
			if (tokenScopes.indexOf(expectedScope) !== -1) {
				context.succeed(data);
			} else {
				context.fail("Unauthorized: token requires scope of "+expectedScope);
			}
		}

	});
};
