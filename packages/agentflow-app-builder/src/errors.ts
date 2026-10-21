export class CliError extends Error {
  constructor(
    public code: string,
    message: string,
    public files?: string[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class SealError extends CliError {}
