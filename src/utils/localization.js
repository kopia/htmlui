import i18n from "./i18n";

export function localizedLabel(value) {
  return typeof value === "string" ? i18n.t(`labels:${value}`, { defaultValue: value }) : value;
}

export function localizedProps(props = {}) {
  const result = { ...props };
  for (const name of ["placeholder", "title", "aria-label"]) {
    if (typeof result[name] === "string") result[name] = localizedLabel(result[name]);
  }
  return result;
}
