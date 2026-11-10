using System.Data;
using AdmissionSystem.Api.Data;
using AdmissionSystem.Api.DTOs;
using AdmissionSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Services;

public class AdmissionService : IAdmissionService
{
    private readonly AdmissionDbContext _context;
    private readonly int _holdDurationSeconds;
    private readonly ILogger<AdmissionService> _logger;

    public AdmissionService(
        AdmissionDbContext context,
        IConfiguration configuration,
        ILogger<AdmissionService> logger)
    {
        _context = context;
        _logger = logger;

        var holdDurationEnv = Environment.GetEnvironmentVariable("HOLD_DURATION_SECONDS")
                              ?? configuration["HOLD_DURATION_SECONDS"]
                              ?? "600";

        if (!int.TryParse(holdDurationEnv, out _holdDurationSeconds) || _holdDurationSeconds <= 0)
        {
            _holdDurationSeconds = 600;
        }
    }

    public async Task<ClassResponse> CreateClassAsync(CreateClassRequest request)
    {
        var classId = $"c_{Guid.NewGuid():N}"[..10];
        var entity = new ClassEntity
        {
            Id = classId,
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats,
            CreatedAt = DateTime.UtcNow
        };

        _context.Classes.Add(entity);
        await _context.SaveChangesAsync();

        return new ClassResponse(entity.Id, entity.Name, entity.TotalSeats);
    }

    public async Task<List<ClassDetailResponse>> GetAllClassesAsync()
    {
        var now = DateTime.UtcNow;

        var classes = await _context.Classes
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        var result = new List<ClassDetailResponse>();

        foreach (var cls in classes)
        {
            var confirmedSeats = await _context.Holds
                .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Confirmed)
                .CountAsync();

            var heldSeats = await _context.Holds
                .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Held && h.ExpiresAt > now)
                .CountAsync();

            var availableSeats = Math.Max(0, cls.TotalSeats - confirmedSeats - heldSeats);

