{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  name = "projects.fast";
  buildInputs = with pkgs; [
    deno
  ];
}
