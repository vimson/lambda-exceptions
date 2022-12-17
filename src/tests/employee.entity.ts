import { GenericError } from '../lib/error-handler.lib';

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
    return Promise.resolve(Object.assign({}, this));
  }

  async getNonExistentEmployee(): Promise<Employee> {
    throw new GenericError('Employee not found', 404);
  }
}

export { Employee };
