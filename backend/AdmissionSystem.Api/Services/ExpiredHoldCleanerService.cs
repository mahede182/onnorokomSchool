using AdmissionSystem.Api.Data;
using AdmissionSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Services;

public class ExpiredHoldCleanerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiredHoldCleanerService> _logger;

    public ExpiredHoldCleanerService(
        IServiceProvider serviceProvider,
        ILogger<ExpiredHoldCleanerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ExpiredHoldCleanerService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AdmissionDbContext>();

                var now = DateTime.UtcNow;
                var expiredHolds = await context.Holds
                    .Where(h => h.Status == HoldStatus.Held && h.ExpiresAt <= now)
                    .ToListAsync(stoppingToken);

                if (expiredHolds.Count > 0)
                {
                    foreach (var hold in expiredHolds)
                    {
                        hold.Status = HoldStatus.Expired;
                    }

                    await context.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Marked {Count} holds as EXPIRED.", expiredHolds.Count);
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error while cleaning expired holds.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("ExpiredHoldCleanerService stopped.");
    }
}

