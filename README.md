# dotnet-cli
An angular inspired cli for dotnet

## Commands
### Controller

./Controllers/ApiController

<code>dn -g c -n Api</code>

### Service

./Interfaces/IApiService

./Services/ApiService

services.AddScoped<IApiService, ApiService>();

<code>dn -g s -n Api</code>
