import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return { statusCode: 200, body: 'Hello World!' };
};