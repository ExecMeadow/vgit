import format from "./format.js";
import { Output } from "../types.js";

export default function render(outputs: Output[]) {
  for (const element of outputs) {
    if (element.type === "text") {
      print[element.type](element.value);
    } else {
      print[element.type](element.values);
    }
  }
}

const print = {
  text(message: string) {
    console.log(message);
  },
  numberedList(items: string[]) {
    console.log(format.numberedList(items, 1));
  },
  indentedList(items: string[]) {
    console.log(format.indentedList(items, 1));
  },
  table() {},
};
