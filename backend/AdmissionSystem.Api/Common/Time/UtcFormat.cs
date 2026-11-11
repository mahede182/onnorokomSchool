namespace AdmissionSystem.Api.Common.Time;

public static class UtcFormat
{
    public static string ToIsoZ(DateTime utc) =>
        DateTime.SpecifyKind(utc, DateTimeKind.Utc).ToString("yyyy-MM-ddTHH:mm:ssZ");
}
