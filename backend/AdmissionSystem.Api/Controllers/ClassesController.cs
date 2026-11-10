using System.Text.RegularExpressions;
using AdmissionSystem.Api.DTOs;
using AdmissionSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public ClassesController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new ErrorResponse("Class name is required."));
        }

        if (request.TotalSeats <= 0)
        {
            return BadRequest(new ErrorResponse("Total seats must be greater than 0."));
        }

        var result = await _admissionService.CreateClassAsync(request);
        return StatusCode(201, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetClasses()
    {
        var classes = await _admissionService.GetAllClassesAsync();
        return Ok(classes);
    }

    [HttpGet("{classId}")]
    public async Task<IActionResult> GetClass(string classId)
    {
        if (string.IsNullOrWhiteSpace(classId))
        {
            return BadRequest(new ErrorResponse("Invalid class ID."));
        }

        var cls = await _admissionService.GetClassByIdAsync(classId);
        if (cls == null)
        {
            return NotFound(new ErrorResponse("Class not found."));
        }

        return Ok(cls);
    }

    [HttpPost("{classId}/holds")]
    public async Task<IActionResult> CreateHold(
        string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(classId))
        {
            return BadRequest(new ErrorResponse("Class ID is required."));
        }

        if (string.IsNullOrWhiteSpace(studentId) || !Regex.IsMatch(studentId.Trim(), @"^\d{17}$"))
        {
            return BadRequest(new ErrorResponse("Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var (success, hold, errorReason, statusCode) = await _admissionService.CreateHoldAsync(classId, studentId.Trim());

        if (!success)
        {
            return StatusCode(statusCode, new ErrorResponse(errorReason ?? "Failed to create hold."));
        }

        return StatusCode(201, hold);
    }
}

