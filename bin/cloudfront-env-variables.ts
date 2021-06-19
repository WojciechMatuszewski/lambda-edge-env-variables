#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CloudfrontEnvVariablesStack } from "../lib/cloudfront-env-variables-stack";

const app = new cdk.App();
new CloudfrontEnvVariablesStack(app, "CloudfrontEnvVariablesStack", {
  env: {
    region: "us-east-1"
  }
});
