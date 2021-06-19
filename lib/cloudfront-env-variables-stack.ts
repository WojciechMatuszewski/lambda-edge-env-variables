import * as cdk from "@aws-cdk/core";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import { join } from "path";

export class CloudfrontEnvVariablesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logBucket = new s3.Bucket(this, "logBucket");

    const table = new ddb.Table(this, "table", {
      partitionKey: { name: "pk", type: ddb.AttributeType.STRING }
    });

    const edgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "edge",
      {
        code: lambda.Code.fromAsset(join(__dirname, "./edge-function")),
        handler: "handler.handler",
        runtime: lambda.Runtime.NODEJS_14_X
      }
    );
    table.grantReadData(edgeFunction.currentVersion);

    const distribution = new cloudfront.Distribution(this, "distribution", {
      defaultBehavior: {
        origin: new origins.HttpOrigin("webhook.site", {
          customHeaders: {
            tableName: table.tableName
          },
          originPath: "/"
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        // Disabled caching to make the 5xx or 4xx responses are not cached. 😢
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        // cachePolicy: new cloudfront.CachePolicy(this, "cachepolicy", {
        //   maxTtl: cdk.Duration.seconds(1),
        //   minTtl: cdk.Duration.seconds(1),
        //   defaultTtl: cdk.Duration.seconds(1),
        //   queryStringBehavior: cloudfront.CacheQueryStringBehavior.all()
        // }),
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: edgeFunction.currentVersion,
            includeBody: true
          }
        ]
      },
      logBucket: logBucket,
      logIncludesCookies: true,
      enableLogging: true
    });

    new cdk.CfnOutput(this, "url", {
      value: distribution.distributionDomainName
    });
  }
}
