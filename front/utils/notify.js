import { Notify } from "quasar";

export const notifyErrorRequest = (msg, position = "top") => {
  Notify.create({
    color: "negative",
    message: msg,
    icon: "error",
    position: position,
    timeout: 4500,
  });
};

export const notifySuccessRequest = (msg, position = "top") => {
  Notify.create({
    color: "positive",
    message: msg,
    icon: "check",
    position: position,
    timeout: 3500,
  });
};

export const notifyWarningRequest = (msg, position = "top") => {
  Notify.create({
    color: "warning",
    message: msg,
    icon: "warning",
    textColor: "black",
    position: position,
    timeout: 18000,
  });
};

export const notifyInfoRequest = (msg, position = "top") => {
  Notify.create({
    color: "info",
    message: msg,
    icon: "info",
    position: position,
    timeout: 3500,
  });
};

// Composable para usar fácilmente en los componentes
export const useNotify = () => {
  return {
    success: (msg, position = "top") => notifySuccessRequest(msg, position),
    error: (msg, position = "top") => notifyErrorRequest(msg, position),
    warning: (msg, position = "top") => notifyWarningRequest(msg, position),
    info: (msg, position = "top") => notifyInfoRequest(msg, position),
  };
};
