# auth0-aws
An API based solution to the soon-to-be-deprecated aws delegation endpoint in Auth0

## Getting Started
This is a serverless application that constructs and deploys an API gateway endpoint and lambda function using cloudformation.
It includes 1 simple role example that grants list permission to s3 buckets. Any role which that you wish to assume this way must include policy with sts:AssumeRole action for lambda service

```
> npm install -g serverless
> npm install
```
Modify the ```dev.settings.yml``` file to match your environment/configuration.

To deploy the endpoint
Assuming you have AWS CLI and credentials
```
> sls deploy
```

Create an API in Auth0 and add a scope with the format "assume:<role_name>"
Once deployed, hit the API endpoint with an API access token acquired from Auth0 with the given scope and you will receive a response containing the sts result
e.g.
```javascript
{
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
```

## ToDo
* This currently just demonstrates assuming a single role. It needs to be able to assume any role that the user has a scope for
* Would be nice to externalise the role definition(s) so this can be consumed without changing project files
* A bit more doco filling in the assumed knowledge.
* Testing
