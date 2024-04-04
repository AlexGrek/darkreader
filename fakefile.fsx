#r "paket:
nuget Fake.Core.Target //"
#load "./.fake/fakefile.fsx/intellisense.fsx"

open Fake.Core
open Fake.IO
open Fake.Core.TargetOperators

let build_dir = "build"
let front_dir = "frontend"

let front_dist = front_dir + "/dist"
let build_static = build_dir + "/static"

Target.create "Clean" (fun p ->
    Trace.trace " --- Cleaning stuff --- "
    Shell.rm_rf build_dir
)

// Default target
Target.create "BuildFront" (fun _ ->
  let result = CreateProcess.fromRawCommandLine @"C:\Users\AlexG\AppData\Roaming\npm\npm.cmd" "run build"
              |> CreateProcess.withWorkingDirectory "./frontend"
              |> Proc.run
  if result.ExitCode <> 0 then
    failwith("error")
)

Target.create "PackageFront" (fun _ ->
  Shell.mkdir build_dir
  Shell.cp_r front_dist build_static
)

Target.create "BuildBack" (fun _ ->
  let result = CreateProcess.fromRawCommandLine @"go" "build -o build/server.exe ./src"
              |> CreateProcess.withWorkingDirectory "."
              |> Proc.run
  if result.ExitCode <> 0 then
    failwith("error")
  Environment.setEnvironVar "GOARCH" "amd64"
  Environment.setEnvironVar "GOOS" "linux"
  let result = CreateProcess.fromRawCommandLine @"go" "build -o build/server ./src"
              |> CreateProcess.withWorkingDirectory "."
              |> Proc.run
  if result.ExitCode <> 0 then
    failwith("error")
)

"Clean"
    ==> "BuildFront"
    ==> "PackageFront"
    ==> "BuildBack"

// start build
Target.runOrDefault "BuildBack"
