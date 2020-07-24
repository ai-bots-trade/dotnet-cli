# dotnet-cli
An angular inspired cli for dotnet

## Commands
### Service
<code>dn -g s -n Api</code>

Creates the following files
- ./Interfaces/IApiService.cs
- ./Services/ApiService.cs
- services.AddScoped<IApiService, ApiService>();

### Factory
<code>dn -g f -n Service</code>

Creates the following files
- ./Factories/ServiceFactory.cs

### Model 
<code>dn -g m -n Api</code>

Creates the following files
- ./Models/Api.cs
