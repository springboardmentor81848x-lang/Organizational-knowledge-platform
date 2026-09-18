Get-Content .env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
    $tokens = $_.Split('=', 2)
    [System.Environment]::SetEnvironmentVariable($tokens[0].Trim(), $tokens[1].Trim(), "Process")
}
mvn spring-boot:run
