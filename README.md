# CloudFront Lambda@Edge env variables

The goal of this repo is to get myself familiar with how to handle environment variables of Lambda@Edge functions.

Based on this great post: https://dev.to/aws-builders/dynamically-configure-your-lambda-edge-functions-2pkp?utm_source=newsletter&utm_medium=email&utm_content=offbynone&utm_campaign=Off-by-none%3A%20Issue%20%23145

## Learnings

- You can make cloudfront inject custom headers to the request. these headers are not visible to the person making the request.
  Please note that **this can only be done for `origin-request` events** as it's the cloudfront who is injecting the headers.
  Remember that the key under which given header lives is always transformed to all lower case.

- For the `viewer-xx` events you either have to use SSM, include a file with variables during the deployment or hardcode them. I'm not really sure if the proposed method of reading from IAM is the way to go.

- Different events are passed to the handler based on the event upon the lambda@edge is invoked.

- You have the ability to either amend the original request and let it move forward (`viewer-request` or `origin-request`) or you can amend the response (`viewer-response` or `origin-response`).

- Here is a doc link that describes shapes of the events: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html.

- It seems like the `www` within the `Origin Domain Name` is causing weird behavior. Instead of aliasing the origin with the CloudFront domain name, I was being redirected to the origin. That seem to happen only if the `Origin Domain Name` contains the `www`.
  Please consult the [`Origin Domain Name` documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesDomainName)

## Deployment

- Bootstrap

  ```sh
  npm run cdk bootstrap
  ```

- Build the lambda

  ```sh
  npm run lambda
  ```

- Deploy

  ```sh
  npm run cdk deploy
  ```
