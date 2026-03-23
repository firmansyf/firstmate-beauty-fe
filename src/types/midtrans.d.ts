interface SnapCallbacks {
  onSuccess?: (result: Record<string, string>) => void;
  onPending?: (result: Record<string, string>) => void;
  onError?: (result: Record<string, string>) => void;
  onClose?: () => void;
}

interface Window {
  snap: {
    pay: (token: string, callbacks?: SnapCallbacks) => void;
    hide: () => void;
  };
}
