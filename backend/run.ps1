# Load environment variables from .env
Get-Content .env | ForEach-Object {
    $line = $_.Trim()

    if ($line -and !$line.StartsWith("#")) {
        $parts = $line -split "=", 2

        if ($parts.Length -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()

            $value = $value.Trim('"').Trim("'")

            [Environment]::SetEnvironmentVariable(
                $name,
                $value,
                "Process"
            )
        }
    }
}

# Start Spring Boot
.\mvnw.cmd spring-boot:run