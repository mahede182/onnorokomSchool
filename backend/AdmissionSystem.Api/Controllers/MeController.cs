using System.Text.RegularExpressions;
using AdmissionSystem.Api.DTOs;
using AdmissionSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Controllers;

[ApiController]
[Route("me")]
public class MeController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public MeController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpGet("holds")]
    public async Task<IActionResult> GetMyHolds([FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId) || !Regex.IsMatch(studentId.Trim(), @"^\d{17}$"))
        {
            return BadRequest(new ErrorResponse("Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var holds = await _admissionService.GetStudentHoldsAsync(studentId.Trim());
        return Ok(holds);
    }
}

