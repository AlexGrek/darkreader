# darkreader

Simple SPA server for hosting text stories (in .txt files) and managing access using random passwords (no login). 

## Development

Run:

`go run ./src`

If you want to use `secret` as your text directory, and you are on PowerShell like me:

`$env:TEXT_PATH = 'secret'; go run ./src`

Build binary:

`go build ./src`