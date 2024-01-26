import { isDate } from "util/types";
import { isDefined, isInteger } from "../controllers/util";
import { ErrorMessages } from "./errorMessages";
import { APIResponse } from "./handlerWrapper";

//
// string
//

export function requiredStringArgument(
  container: object,
  argument: string
): string {
  const arg = container[argument];
  if (!isDefined(arg))
    throw APIResponse.badArgs(ErrorMessages.missingArgument(argument));
  return arg;
}

export function optionalStringArgument(
  container: object,
  argument: string,
  ifMissing?: string
): string | undefined {
  return container[argument] || ifMissing;
}

export function requiredDateArgument(
  container: object,
  argument: string
): Date | undefined {
  const arg = container[argument];
  if (!isDefined(arg))
    throw APIResponse.badArgs(ErrorMessages.missingArgument(argument));;

  const d = new Date(arg);

  if (!isDate(d)) {
    throw APIResponse.badArgs(
      ErrorMessages.argumentMustBeDate(argument, arg)
    )
  }

  return d;
}

export function optionalDateArgument(
  container: object,
  argument: string,
  ifMissing?: Date
): Date | undefined {
  const arg = container[argument];
  if (!isDefined(arg)) return ifMissing;

  const d = new Date(arg);

  if (!isDate(d)) {
    throw APIResponse.badArgs(
      ErrorMessages.argumentMustBeDate(argument, arg)
    )
  }

  return d;
}

//
// number
//

export function requiredIntegerArgument(
  container: object,
  argument: string
): number {
  const arg = container[argument];
  if (!isDefined(arg))
    throw APIResponse.badArgs(ErrorMessages.missingArgument(argument));

  const n = Number(arg);
  if (Number.isNaN(n) || !isInteger(n))
    throw APIResponse.badArgs(
      ErrorMessages.argumentMustBeInteger(argument, arg)
    );

  return n;
}

export function optionalIntegerArgument(
  container: object,
  argument: string,
  ifMissing?: number
): number | undefined {
  const arg = container[argument];
  if (!isDefined(arg)) return ifMissing;

  const n = Number(arg);
  if (isNaN(n) || !isInteger(n))
    throw APIResponse.badArgs(
      ErrorMessages.optionalArgumentMustBeInteger(argument, arg)
    );

  return n;
}

export function requiredDecimalArgument(
  container: object,
  argument: string
): number {
  const arg = container[argument];
  if (!isDefined(arg))
    throw APIResponse.badArgs(ErrorMessages.missingArgument(argument));

  const n = Number(arg);
  if (Number.isNaN(n))
    throw APIResponse.badArgs(
      ErrorMessages.argumentMustBeDecimal(argument, arg)
    );

  return n;
}

export function optionalDecimalArgument(
  container: object,
  argument: string,
  ifMissing?: number
): number | undefined {
  const arg = container[argument];
  if (!isDefined(arg)) return ifMissing;

  const n = Number(arg);
  if (isNaN(n))
    throw APIResponse.badArgs(
      ErrorMessages.optionalArgumentMustBeDecimal(argument, arg)
    );

  return n;
}

//
// boolean
//

export function optionalBooleanArgument(
  container: object,
  argument: string,
  ifMissing?: boolean
): boolean | undefined {
  let arg = container[argument];

  if (!isDefined(arg)) return ifMissing;

  if (typeof arg === "boolean") return arg;
  if (typeof arg !== "string")
    throw APIResponse.badArgs(
      ErrorMessages.optionalArgumentMustBeSingular(argument)
    );

  arg = arg.toLowerCase();

  if (["true", "t", "yes", "y"].includes(arg)) return true;
  if (["false", "f", "no", "n"].includes(arg)) return false;
  throw APIResponse.badArgs(
    ErrorMessages.optionalArgumentMustBeBoolean(argument, arg)
  );
}

//
// string[]
//

export function optionalStringArrayArgument(
  container: object,
  argument: string
): string[] | undefined {
  const a = container[argument];

  if (!Array.isArray(a)) {
    if (!isDefined(a)) return;

    return new Array(a);
  }

  return a;
}
