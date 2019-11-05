import { expect } from 'chai';
import { Given, Then, When } from 'cucumber';

Given('a variable set to {int}', function (number) {
  expect(true).equals(true);
});

Then('the variable should contain {int}', function (number) {
  expect(true).equals(true);
});

When('I increment the variable by {int}', function (number) {
  expect(true).equals(true);
});
