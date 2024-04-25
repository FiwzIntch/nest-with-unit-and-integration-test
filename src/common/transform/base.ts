import { TransformFnParams } from 'class-transformer';
import { isArray } from 'lodash';

export const transformIntOptional = (
  param: TransformFnParams,
): number | undefined => {
  if (isArray(param.value)) {
    return undefined;
  }
  const value = parseInt(param.value);
  if (isNaN(value)) {
    return undefined;
  }
  return value;
};
