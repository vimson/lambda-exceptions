# An easy way to handle and log Lambda exceptions

An npm package for catching all the exceptions thrown by the code base, log and send error response to the client

For a Lambda function that uses extenral services like DynamoDB, ElasticCache, MySQL it is common practice that we try/catch all the places where we anticipate the service may fail at one time. Instead of this we have created a wrapper for the hander so that, if any error triggers it will catch that and send proper response to the client.

Also we can specify the logger in the configuration of this exception handler function so that we can decide where we can save the error logs.

Here we are using `aws-lambda` as a dependency package.

This package has one wrapper function `httpErrorHandler` for exception handling and class `GenericError` which is extending Error class added for throwing custom errors in case.

An example code implementation is below.

```typescript
import { httpErrorHandler } from 'lambda-exceptions';
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
```

In the above code you can see, I define customLogger using console.log and passed to the exception wrapper as logger. Else it will take default console.log

```typescript
const trackHandler = httpErrorHandler(customLogger)(wrongTrack);
```

`GenericError` implementation example is

```typescript
import { GenericError } from 'lambda-exceptions';

class Employee {
  private id!: string;
  private name: string;
  private age: number;
  private salary: number;

  constructor(name: string, age: number, salary: number) {
    this.name = name;
    this.age = age;
    this.salary = salary;
  }

  async getEmployee(): Promise<Employee> {
    const found = false;
    if (!found) {
      throw new GenericError('Employee not found', 404);
    }
  }
}
```

errorStack will get logged into the logger based on the configuration your passed through.
