export class UsageError extends Error {
}
export function usage(message) {
    throw new UsageError(message);
}
export const stringFlag = (values, name) => {
    const value = values[name];
    return typeof value === "string" ? value : undefined;
};
export const hideSecret = (io, secret) => {
    if (secret)
        io.secrets?.add(secret);
};
export const envOf = (io) => io.env ?? process.env;
//# sourceMappingURL=command.js.map