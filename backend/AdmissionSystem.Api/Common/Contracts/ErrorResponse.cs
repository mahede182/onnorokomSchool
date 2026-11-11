namespace AdmissionSystem.Api.Common.Contracts;

public record ErrorResponse(string Error, string? Message = null);
