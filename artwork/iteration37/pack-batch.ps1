$ErrorActionPreference='Stop'
$taskRoot=$PSScriptRoot
$manifest=Get-Content -LiteralPath (Join-Path $taskRoot 'art-manifest.json') -Raw | ConvertFrom-Json
$dest=Join-Path $taskRoot 'masters'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
$electron=[IO.Path]::GetFullPath((Join-Path $taskRoot '../../node_modules/electron/dist/electron.exe'))
foreach($asset in $manifest.assets.PSObject.Properties){
 if($asset.Name -match '-study\d*$'){continue}
 $output=Join-Path $dest ($asset.Name+'.png')
 if((Test-Path -LiteralPath ($output+'.json')) -and ((Get-Content -LiteralPath ($output+'.json') -Raw | ConvertFrom-Json).source -eq $asset.Value)){continue}
 $cols=if($asset.Name.EndsWith('-walk')){'4'}else{'8'}
 $rows='4'
 if($asset.Name -eq 'white-wolf-main'){$cols='9'}
 if($asset.Name -eq 'backpack'){$cols='4';$rows='1'}
 if($asset.Name -eq 'cart'){$cols='2'}
 $sourceFile=if([IO.Path]::IsPathRooted($asset.Value)){$asset.Value}else{Join-Path $taskRoot $asset.Value}
 $args=@((Join-Path $taskRoot 'pack-master.cjs'),$sourceFile,$output,$cols,$rows)
 $proc=Start-Process -FilePath $electron -ArgumentList $args -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $taskRoot 'packer.log') -RedirectStandardError (Join-Path $taskRoot 'packer.err')
 if($proc.ExitCode -ne 0 -or !(Test-Path -LiteralPath $output)){throw ('Packing failed: '+$asset.Name+' '+(Get-Content (Join-Path $taskRoot 'packer.err') -Raw))}
 Get-Content (Join-Path $taskRoot 'packer.log')
}
