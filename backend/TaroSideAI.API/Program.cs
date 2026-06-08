using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OllamaSharp;
using TaroSideAI.Application.DI;
using TaroSideAI.Application.Options;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;
using TaroSideAI.Infrastructure.DI;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────
// 1. DATABASE
// ──────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ──────────────────────────────────────────────
// 2. IDENTITY
// ──────────────────────────────────────────────
builder.Services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();


// ──────────────────────────────────────────────
// 3. JWT AUTHENTICATION
// ──────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"]!;

builder.Services.Configure<JwtSettings>(jwtSection);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// ──────────────────────────────────────────────
// 4. CORS
// ──────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ──────────────────────────────────────────────
// 5. APPLICATION SERVICES & REPOSITORIES
// ──────────────────────────────────────────────
// Scoped = один екземпляр на HTTP запит (стандарт для репозиторіїв і сервісів)

builder.Services.Configure<AiSettings>(builder.Configuration.GetSection("Ollama"));

builder.Services.AddSingleton<IChatClient>(sp =>
{
    var cfg = builder.Configuration.GetSection("Ollama").Get<AiSettings>()!;
    IChatClient ollama = new OllamaApiClient(new Uri(cfg.OpenAiApiUrl), cfg.OpenAiModel);
    return new ChatClientBuilder(ollama)
        .UseFunctionInvocation()
        .Build();
});

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);


// ──────────────────────────────────────────────
// 6. CONTROLLERS + SWAGGER
// ──────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TaroSideAI API", Version = "v1" });

    // Дозволяємо вставляти JWT токен прямо в Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введіть: Bearer {токен}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            []
        }
    });
});

// ──────────────────────────────────────────────
// PIPELINE
// ──────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication(); // ВАЖЛИВО: спочатку Authentication, потім Authorization
app.UseAuthorization();
app.MapControllers();

app.Run();
