using AdmissionSystem.Api.Common.Domain;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Common.Persistence;

public class AdmissionDbContext : DbContext
{
    public AdmissionDbContext(DbContextOptions<AdmissionDbContext> options) : base(options)
    {
    }

    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<HoldEntity> Holds => Set<HoldEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClassEntity>(entity =>
        {
            entity.ToTable("classes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasMaxLength(50);
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.TotalSeats).HasColumnName("total_seats").IsRequired();
            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        modelBuilder.Entity<HoldEntity>(entity =>
        {
            entity.ToTable("holds");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasMaxLength(50);
            entity.Property(e => e.ClassId).HasColumnName("class_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.StudentId).HasColumnName("student_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            entity.Property(e => e.ExpiresAt)
                  .HasColumnName("expires_at")
                  .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            entity.HasOne(e => e.Class)
                  .WithMany(c => c.Holds)
                  .HasForeignKey(e => e.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ClassId);
            entity.HasIndex(e => e.StudentId);
            entity.HasIndex(e => new { e.ClassId, e.Status });
            entity.HasIndex(e => new { e.ClassId, e.StudentId });
        });
    }
}
