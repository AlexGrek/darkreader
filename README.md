# darkreader

Simple SPA server for hosting text stories (in .txt files) and managing access using random passwords (no login). 

## Development

Run:

`go run ./src`

If you want to use `secret` as your text directory, and you are on PowerShell like me:

`$env:TEXT_PATH = 'secret'; go run ./src`

Build binary:

`go build ./src`

## Use FAKE to build release

1. Install dotnet 6 SDK (**not the latest**)
2. Install fake: `dotnet tool install fake-cli -g`
3. Run fake: `fake run .\fakefile.fsx`

