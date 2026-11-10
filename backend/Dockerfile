FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AdmissionSystem.Api/AdmissionSystem.Api.csproj AdmissionSystem.Api/
RUN dotnet restore AdmissionSystem.Api/AdmissionSystem.Api.csproj

COPY AdmissionSystem.Api/ AdmissionSystem.Api/
RUN dotnet publish AdmissionSystem.Api/AdmissionSystem.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080
ENTRYPOINT ["dotnet", "AdmissionSystem.Api.dll"]

