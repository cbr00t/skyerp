[Exposed=(Window,Worker)]
interface AbortSignal : EventTarget {
  [WebIDL2JSCallWithGlobal, NewObject] static AbortSignal abort(optional any reason);
  [WebIDL2JSCallWithGlobal, NewObject] static AbortSignal timeout([EnforceRange] unsigned long long milliseconds);
  [WebIDL2JSCallWithGlobal, NewObject] static AbortSignal _any(sequence<AbortSignal> signals);

  readonly attribute boolean aborted;
  readonly attribute any reason;
  undefined throwIfAborted();

  attribute EventHandler onabort;
};
