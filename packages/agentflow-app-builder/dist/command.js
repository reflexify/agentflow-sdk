export class UsageError extends Error {
}
export function usage(message) {
    throw new UsageError(message);
}
export const stringFlag = (values, name) => {
    const value = values[name];
    return typeof value === "string" ? value : undefined;
};
// Every value of a flag a command takes more than once, in the order given.
export const stringFlags = (values, name) => {
    const value = values[name];
    return Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
};
export const hideSecret = (io, secret) => {
    if (secret)
        io.secrets?.add(secret);
};
export const envOf = (io) => io.env ?? process.env;
//# sourceMappingURL=command.js.map