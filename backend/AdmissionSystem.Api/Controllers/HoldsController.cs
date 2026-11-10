using System.Text.RegularExpressions;
using AdmissionSystem.Api.DTOs;
using AdmissionSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Controllers;

[ApiController]
[Route("holds")]
public class HoldsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public HoldsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpGet("{holdId}")]
    public async Task<IActionResult> GetHold(string holdId)
    {
        if (string.IsNullOrWhiteSpace(holdId))
        {
            return BadRequest(new ErrorResponse("Hold ID is required."));
        }

        var (success, hold, errorReason, statusCode) = await _admissionService.GetHoldByIdAsync(holdId);

        if (!success)
        {
            return StatusCode(statusCode, new ErrorResponse(errorReason ?? "Hold not found."));
        }

        return Ok(hold);
    }

    [HttpPost("{holdId}/confirm")]
    public async Task<IActionResult> ConfirmHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(holdId))
        {
            return BadRequest(new ErrorResponse("Hold ID is required."));
        }

        if (string.IsNullOrWhiteSpace(studentId) || !Regex.IsMatch(studentId.Trim(), @"^\d{17}$"))
        {
            return BadRequest(new ErrorResponse("Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var (success, result, errorReason, statusCode) = await _admissionService.ConfirmHoldAsync(holdId, studentId.Trim());

        if (!success)
        {
            return StatusCode(statusCode, new ErrorResponse(errorReason ?? "Failed to confirm hold."));
        }

        return Ok(result);
    }

    [HttpDelete("{holdId}")]
    public async Task<IActionResult> CancelHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(holdId))
        {
            return BadRequest(new ErrorResponse("Hold ID is required."));
        }

        if (string.IsNullOrWhiteSpace(studentId) || !Regex.IsMatch(studentId.Trim(), @"^\d{17}$"))
        {
            return BadRequest(new ErrorResponse("Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var (success, errorReason, statusCode) = await _admissionService.CancelHoldAsync(holdId, studentId.Trim());

        if (!success)
        {
            return StatusCode(statusCode, new ErrorResponse(errorReason ?? "Failed to cancel hold."));
        }

        return NoContent();
    }
}

