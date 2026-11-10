using System.ComponentModel.DataAnnotations;

namespace AdmissionSystem.Api.DTOs;

public record CreateClassRequest(
    [Required(ErrorMessage = "Class name is required.")]
    string Name,

    [Range(1, 100000, ErrorMessage = "Total seats must be greater than 0.")]
    int TotalSeats
);

public record ClassResponse(
    string Id,
    string Name,
    int TotalSeats
);

public record ClassDetailResponse(
    string Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats
);

