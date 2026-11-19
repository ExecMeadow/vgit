import format from "./format.js";
import { CommandOutput } from "../types.js";

export default function render(outputs: CommandOutput[]) {
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
    console.log(format.numberedList(items, 2));
  },
  indentedList(items: string[]) {
    console.log(format.indentedList(items, 2));
  },
  table() {},
};
