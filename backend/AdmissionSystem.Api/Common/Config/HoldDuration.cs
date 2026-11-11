namespace AdmissionSystem.Api.Common.Config;

/*
Purpose:
Single source of truth for hold lifetime from HOLD_DURATION_SECONDS (.env / config).

Response:
Positive integer seconds (default 600).

Business Rules:
- Env var wins over configuration
- Invalid or missing values fall back to 600

Flow:
1. Read HOLD_DURATION_SECONDS
2. Parse as positive int
3. Return value or default

Side Effects:
None

Failure Cases:
None — always returns a safe default
*/
public static class HoldDuration
{
    public const int DefaultSeconds = 600;

    public static int Resolve(IConfiguration configuration)
    {
        var raw = Environment.GetEnvironmentVariable("HOLD_DURATION_SECONDS")
                  ?? configuration["HOLD_DURATION_SECONDS"]
                  ?? DefaultSeconds.ToString();
        return int.TryParse(raw, out var seconds) && seconds > 0
            ? seconds
            : DefaultSeconds;
    }
}
