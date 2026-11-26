import {
  Error,
  IOValidation,
  TerminalUIMap,
  TerminalOutput,
} from "../types.js";

import { utils } from "../validation.js";
const {
  isObject,
  hasKeys,
  hasExactKeys,
  isString,
  isArray,
  isArrayOfStrings,
  //isArrayOfObjects,
  isFunction,
} = utils;

// UI Validation
export const ui = {
  isValidTerminalOutputType,
  isValidTerminalOutput,
  isTerminalOutputArray,
};
function isValidTerminalOutputType(type: unknown): type is string {
  const allowedTypes = ["text", "heading", "list", "label-value"];
  if (!isString(type)) {
    return false;
  }
  if (!allowedTypes.includes(type)) {
    return false;
  }
  return true;
}
function isValidTerminalOutput(
  terminalOutput: unknown,
): terminalOutput is TerminalOutput {
  if (!isObject(terminalOutput)) {
    return false;
  }
  if (!isValidTerminalOutputType(terminalOutput.type)) {
    return false;
  }
  if (terminalOutput.type === "text") {
    if (!hasKeys(terminalOutput, ["type", "value"])) {
      return false;
    }
    if ("style" in terminalOutput && !isString(terminalOutput.style)) {
      return false;
    }
    if (!isString(terminalOutput.value)) {
      return false;
    }
  } else if (terminalOutput.type === "heading") {
    if (!hasExactKeys(terminalOutput, ["type", "value"])) {
      return false;
    }
    if (!isString(terminalOutput.value)) {
      return false;
    }
  } else if (terminalOutput.type === "list") {
    if (!hasExactKeys(terminalOutput, ["type", "style", "values"])) {
      return false;
    }
    if (!isArray(terminalOutput.values)) {
      return false;
    }
    if (!isArrayOfStrings(terminalOutput.values)) {
      return false;
    }
  } else if (terminalOutput.type === "label-value") {
    if (!hasExactKeys(terminalOutput, ["type", "label", "value"])) {
      return false;
    }
    if (!isString(terminalOutput.label)) {
      return false;
    }
    if (!isString(terminalOutput.value)) {
      return false;
    }
  }

  return true;
}
function isTerminalOutputArray(
  terminalOutputs: unknown[],
): terminalOutputs is TerminalOutput[] {
  return terminalOutputs.every((output) => isValidTerminalOutput(output));
}
function isValidCoverage(
  inputOutputContracts: IOValidation,
  uiMap: Record<string, unknown>,
) {
  const commandIdList = Object.keys(inputOutputContracts);
  if (!hasExactKeys(uiMap, commandIdList)) {
    return false;
  }
  for (const commandId of commandIdList) {
    if (!isObject(uiMap[commandId])) {
      return false;
    }
    if (!hasExactKeys(uiMap[commandId], ["present"])) {
      return false;
    }
    if (!isFunction(uiMap[commandId].present)) {
      return false;
    }
  }
  return true;
}
function isTerminalUIMap(
  uiMap: unknown,
  IOContracts: IOValidation,
): uiMap is TerminalUIMap {
  if (!isObject(uiMap)) {
    return false;
  }
  if (!isValidCoverage(IOContracts, uiMap)) {
    return false;
  }
  return true;
}

export const verify = {
  areValidTerminalOutputs(outputs: unknown[]): { error?: Error } {
    if (!isTerminalOutputArray(outputs)) {
      return {
        error: {
          code: "INVALID_OUTPUT",
          message: `Output array is invalid. Received: ${outputs}`,
        },
      };
    }
    return {};
  },
  isValidTerminalUIMap(uiMap: unknown, ioContracts: IOValidation) {
    if (!isTerminalUIMap(uiMap, ioContracts)) {
      return {
        error: { code: "INVALID_MAP", message: "Invalid terminal ui map." },
      };
    }
    return {};
  },
};
