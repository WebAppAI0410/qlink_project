'use client';

import * as React from "react";

// Inspired by react-hot-toast library
export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  duration?: number;
  [key: string]: any; // Allow any other props
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToastOptions = Partial<
  Pick<ToasterToast, "id" | "title" | "description" | "action" | "duration">
>;

type State = {
  toasts: ToasterToast[];
};

let memoryState: State = { toasts: [] };

const listeners: Array<(state: State) => void> = [];

function dispatch(action: any) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

const reducer = (state: State, action: any): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      } else {
        return {
          ...state,
          toasts: [],
        };
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }

  return state;
};

interface Toast extends Omit<ToasterToast, "id"> {}

function toast(props: ToastOptions | string) {
  const id = Math.random().toString(36).slice(2, 11); // Generate a random ID

  const options: ToasterToast = typeof props === 'string' ? { title: props, id } : { ...props, id };

  dispatch({ type: "ADD_TOAST", toast: options });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  return {
    id: id,
    dismiss,
    update: (props: ToasterToast) =>
      dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast }; 