@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Name of the backend App Service')
param backendAppName string = 'kgp-backend-${uniqueString(resourceGroup().id)}'

@description('Name of the frontend App Service')
param frontendAppName string = 'kgp-frontend-${uniqueString(resourceGroup().id)}'

@description('App Service plan name')
param appServicePlanName string = 'kgp-plan'

@description('App Service SKU')
param skuName string = 'B1'

@description('App Service tier')
param skuTier string = 'Basic'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    reserved: true
  }
}

resource backendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: backendAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'JAVA|21-java21'
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8081'
        }
        {
          name: 'DB_URL'
          value: 'jdbc:mysql://knowledge-gap-db-knowledge-gap-db.g.aivencloud.com:25505/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC'
        }
        {
          name: 'DB_USERNAME'
          value: 'avnadmin'
        }
        {
          name: 'DB_PASSWORD'
          value: 'REPLACE_WITH_SECURE_PASSWORD'
        }
        {
          name: 'MAIL_USERNAME'
          value: 'REPLACE_WITH_MAIL_USERNAME'
        }
        {
          name: 'MAIL_PASSWORD'
          value: 'REPLACE_WITH_MAIL_PASSWORD'
        }
        {
          name: 'GEMINI_API_KEY'
          value: 'REPLACE_WITH_GEMINI_KEY'
        }
      ]
    }
  }
}

resource frontendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: frontendAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'VITE_API_URL'
          value: 'https://${backendApp.properties.defaultHostName}/api'
        }
      ]
    }
  }
}

output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendUrl string = 'https://${frontendApp.properties.defaultHostName}'
