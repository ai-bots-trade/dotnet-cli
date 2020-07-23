using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AiBotsTrade.Api.Interfaces;
using AiBotsTrade.Api.Models;
using AiBotsTrade.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AiBotsTrade.Api
{
    public class Startup
    {
        readonly string AllowOrigin = "_myAllowSpecificOrigins";
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(AllowOrigin,
                    builder => builder.WithOrigins("http://localhost:4200").AllowAnyMethod()
                        .AllowAnyHeader());
            });
            services.AddDbContext<DatabaseContext>(opt =>
                opt.UseSqlite(@"Data Source=apibotstrade.db;"));
            services.AddControllers();
			services.AddScoped<IApiService, ApiService>();
            services.AddScoped<IExchangeService, ExchangeService>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IIndicatorService, IndicatorService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseCors(AllowOrigin);

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}