            result.Add(new ClassDetailResponse(
                cls.Id,
                cls.Name,
                cls.TotalSeats,
                heldSeats,
                confirmedSeats,
                availableSeats
            ));
        }

        return result;
    }

    public async Task<ClassDetailResponse?> GetClassByIdAsync(string classId)
    {
        var cls = await _context.Classes.FindAsync(classId);
        if (cls == null) return null;

        var now = DateTime.UtcNow;

        var confirmedSeats = await _context.Holds
            .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Confirmed)
            .CountAsync();

        var heldSeats = await _context.Holds
            .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Held && h.ExpiresAt > now)
            .CountAsync();

        var availableSeats = Math.Max(0, cls.TotalSeats - confirmedSeats - heldSeats);

        return new ClassDetailResponse(
            cls.Id,
            cls.Name,
            cls.TotalSeats,
            heldSeats,
            confirmedSeats,
            availableSeats
        );
    }

    public async Task<(bool Success, HoldResponse? Hold, string? ErrorReason, int StatusCode)> CreateHoldAsync(string classId, string studentId)
    {
        // Begin transaction to guarantee atomicity and concurrency control
        using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        try
        {
            // Acquire row lock in PostgreSQL to serialize concurrent requests for the exact same class
            if (_context.Database.IsRelational())
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"SELECT id FROM classes WHERE id = {classId} FOR UPDATE");
            }

            var cls = await _context.Classes.FindAsync(classId);
            if (cls == null)
            {
                await tx.RollbackAsync();
                return (false, null, "Class not found", 404);
            }

            var now = DateTime.UtcNow;

            // Rule 3: A student cannot have more than ONE active application or confirmed admission in the same class
            var activeStudentCount = await _context.Holds
                .Where(h => h.ClassId == classId && h.StudentId == studentId &&
                            (h.Status == HoldStatus.Confirmed ||
                             (h.Status == HoldStatus.Held && h.ExpiresAt > now)))
                .CountAsync();

            if (activeStudentCount > 0)
            {
                await tx.RollbackAsync();
                return (false, null, "Student already has an active hold or confirmed admission in this class.", 409);
            }

            // Rule 1: At no point can (held + confirmed) exceed totalSeats
            var confirmedSeats = await _context.Holds
                .Where(h => h.ClassId == classId && h.Status == HoldStatus.Confirmed)
                .CountAsync();

            var heldSeats = await _context.Holds
                .Where(h => h.ClassId == classId && h.Status == HoldStatus.Held && h.ExpiresAt > now)
                .CountAsync();

            if (confirmedSeats + heldSeats >= cls.TotalSeats)
            {
                await tx.RollbackAsync();
                return (false, null, "Seat not available.", 409);
            }

            var expiresAt = now.AddSeconds(_holdDurationSeconds);
            var hold = new HoldEntity
            {
                Id = $"h_{Guid.NewGuid():N}"[..10],
                ClassId = classId,
                StudentId = studentId,
                Status = HoldStatus.Held,
                CreatedAt = now,
                ExpiresAt = expiresAt
            };

            _context.Holds.Add(hold);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            var response = new HoldResponse(
                hold.Id,
                hold.ClassId,
                hold.StudentId,
                hold.Status,
                hold.ExpiresAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            );

            return (true, response, null, 201);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while creating hold for class {ClassId} and student {StudentId}", classId, studentId);
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<(bool Success, HoldStatusResponse? Hold, string? ErrorReason, int StatusCode)> GetHoldByIdAsync(string holdId)
    {
        var hold = await _context.Holds.FindAsync(holdId);
        if (hold == null)
        {
            return (false, null, "Hold not found.", 404);
        }

        var status = hold.Status;
        if (status == HoldStatus.Held && hold.ExpiresAt <= DateTime.UtcNow)
        {
            status = HoldStatus.Expired;
        }

        var response = new HoldStatusResponse(
            hold.Id,
            hold.ClassId,
            status,
            hold.ExpiresAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );

        return (true, response, null, 200);
    }

    public async Task<(bool Success, HoldConfirmResponse? Result, string? ErrorReason, int StatusCode)> ConfirmHoldAsync(string holdId, string studentId)
    {
        using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        try
        {
            if (_context.Database.IsRelational())
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"SELECT id FROM holds WHERE id = {holdId} FOR UPDATE");
            }

            var hold = await _context.Holds.FindAsync(holdId);
            if (hold == null)
            {
                await tx.RollbackAsync();
                return (false, null, "Hold not found.", 404);
            }

            // Rule: Only the student themselves can confirm their own hold
            if (hold.StudentId != studentId)
            {
                await tx.RollbackAsync();
                return (false, null, "Hold belongs to a different student.", 403);
            }

            // Rule 5: If confirm is called multiple times on the same hold, confirmedSeats increases only once (idempotent)
            if (hold.Status == HoldStatus.Confirmed)
            {
                await tx.CommitAsync();
                return (true, new HoldConfirmResponse(hold.Id, HoldStatus.Confirmed), null, 200);
            }

            if (hold.Status == HoldStatus.Cancelled)
            {
                await tx.RollbackAsync();
                return (false, null, "Cancelled hold cannot be confirmed.", 400);
            }

            // Rule 4: Only non-expired HELD applications can be confirmed
            if (hold.Status != HoldStatus.Held || hold.ExpiresAt <= DateTime.UtcNow)
            {
                if (hold.Status == HoldStatus.Held)
                {
                    hold.Status = HoldStatus.Expired;
                    await _context.SaveChangesAsync();
                }
                await tx.CommitAsync();
                return (false, null, "Hold has expired and cannot be confirmed.", 400);
            }

            hold.Status = HoldStatus.Confirmed;
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return (true, new HoldConfirmResponse(hold.Id, HoldStatus.Confirmed), null, 200);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while confirming hold {HoldId}", holdId);
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<(bool Success, string? ErrorReason, int StatusCode)> CancelHoldAsync(string holdId, string studentId)
    {
        var hold = await _context.Holds.FindAsync(holdId);
        if (hold == null)
        {
            return (false, "Hold not found.", 404);
        }

        if (hold.StudentId != studentId)
        {
            return (false, "Hold belongs to a different student.", 403);
        }

        if (hold.Status == HoldStatus.Confirmed)
        {
            return (false, "Confirmed admission cannot be cancelled via this endpoint.", 400);
        }

        if (hold.Status == HoldStatus.Held)
        {
            hold.Status = HoldStatus.Cancelled;
            await _context.SaveChangesAsync();
        }

        return (true, null, 204);
    }

    public async Task<List<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId)
    {
        var now = DateTime.UtcNow;

        var holds = await _context.Holds
            .Include(h => h.Class)
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return holds.Select(h =>
        {
            var status = h.Status;
            if (status == HoldStatus.Held && h.ExpiresAt <= now)
            {
                status = HoldStatus.Expired;
            }

            return new StudentHoldItemResponse(
                h.Id,
                h.ClassId,
                h.Class?.Name ?? string.Empty,
                status,
                h.ExpiresAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            );
        }).ToList();
    }
}

