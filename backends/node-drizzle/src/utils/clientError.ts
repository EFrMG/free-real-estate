/**
 * An error whose message is meant to be sent straight back to the client as a 400.
 *
 * Helpers that run before zod gets a chance to validate (file uploads, JSON decoding of multipart fields) throw this so the route handler can turn it into a response without having to tell a malformed request from a server error.
 */
export class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientError";
  }
}
