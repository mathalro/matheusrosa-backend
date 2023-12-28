import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const tableName = "articles";

const logger = new Logger();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult = {
        statusCode: 200,
        body: ""
    }; 

    logger.info(`Received a new request: ${event.path}`);
    let module = "articles";

    try {
        switch (module) {
            case "articles":
                return articlesHandler(event); 
            default:
                response.statusCode = 404;
                response.body = "Invalid Path";
        }
    } catch (err) {
        logger.error(`Error processing request ${event.path}: ${err}`, err); 
        response.statusCode = 500;
        response.body = "Unexpected Error";
    }

    return response;
};

const articlesHandler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult = {
        statusCode: 200,
        body: ""
    };

    let method = event.httpMethod.toLowerCase();

    logger.info(`Handling ${method} articles`);

    switch (method) {
        case "get": {
            let body = await ddb.send(new ScanCommand( {
                TableName: tableName
            }));

            response.statusCode = 200;

            let normalJson = body.Items.map(i => unmarshall(i));
            response.body = JSON.stringify(normalJson);
            
            break;
        };
        case "post": {
            let newItem = JSON.parse(event.body);
            let item = marshall(newItem);

            let command = new PutItemCommand( {
                TableName: tableName,
                Item: item
            });

            await ddb.send(command)

            break;
        }
    }

    return response;
}
