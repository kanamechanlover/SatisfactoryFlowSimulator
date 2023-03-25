# public フォルダ下の画像ファイルへの相対パスを出力
$dirPath = Convert-Path .
$targetPath = "$dirPath\public"
$outputPath = "./src/defines/config/assets.json"
$data = New-Object 'System.Collections.Generic.List[string]'
$files = Get-ChildItem -path "$targetPath" -file -recurse -include @("*.png", "*.svg")
foreach ($file in $files) {
    $value = $file.FullName
    $value = $value.Replace("$targetPath", "")
    $value = $value.Replace("\", "/")
    $data.Add(".$value")
}
$data | ConvertTo-Json | Out-File $outputPath -Encoding utf8