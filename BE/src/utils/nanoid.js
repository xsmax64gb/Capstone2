import { customAlphabet } from "nanoid";

export const createCustomNanoid = (alphabet = "1234567890", length = 16) => {
  const generateId = customAlphabet(alphabet, length);
  return generateId();
};

export const nanoidNumbersOnly = () => createCustomNanoid("1234567890", 16);
export const nanoidAlphaNumeric = () =>
  createCustomNanoid("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 10);
export const nanoid = () => createCustomNanoid();

export default {
  createCustomNanoid,
  nanoidNumbersOnly,
  nanoidAlphaNumeric,
};