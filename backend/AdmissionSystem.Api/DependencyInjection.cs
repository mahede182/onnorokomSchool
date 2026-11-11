using AdmissionSystem.Api.Features.Classes.CreateClass;
using AdmissionSystem.Api.Features.Classes.GetClassById;
using AdmissionSystem.Api.Features.Classes.GetClasses;
using AdmissionSystem.Api.Features.Config.GetConfig;
using AdmissionSystem.Api.Features.Holds.CancelHold;
using AdmissionSystem.Api.Features.Holds.ConfirmHold;
using AdmissionSystem.Api.Features.Holds.CreateHold;
using AdmissionSystem.Api.Features.Holds.GetHold;
using AdmissionSystem.Api.Features.Holds.GetMyHolds;
using AdmissionSystem.Api.Infrastructure.Background;

namespace AdmissionSystem.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddFeatureHandlers(this IServiceCollection services)
    {
        services.AddScoped<CreateClass.Handler>();
        services.AddScoped<GetClasses.Handler>();
        services.AddScoped<GetClassById.Handler>();
        services.AddScoped<CreateHold.Handler>();
        services.AddScoped<GetHold.Handler>();
        services.AddScoped<ConfirmHold.Handler>();
        services.AddScoped<CancelHold.Handler>();
        services.AddScoped<GetMyHolds.Handler>();
        services.AddScoped<GetConfig.Handler>();
        services.AddHostedService<ExpiredHoldCleanerService>();
        return services;
    }
}
