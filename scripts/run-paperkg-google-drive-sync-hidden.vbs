Option Explicit

Dim fileSystem, shell, scriptDirectory, syncScript, command, exitCode
Set fileSystem = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
syncScript = fileSystem.BuildPath(scriptDirectory, "sync-paperkg-to-google-drive.ps1")

' Window style 0 prevents the PowerShell console from ever becoming visible.
' //B on wscript.exe also prevents WSH dialogs if the launcher itself fails.
command = "powershell.exe -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & syncScript & """"
exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode
