import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const tableName = "articles";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    let module = event.path.split("/").at(0);

    try {
        switch (module) {
            case "articles":
                return articlesHandler(event); 
            default:
                response.statusCode = 404;
                response.body = "Invalid Path";
        }
    } catch (err) {
        response.statusCode = 500;
        response.body = "Unexpected Error";
    }

    return response;
};

const articlesHandler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    let method = event.httpMethod.toLowerCase();

    switch (method) {
        case "get": {
            let body = await ddb.send(new ScanCommand( {
                TableName: tableName
            }));

            response.statusCode = 200;
            response.body = body.Items.toString();
            
            return response;
        }
    }
}