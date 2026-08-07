/**
 * Constructs a new `Headers` object by appending the Set-Cookie headers from an array of responses.
 *
 * @param responses `Response` objects from which to collect cookies; could be given as a non-array.
 * @returns A new `Headers` object containing the combined Set-Cookie headers.
 */
export default function forwardCookies(
  ...responses: (Response | null | undefined)[]
) {
  const headers = new Headers();

  for (const response of responses) {
    if (!response) continue;

    const setCookies = response.headers.getSetCookie();
    for (const cookie of setCookies) {
      headers.append("Set-Cookie", cookie);
    }
  }

  return headers;
}
