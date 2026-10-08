export const splitString = (text: string): string[] =>
  text.split(/\n|<br\s*\/?>/).map((line) => `<span>${line}</span>`);
