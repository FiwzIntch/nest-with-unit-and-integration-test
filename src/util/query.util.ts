export function buildInclude(joins?: string[]):
  | {
      [key: string]: boolean;
    }
  | undefined {
  if (!joins) return undefined;
  const include = joins.map((join) => ({ [join]: true }));
  return Object.assign({}, ...include);
}
