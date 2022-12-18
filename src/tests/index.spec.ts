import 'mocha';
import { expect } from 'chai';
import { httpErrorHandler } from '../index';
import { httpGatewayEvent } from './data/http-gateway-event';
import { APIGatewayProxyResult, APIGatewayEvent, Context } from 'aws-lambda';
import { Employee } from './employee.entity';

const wrongTrack = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const employee = new Employee('John', 30, 1000);
  const employeeInfo = await employee.getNonExistentEmployee();

  return {
    statusCode: 200,
    body: JSON.stringify(employeeInfo),
  };
};

const rightTrack = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const employee = new Employee('Emily', 3, 1000);
  const employeeInfo = await employee.getEmployee();

  return {
    statusCode: 200,
    body: JSON.stringify(employeeInfo),
  };
};

const customLogger = (message: string) => {
  console.log('---------Error starts-------------');
  console.log(message);
  console.log('---------Error end-------------');
};

describe('Lambda error handler', () => {
  it('Error handler testing', async () => {
    const trackHandler = httpErrorHandler(customLogger)(wrongTrack);

    const response = await trackHandler(httpGatewayEvent, {} as Context);
    expect(response.statusCode).to.equal(404);
  });

  it('Correct handler testing', async () => {
    const trackHandler = httpErrorHandler()(rightTrack);

    const response = await trackHandler(httpGatewayEvent, {} as Context);
    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response.body)).to.have.property('name');
  });
});
