import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const logger = new Logger();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult = {
        statusCode: 200,
        body: ""
    }; 

    logger.info(`Received a new request: ${event.path}`);
    let module = event.path.split("/")[1];

    try {
        switch (module) {
            case "articles":
                return articlesHandler(event); 
            case "users":
                return usersHandler(event);
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

const articlesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult = defaultResponse;
    let method = event.httpMethod.toLowerCase();
    const tableName = "articles";

    logger.info(`Handling ${method} articles`);

    switch (method) {
        case "get": {
            await getDataFromTable(tableName, response);
            break;
        };
        case "post": {
            await putDataInTable(event, tableName);
            break;
        }
    }

    return response;
}

const usersHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult = defaultResponse;
    let method = event.httpMethod.toLowerCase();
    const tableName = "users";

    logger.info(`Handing ${method} users`);

    switch (method) {
        case "get": {
            getDataFromTable(tableName, response);
            break;
        };
        case "post": {
            await putDataInTable(event, tableName);
            break;
        }
    }

    return response;
}

const defaultResponse = {
    statusCode: 200,
    body: ""
};

async function putDataInTable(event: APIGatewayProxyEvent, tableName: string) {
    let newItem = JSON.parse(event.body);
    let item = marshall(newItem);

    let command = new PutItemCommand({
        TableName: tableName,
        Item: item
    });

    await ddb.send(command);
}

async function getDataFromTable(tableName: string, response: APIGatewayProxyResult) {
    let body = await ddb.send(new ScanCommand({
        TableName: tableName
    }));

    response.statusCode = 200;

    let normalJson = body.Items.map(i => unmarshall(i));
    response.body = JSON.stringify(normalJson);
}
