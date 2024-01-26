export namespace ErrorMessages {
    export const SERVER_ERROR = "Server Error";
  
    export const INVALID_PASSWORD = "invalid password";
  
    export const ALREADY_LOGGED_OUT =
      "cannot sign out: you are already signed out";
  
    export const NOT_SIGNED_IN = "not signed in";

    export const DB_MISSING =
    "database was not added in middleware; would be at `Request.db`";
  
    export function missingArgument(argument: string) {
      return `missing argument "${argument}"`;
    }
  
    export function argumentMustBeInteger(argument: string, arg: any) {
      return `argument "${argument}" must be an integer, not: ${arg}`;
    }
  
    export function argumentMustBeDecimal(argument: string, arg: any) {
      return `argument "${argument}" must be a decimal, not: ${arg}`;
    }

    export function argumentMustBeDate(argument: string, arg: any) {
      return `argument "${argument}" must be a valid date time, not: ${arg}`;
    }
  
    export function optionalArgumentMustBeInteger(argument: string, arg: any) {
      return `if present, argument "${argument}" must be an integer, not: ${arg}`;
    }
  
    export function optionalArgumentMustBeDecimal(argument: string, arg: any) {
      return `if present, argument "${argument}" must be a decimal, not: ${arg}`;
    }
  
    export function optionalArgumentMustBeBoolean(argument: string, arg: any) {
      return `if present, argument "${argument}" must be a boolean, not: ${arg}`;
    }
  
    export function optionalArgumentMustBeSingular(argument: string) {
      return `if present, argument "${argument}" must have only one value`;
    }
  
    export const EXISTING_RESERVATION =
      "you already have a reservation for this time";

    export const TABLE_RESERVED =
      "this table is already reserved";
  }
  