using System.Text.RegularExpressions;

namespace AdmissionSystem.Api.Common.Validation;

/*
Purpose:
Validate the X-Student-Id header used on student-facing endpoints.

Response:
IsValid → true when value is exactly 17 digits (after trim).
Normalize → trimmed value when valid; otherwise null.

Business Rules:
Student ID must match ^\d{17}$

Flow:
1. Reject null/whitespace
2. Trim and regex-match

Side Effects:
None

Failure Cases:
Invalid input returns false / null for callers to map to 400
*/
public static class StudentIdValidator
{
    private static readonly Regex Pattern = new(@"^\d{17}$", RegexOptions.Compiled);

    public static bool IsValid(string? studentId) =>
        !string.IsNullOrWhiteSpace(studentId) && Pattern.IsMatch(studentId.Trim());

    public static string? Normalize(string? studentId) =>
        IsValid(studentId) ? studentId!.Trim() : null;
}
