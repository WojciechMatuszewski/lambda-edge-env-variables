import {
  CloudFrontEvent,
  CloudFrontRequestEvent,
  CloudFrontRequestHandler
} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
/**
 * If you are using ACG, you can debug the function by issuing requests to a webhook.
 */
// import axios from "axios";

export const handler: CloudFrontRequestHandler = async event => {
  const [evt] = event.Records;
  const response = event.Records[0].cf.request;

  try {
    const ddb = new DocumentClient({
      region: "us-east-1"
    });

    const tableName =
      evt.cf.request.origin?.custom?.customHeaders["tablename"][0].value;

    const item = await ddb
      .get({ TableName: tableName as string, Key: { pk: "1" } })
      .promise();

    if (response.body) {
      response.body = {
        ...response.body,
        action: "replace",
        encoding: "text",
        data: JSON.stringify(item.Item ?? "")
      };
    }

    return response;
  } catch (e) {
    if (response.body) {
      response.body = {
        ...response.body,
        action: "replace",
        encoding: "text",
        data: e.message
      };
    }

    return response;
  }
};
