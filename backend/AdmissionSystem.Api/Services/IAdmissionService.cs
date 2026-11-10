using AdmissionSystem.Api.DTOs;

namespace AdmissionSystem.Api.Services;

public interface IAdmissionService
{
    Task<ClassResponse> CreateClassAsync(CreateClassRequest request);
    Task<List<ClassDetailResponse>> GetAllClassesAsync();
    Task<ClassDetailResponse?> GetClassByIdAsync(string classId);
    Task<(bool Success, HoldResponse? Hold, string? ErrorReason, int StatusCode)> CreateHoldAsync(string classId, string studentId);
    Task<(bool Success, HoldStatusResponse? Hold, string? ErrorReason, int StatusCode)> GetHoldByIdAsync(string holdId);
    Task<(bool Success, HoldConfirmResponse? Result, string? ErrorReason, int StatusCode)> ConfirmHoldAsync(string holdId, string studentId);
    Task<(bool Success, string? ErrorReason, int StatusCode)> CancelHoldAsync(string holdId, string studentId);
    Task<List<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId);
}

