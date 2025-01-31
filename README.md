# Key Chord

Map pairs of simultaneously pressed keys to commands for VSCode.

## Original

> This package implements support for mapping a pair of simultaneously pressed keys to a command and for mapping the same key being pressed twice in quick succession to a command. Such bindings are called "key chords".

- [key-chord.el](https://github.com/emacsorphanage/key-chord): Map pairs of simultaneously pressed keys to commands

## Quick start

```json
{
  "key-chord.definitions": {
    "hj": "undo",

[...]

}
```

> [!NOTE]
> This extension uses `registerCommand('type', ...)`.
> This commandID `'type'` has the issue that it cannot be used in multiple extensions.
> ref: https://github.com/microsoft/vscode/issues/13441
