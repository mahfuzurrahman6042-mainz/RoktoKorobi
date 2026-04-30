import { NextRequest, NextResponse } from 'next/server';
import { deploymentManager, productionDeployer } from '@/lib/deployment';
import { validateCSRFToken } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Get current deployment configuration
    const config = deploymentManager.getConfiguration();
    const validation = deploymentManager.validateConfiguration();

    // Generate deployment files
    const scripts = deploymentManager.generateDeploymentScripts();
    const dockerConfig = deploymentManager.generateDockerConfig();
    const nginxConfig = deploymentManager.generateNginxConfig();
    const monitoringConfig = deploymentManager.generateMonitoringConfig();
    const envVars = deploymentManager.generateEnvironmentVariables();

    return NextResponse.json({
      success: true,
      data: {
        configuration: config,
        validation,
        deployment: {
          scripts,
          dockerConfig,
          nginxConfig,
          monitoringConfig,
          environmentVariables: envVars
        },
        status: {
          environment: config.environment,
          isProduction: config.environment === 'production',
          lastValidated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.logApiError('deployment', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, options } = body;

    switch (action) {
      case 'validate':
        // Validate deployment configuration
        const validation = deploymentManager.validateConfiguration();
        
        logger.logApiSuccess('deployment', {
          action: 'validate',
          valid: validation.valid,
          errors: validation.errors
        });

        return NextResponse.json({
          success: true,
          message: validation.valid ? 'Configuration is valid' : 'Configuration validation failed',
          data: validation
        });

      case 'deploy':
        // Perform deployment
        const deployResult = await productionDeployer.deploy();
        
        logger.logApiSuccess('deployment', {
          action: 'deploy',
          success: deployResult.success,
          message: deployResult.message
        });

        return NextResponse.json({
          success: deployResult.success,
          message: deployResult.message,
          data: {
            rollbackAvailable: deployResult.rollbackAvailable
          }
        });

      case 'rollback':
        // Rollback deployment
        const rollbackResult = await productionDeployer.rollback();
        
        logger.logApiSuccess('deployment', {
          action: 'rollback',
          success: rollbackResult.success,
          message: rollbackResult.message
        });

        return NextResponse.json({
          success: rollbackResult.success,
          message: rollbackResult.message
        });

      case 'health-check':
        // Run health checks
        const healthResult = await productionDeployer['runHealthChecks']();
        
        logger.logApiSuccess('deployment', {
          action: 'health-check',
          success: healthResult
        });

        return NextResponse.json({
          success: healthResult,
          message: healthResult ? 'All health checks passed' : 'Health checks failed'
        });

      case 'generate-files':
        // Generate deployment files
        const scripts = deploymentManager.generateDeploymentScripts();
        const dockerConfig = deploymentManager.generateDockerConfig();
        const nginxConfig = deploymentManager.generateNginxConfig();
        const monitoringConfig = deploymentManager.generateMonitoringConfig();
        const envVars = deploymentManager.generateEnvironmentVariables();

        logger.logApiSuccess('deployment', {
          action: 'generate-files'
        });

        return NextResponse.json({
          success: true,
          message: 'Deployment files generated',
          data: {
            scripts,
            dockerConfig,
            nginxConfig,
            monitoringConfig,
            environmentVariables: envVars
          }
        });

      case 'update-config':
        // Update deployment configuration
        if (!options?.updates) {
          return NextResponse.json(
            { error: 'Configuration updates are required' },
            { status: 400 }
          );
        }

        deploymentManager.updateConfiguration(options.updates);
        
        logger.logApiSuccess('deployment', {
          action: 'update-config',
          updates: Object.keys(options.updates)
        });

        return NextResponse.json({
          success: true,
          message: 'Configuration updated successfully',
          data: deploymentManager.getConfiguration()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.logApiError('deployment', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
