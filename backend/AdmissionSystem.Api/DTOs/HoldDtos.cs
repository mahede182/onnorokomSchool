namespace AdmissionSystem.Api.DTOs;

public record HoldResponse(
    string HoldId,
    string ClassId,
    string StudentId,
    string Status,
    string ExpiresAt
);

public record HoldStatusResponse(
    string HoldId,
    string ClassId,
    string Status,
    string ExpiresAt
);

public record HoldConfirmResponse(
    string HoldId,
    string Status
);

public record StudentHoldItemResponse(
    string HoldId,
    string ClassId,
    string ClassName,
    string Status,
    string ExpiresAt
);

public record ErrorResponse(
    string Error,
    string? Message = null
);

