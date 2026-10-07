# Один образ = React-фронт + ASP.NET API. Збирається з кореня TaroSideIA.

# 1) Фронт: npm ci + vite build → /fe/dist
FROM node:22-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Порожній URL → запити йдуть на той самий домен (/api/...).
ENV VITE_API_URL=""
RUN npm run build

# 2) Бекенд: dotnet publish → /app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend
WORKDIR /src
COPY backend/ ./
RUN dotnet publish TaroSideAI.API/TaroSideAI.API.csproj -c Release -o /app

# 3) Рантайм: лише ASP.NET runtime + результати двох попередніх етапів
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=backend /app ./
COPY --from=frontend /fe/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaroSideAI.API.dll"]
