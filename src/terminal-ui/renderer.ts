import format from "./format.js";
import { Output } from "../types.js";

export default function renderer(outputs: Output[]) {
  for (const element of outputs) {
    if (element.type === "text") {
      render[element.type](element.value);
    } else {
      render[element.type](element.values);
    }
  }
}

const render = {
  text(message: string) {
    console.log(message);
  },
  numberedList(items: string[]) {
    console.log(format.numberedList(items, 2));
  },
  indentedList(items: string[]) {
    console.log(format.indentedList(items, 2));
  },
  table() {},
};
