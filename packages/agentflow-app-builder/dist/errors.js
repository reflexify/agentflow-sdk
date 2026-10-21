export class CliError extends Error {
    code;
    files;
    constructor(code, message, files) {
        super(message);
        this.code = code;
        this.files = files;
        this.name = new.target.name;
    }
}
export class SealError extends CliError {
}
//# sourceMappingURL=errors.js.map