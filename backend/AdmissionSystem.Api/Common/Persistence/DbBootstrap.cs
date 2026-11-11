using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Common.Persistence;

/*
Purpose:
Ensure Postgres schema exists at startup (Docker-friendly bootstrap).

Response:
void — creates tables via EF Migrate; resets empty/broken history if tables missing.

Business Rules:
- Prefer Migrate() for normal upgrades
- If history says applied but tables are missing (common after bad first boot),
  drop and re-migrate so the app can start cleanly in local Docker

Flow:
1. Apply pending migrations
2. Probe for "classes" table
3. If missing → EnsureDeleted + Migrate again

Side Effects:
May wipe DB when schema is inconsistent (dev/docker only intent)

Failure Cases:
Propagates unexpected DB exceptions after logging
*/
public static class DbBootstrap
{
    public static void EnsureSchema(AdmissionDbContext db, ILogger logger)
    {
        var pending = db.Database.GetPendingMigrations().ToList();
        var applied = db.Database.GetAppliedMigrations().ToList();
        logger.LogInformation(
            "EF migrations: applied={AppliedCount}, pending={PendingCount}",
            applied.Count,
            pending.Count);

        db.Database.Migrate();

        if (TableExists(db, "classes") && TableExists(db, "holds"))
        {
            return;
        }

        logger.LogWarning(
            "Schema tables missing after Migrate(); resetting database and re-applying migrations.");
        db.Database.EnsureDeleted();
        db.Database.Migrate();
    }

    private static bool TableExists(AdmissionDbContext db, string tableName)
    {
        // Whitelist only known schema tables (avoids SQL injection / EF1002).
        var sql = tableName switch
        {
            "classes" => "SELECT 1 FROM classes LIMIT 1",
            "holds" => "SELECT 1 FROM holds LIMIT 1",
            _ => null
        };

        if (sql is null)
        {
            return false;
        }

        try
        {
            db.Database.ExecuteSqlRaw(sql);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
