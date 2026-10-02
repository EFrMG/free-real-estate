import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELISM = 5;
const KEY_LENGTH = 32;

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  return left.byteLength === right.byteLength && timingSafeEqual(left, right);
}

function scrypt(
  password: string,
  salt: Uint8Array,
  keyLength: number,
  cost: number,
  blockSize: number,
  parallelism: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      keyLength,
      { N: cost, r: blockSize, p: parallelism },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(new Uint8Array(derivedKey));
      },
    );
  });
}

/** Hash new passwords with the Workers-native scrypt implementation. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await scrypt(
    password,
    salt,
    KEY_LENGTH,
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELISM,
  );

  return [
    "scrypt",
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELISM,
    toBase64(salt),
    toBase64(derivedKey),
  ].join("$");
}

export async function verifyPassword(encoded: string, password: string) {
  const [algorithm, cost, blockSize, parallelism, salt, expected] =
    encoded.split("$");

  if (
    algorithm !== "scrypt" ||
    !cost ||
    !blockSize ||
    !parallelism ||
    !salt ||
    !expected
  ) {
    return false;
  }

  const expectedBytes = fromBase64(expected);
  const actual = await scrypt(
    password,
    fromBase64(salt),
    expectedBytes.byteLength,
    Number(cost),
    Number(blockSize),
    Number(parallelism),
  );

  return constantTimeEqual(actual, expectedBytes);
}
